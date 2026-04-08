import logging
from scapy.all import sendp
from scapy.error import Scapy_Exception

logger = logging.getLogger(__name__)


def send_pcap(packets, iface):
    """
    Send packets on the specified interface.
    
    Args:
        packets: Single packet or list of packets to send
        iface: Network interface name to send packets on
    
    Raises:
        ValueError: If iface is None or empty
        OSError: If interface is not available or permission denied
        Scapy_Exception: If Scapy encounters an error sending packets
    """
    if not iface:
        error_msg = "Interface name cannot be empty"
        logger.error(error_msg)
        raise ValueError(error_msg)
    
    if not packets:
        logger.warning("No packets to send")
        return
    
    try:
        sendp(packets, iface=iface, verbose=False)
        packet_count = len(packets) if isinstance(packets, list) else 1
        logger.debug(f"Successfully sent {packet_count} packet(s) on interface {iface}")
    except Scapy_Exception as e:
        error_msg = f"Scapy error sending packets on interface {iface}: {e}"
        logger.error(error_msg)
        raise
    except OSError as e:
        if "No such device" in str(e) or "No such file or directory" in str(e):
            error_msg = f"Interface '{iface}' not found or not available"
        elif "Permission denied" in str(e):
            error_msg = f"Permission denied: insufficient privileges to send packets on interface '{iface}'"
        else:
            error_msg = f"OS error sending packets on interface {iface}: {e}"
        logger.error(error_msg)
        raise OSError(error_msg) from e
    except Exception as e:
        error_msg = f"Unexpected error sending packets on interface {iface}: {e}"
        logger.error(error_msg, exc_info=True)
        raise