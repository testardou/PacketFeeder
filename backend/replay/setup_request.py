from flask import current_app
from backend.utils.validate_file_path import validate_file_path_auto
from backend.utils.parse_rewrite_json import parse_rewrite_json
from core.replay.rewrite_packets import rewrite_packets
from core.rewrite.rewrite_params import REWRITE_KEY_TO_PARAM, build_rewrite_kwargs
from core.utils.read_pcap import read_pcap
from backend.sockets.realtime import should_run, running_status
from backend.extension import socketio
import os


def setup_request(request, apply_filter=True):
    """
    Setup and validate replay request parameters.
    
    Args:
        request: Flask request object
        apply_filter: Whether to apply index/range filtering
    
    Returns:
        tuple: (packets, iface, sid)
    
    Raises:
        ValueError: If validation fails
    """
    file = request.form.get('file')
    iface = request.form.get("iface")
    sid = request.form.get("sid")
    
    # Get index/range filtering parameters (only if apply_filter is True)
    index_str = request.form.get("index") if apply_filter else None
    range_str = request.form.get("range") if apply_filter else None
    
    current_app.logger.info("Request received: file=%s, iface=%s", file, iface)

    if not file:
        raise ValueError("Missing file parameter")
    
    # Validate file path securely (handles both UPLOAD_FOLDER files and mitre datasets)
    file_path, error = validate_file_path_auto(file)
    if error:
        raise ValueError("Invalid file path")

    rewrites = {}
    for key in REWRITE_KEY_TO_PARAM:
        raw = request.form.get(key, "")
        if raw:
            rewrites[key] = parse_rewrite_json(raw)

    rewrite_kwargs = build_rewrite_kwargs(rewrites)


    try:
        packets = read_pcap(file_path)
    except Exception as e:
        current_app.logger.error("Error reading PCAP file: %s", str(e))
        raise ValueError(f"Error reading PCAP file: {str(e)}")
    total_packets = len(packets)
    
    # Filter packets by index or range (only if apply_filter is True)
    if apply_filter:
        if index_str is not None and index_str != "":
            try:
                index = int(index_str)
                if index < 0 or index >= total_packets:
                    raise ValueError(f"Index {index} is out of range (0-{total_packets-1})")
                packets = [packets[index]]
                current_app.logger.info(f"Filtering: replaying only packet at index {index}")
            except ValueError as e:
                current_app.logger.error(f"Invalid index: {e}")
                raise
        elif range_str is not None and range_str != "":
            try:
                start_str, end_str = range_str.split("-", 1)
                start = int(start_str.strip())
                end = int(end_str.strip())
                
                if start < 0 or end >= total_packets:
                    raise ValueError(f"Range {start}-{end} is out of bounds (0-{total_packets-1})")
                if start > end:
                    raise ValueError(f"Start index {start} must be <= end index {end}")
                
                packets = packets[start:end+1]
                current_app.logger.info(f"Filtering: replaying packets from index {start} to {end} ({len(packets)} packets)")
            except ValueError as e:
                current_app.logger.error(f"Invalid range: {e}")
                raise
    
    packets = rewrite_packets(
        packets,
        **rewrite_kwargs
    )
    should_run[sid] = True
    running_status[sid] = True  # Track that replay is running
    current_app.logger.info("Should run: %s", should_run)
    socketio.emit("run_status", {"sid": sid, "running": True}, room=sid, namespace="/realtime")
    return packets, iface, sid