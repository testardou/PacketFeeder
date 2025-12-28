"""
Common replay loop logic shared across different replay modes.
"""
import logging
from backend.extension import socketio
from backend.sockets.realtime import should_run, running_status
from core.utils.send_pcap import send_pcap
import time

logger = logging.getLogger(__name__)


def replay_loop_common(packets, iface, sid, mode="fastest", emit_progress=True):
    """
    Common replay loop that can be used by different replay modes.
    
    Args:
        packets: List of packets to replay
        iface: Network interface to send packets on
        sid: Session ID
        mode: Replay mode - "realtime", "faster", or "fastest"
        emit_progress: Whether to emit progress updates via socketio
    
    Returns:
        Number of packets actually sent
    """
    total = len(packets)
    if total == 0:
        running_status[sid] = False
        socketio.emit("run_status", {"sid": sid, "running": False}, room=sid, namespace="/realtime")
        return 0
    
    # Fastest mode: send all packets at once without any control
    if mode == "fastest":
        try:
            send_pcap(packets, iface)
            logger.info(f"Successfully sent {total} packets in fastest mode for SID {sid}")
        except (OSError, ValueError) as e:
            error_msg = f"Failed to send packets in fastest mode for SID {sid} on interface {iface}: {e}"
            logger.error(error_msg)
            socketio.emit("replay_error", {
                "sid": sid,
                "error": str(e),
                "message": error_msg
            }, room=sid, namespace="/realtime")
            raise
        except Exception as e:
            error_msg = f"Unexpected error during fastest replay for SID {sid}: {e}"
            logger.error(error_msg, exc_info=True)
            socketio.emit("replay_error", {
                "sid": sid,
                "error": str(e),
                "message": error_msg
            }, room=sid, namespace="/realtime")
            raise
        finally:
            running_status[sid] = False
            socketio.emit("run_status", {"sid": sid, "running": False}, room=sid, namespace="/realtime")
        return total
    
    # For realtime and faster modes, send packets one by one
    first_timestamp = float(packets[0].time) if packets else 0
    last_timestamp = float(packets[-1].time) if packets else 0
    prev_timestamp = None if mode == "realtime" else first_timestamp
    
    packets_sent = 0
    
    try:
        for i, pkt in enumerate(packets):
            # Check if should stop before processing each packet
            if not should_run.get(sid, False):
                logger.info(f"Replay halted for SID {sid}")
                break
            
            timestamp = float(pkt.time)
            
            # Emit progress if enabled
            if emit_progress:
                progress = float((i + 1) / total * 100.0)
                remaining_time = last_timestamp - timestamp if i < total - 1 else 0
                next_packet_delay = timestamp - prev_timestamp if prev_timestamp is not None else 0
                
                socketio.emit("replay_progress", {
                    "progress": progress,
                    "index": i,
                    "timestamp": timestamp,
                    "size": len(pkt),
                    "remaining_time": remaining_time,
                    "next_packet": next_packet_delay,
                    "packet_count": total
                }, namespace="/realtime")
            
            # Handle timing based on mode
            if mode == "realtime":
                # Real-time mode: respect timestamps with incremental sleep
                if prev_timestamp is not None and timestamp > prev_timestamp:
                    sleep_duration = timestamp - prev_timestamp
                    sleep_interval = 0.1  # Check every 100ms
                    elapsed = 0.0
                    while elapsed < sleep_duration and should_run.get(sid, False):
                        sleep_time = min(sleep_interval, sleep_duration - elapsed)
                        time.sleep(sleep_time)
                        elapsed += sleep_time
                    
                    if not should_run.get(sid, False):
                        logger.info(f"Replay halted for SID {sid} during sleep")
                        break
            # For "faster" mode, no sleep needed
            
            # Send the packet
            try:
                send_pcap(pkt, iface)
                packets_sent += 1
            except (OSError, ValueError) as e:
                logger.error(f"Failed to send packet {i} for SID {sid} on interface {iface}: {e}")
                # Continue with next packet instead of stopping entire replay
                continue
            except Exception as e:
                logger.error(f"Unexpected error sending packet {i} for SID {sid}: {e}")
                # Re-raise unexpected errors
                raise
            
            # Check again after sending packet
            if not should_run.get(sid, False):
                logger.info(f"Replay halted for SID {sid}")
                break
            
            prev_timestamp = timestamp
            
    except (OSError, ValueError) as e:
        error_msg = f"Failed to send packets during replay for SID {sid} on interface {iface}: {e}"
        logger.error(error_msg)
        socketio.emit("replay_error", {
            "sid": sid,
            "error": str(e),
            "message": error_msg,
            "packets_sent": packets_sent
        }, room=sid, namespace="/realtime")
        raise
    except Exception as e:
        error_msg = f"Unexpected error during replay for SID {sid}: {e}"
        logger.error(error_msg, exc_info=True)
        socketio.emit("replay_error", {
            "sid": sid,
            "error": str(e),
            "message": error_msg,
            "packets_sent": packets_sent
        }, room=sid, namespace="/realtime")
        raise
    finally:
        # Always update status when done
        running_status[sid] = False
        socketio.emit("run_status", {"sid": sid, "running": False}, room=sid, namespace="/realtime")
        if mode == "realtime":
            socketio.emit("replay_done", {"msg": "Replay terminé"}, namespace="/realtime")
    
    return packets_sent

