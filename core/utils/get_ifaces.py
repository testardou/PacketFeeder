from scapy.all import get_if_list, conf

def get_ifaces():
    default_iface = conf.iface.name
    all_ifaces = get_if_list()
    interfaces = [default_iface] + [iface for iface in all_ifaces if iface != default_iface]
    return interfaces