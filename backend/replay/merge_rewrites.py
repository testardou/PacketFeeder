"""
Merge per-pcap and global rewrite maps.
Global rewrites take priority over per-pcap rewrites on conflict.
"""


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


REWRITE_KEYS = [
    "rewriteIps",
    "rewriteMacs",
    "rewriteIpv6s",
    "rewriteArpIps",
    "rewriteDnsDomains",
    "rewriteTcpPorts",
    "rewriteUdpPorts",
]


def merge_rewrite_maps(per_pcap_raw, global_raw):
    """
    Merge per-pcap and global rewrite maps.

    Both per_pcap_raw and global_raw are dicts with keys like
    "rewriteIps", "rewriteMacs", etc., each containing a list of {old, new}.

    Global wins on conflict: {**per_pcap, **global}

    Returns dict with keys: ip_map, mac_map, ipv6_map, arp_ip_map,
    dns_domain_map, tcp_port_map, udp_port_map
    """
    per_pcap_raw = per_pcap_raw or {}
    global_raw = global_raw or {}

    result_keys = [
        "ip_map", "mac_map", "ipv6_map", "arp_ip_map",
        "dns_domain_map", "tcp_port_map", "udp_port_map",
    ]

    result = {}
    for rewrite_key, result_key in zip(REWRITE_KEYS, result_keys):
        per_pcap_map = _parse_rewrite_list(per_pcap_raw.get(rewrite_key, []))
        global_map = _parse_rewrite_list(global_raw.get(rewrite_key, []))
        # Global wins on conflict
        merged = {**per_pcap_map, **global_map}
        result[result_key] = merged

    return result
