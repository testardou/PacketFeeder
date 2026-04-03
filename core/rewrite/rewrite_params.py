REWRITE_KEY_TO_PARAM = {                                                                                                                                                                                         
    "ip": "ip_map",
    "mac": "mac_map",                                                                                                                                                                                            
    "ipv6": "ipv6_map",                                                                                                                                                                                        
    "arp-ip": "arp_ip_map",
    "dns": "dns_domain_map",
    "tcp": "tcp_port_map",                                                                                                                                                                                       
    "udp": "udp_port_map",
}                                                                                                                                                                                                                
                                                                                                                                                                                                                
def build_rewrite_kwargs(rewrites):
    """Convert a dict like {"ip": {...}, "mac": {...}} to rewrite_packets kwargs.
                                                                                                                                                                                                                
    Returns: {"ip_map": {...}, "mac_map": {...}, ...}                                                                                                                                                            
    """                                                                                                                                                                                                          
    kwargs = {}                                                                                                                                                                                                  
    for key, mappings in rewrites.items():                                                                                                                                                                     
        param = REWRITE_KEY_TO_PARAM.get(key)                                                                                                                                                                    
        if param and mappings:
            kwargs[param] = mappings                                                                                                                                                                             
    return kwargs                                                                                                                                                                                              
                                                                                                                                                                                                                   