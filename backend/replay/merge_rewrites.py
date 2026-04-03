"""
Merge per-pcap and global rewrite maps.
Global rewrites take priority over per-pcap rewrites on conflict.
"""



from core.rewrite.rewrite_params import REWRITE_KEY_TO_PARAM


def _parse_rewrite_list(rewrite_list):
    """Convert a list of {old, new} dicts to a mapping dict."""
    if not rewrite_list:
        return {}
    mapping = {}
    for rule in rewrite_list:
        old = rule.get("old")
        new = rule.get("new")
        if old and new:
            mapping[old.strip()] = new.strip()
    return mapping




def merge_rewrite_maps(per_pcap_raw, global_raw):
    """
    Merge per-pcap and global rewrite maps.

    Both per_pcap_raw and global_raw are dicts with keys like
   "ip", "mac", etc., each containing a list of {old, new}.

    Global wins on conflict: {**per_pcap, **global}

    Returns dict with keys: ip_map, mac_map, ipv6_map, arp_ip_map,
    dns_domain_map, tcp_port_map, udp_port_map
    """
    per_pcap_raw = per_pcap_raw or {}
    global_raw = global_raw or {}

    result = {}
    for key, param in REWRITE_KEY_TO_PARAM.items():
        per_pcap_map = _parse_rewrite_list(per_pcap_raw.get(key, []))
        global_map = _parse_rewrite_list(global_raw.get(key, []))
        merged = {**per_pcap_map, **global_map}
        if merged:
            result[param] = merged

    return result

