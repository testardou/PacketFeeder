from flask import current_app
from backend.utils.validate_file_path import validate_file_path_auto
from backend.utils.parse_rewrite_json import parse_rewrite_json
from core.replay.rewrite_packets import rewrite_packets
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
    rewrite_ips = request.form.get("rewriteIps", "")
    rewrite_macs = request.form.get("rewriteMacs", "")
    rewrite_ipv6s = request.form.get("rewriteIpv6s", "")
    rewrite_arp_ips = request.form.get("rewriteArpIps", "")
    rewrite_dns_domains = request.form.get("rewriteDnsDomains", "")
    rewrite_tcp_ports = request.form.get("rewriteTcpPorts", "")
    rewrite_udp_ports = request.form.get("rewriteUdpPorts", "")
    
    # Get index/range filtering parameters (only if apply_filter is True)
    index_str = request.form.get("index") if apply_filter else None
    range_str = request.form.get("range") if apply_filter else None
    
    current_app.logger.info("Request received: file=%s, iface=%s", file, iface)

    if not file:
        raise ValueError("Missing file parameter")
    
    # Validate file path securely (handles both UPLOAD_FOLDER files and scenario datasets)
    file_path, error = validate_file_path_auto(file)
    if error:
        raise ValueError("Invalid file path")

    mapped_rewrite_ips = {}
    mapped_rewrite_macs = {}
    mapped_rewrite_ipv6s = {}
    mapped_rewrite_arp_ips = {}
    mapped_rewrite_dns_domains = {}
    mapped_rewrite_tcp_ports = {}
    mapped_rewrite_udp_ports = {}
    
    if rewrite_ips and len(rewrite_ips) > 0:
        mapped_rewrite_ips = parse_rewrite_json(rewrite_ips)
    if rewrite_macs and len(rewrite_macs) > 0:
        mapped_rewrite_macs = parse_rewrite_json(rewrite_macs)
    if rewrite_ipv6s and len(rewrite_ipv6s) > 0:
        mapped_rewrite_ipv6s = parse_rewrite_json(rewrite_ipv6s)
    if rewrite_arp_ips and len(rewrite_arp_ips) > 0:
        mapped_rewrite_arp_ips = parse_rewrite_json(rewrite_arp_ips)
    if rewrite_dns_domains and len(rewrite_dns_domains) > 0:
        mapped_rewrite_dns_domains = parse_rewrite_json(rewrite_dns_domains)
    if rewrite_tcp_ports and len(rewrite_tcp_ports) > 0:
        mapped_rewrite_tcp_ports = parse_rewrite_json(rewrite_tcp_ports)
    if rewrite_udp_ports and len(rewrite_udp_ports) > 0:
        mapped_rewrite_udp_ports = parse_rewrite_json(rewrite_udp_ports)

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
        ip_map=mapped_rewrite_ips,
        mac_map=mapped_rewrite_macs,
        ipv6_map=mapped_rewrite_ipv6s,
        arp_ip_map=mapped_rewrite_arp_ips,
        dns_domain_map=mapped_rewrite_dns_domains,
        tcp_port_map=mapped_rewrite_tcp_ports,
        udp_port_map=mapped_rewrite_udp_ports
    )
    should_run[sid] = True
    running_status[sid] = True  # Track that replay is running
    current_app.logger.info("Should run: %s", should_run)
    socketio.emit("run_status", {"sid": sid, "running": True}, room=sid, namespace="/realtime")
    return packets, iface, sid