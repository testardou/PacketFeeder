from cli.modules.base import BaseModule
from core.utils.get_ifaces import get_ifaces
from core.utils.get_project_root import get_project_root


class MitreModule(BaseModule):
    name = "mitre"
    description = "Browse and replay MITRE ATT&CK tactics, techniques and pcaps"

    def __init__(self):
        super().__init__()
        root_dir = get_project_root()
        ifaces = get_ifaces()
        self.register_option('iface','Selected iface where the packets will be sent', required=True, default=ifaces[0])
        self.register_option("speed", '0 = real-time, 1 = rapide avec progress bar, 2 = full speed.', default=0)
        self.register_option("pcaps_dir", "Path to mitre pcaps directory", default=f'{root_dir}/pcaps/techniques')
        self.register_option("index", 'Replay only a specific packet by index (0-based).', default=None)
        self.register_option("range", 'Replay a range of packets by index (0-based). Format: start-end.', default=None)
        self.register_option("ip", 'Rewrite IP. Format: old=new old=new')
        self.register_option("ipv6", 'Rewrite IPV6. Format: old=new old=new')
        self.register_option("mac", 'Rewrite MAC. Format: old=new old=new')
        self.register_option("arp-ip", 'Rewrite ARP IP. Format: old=new old=new')
        self.register_option("dns", 'Rewrite DNS domain. Format: old=new old=new')
        self.register_option("tcp", 'Rewrite TCP port. Format: old=new old=new')
        self.register_option("udp", 'Rewrite UDP port. Format: old=new old=new')

    def do_tactics(self, _args):                                                                          
        root_dir = get_project_root()

                                                                                                        
    def do_techniques(self, args):                                                                        
        return                                                            
                                                                                                            
    def do_events(self, args):                                                                            
        return   