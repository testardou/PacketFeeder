import os

from cli.modules.base import BaseModule
from core.replay.rewrite_packets import rewrite_packets
from core.utils.filter_packets import filter_packets
from core.utils.get_ifaces import get_ifaces
from core.utils.get_project_root import get_project_root
from core.utils.get_tactic_dir import get_tactic_dir
from core.utils.list_pcaps_for_technique import list_pcaps_for_technique
from core.utils.list_tactics import list_tactics
from core.utils.list_techniques_for_tactic import list_techniques_for_tactic
from core.utils.parse_mapping import parse_mapping
from core.utils.print_pcaps_from_technique_table import print_pcaps_from_technique_table
from core.utils.print_tactics_table import print_tactics_table
from core.utils.print_techniques_from_tactic_table import print_techniques_from_tactic_table
from core.utils.read_pcap import read_pcap
from core.utils.replay_with_speed import replay_with_speed


class MitreModule(BaseModule):
    name = "mitre"
    description = "Browse and replay MITRE ATT&CK tactics, techniques and pcaps"

    def __init__(self):
        super().__init__()
        root_dir = get_project_root()
        ifaces = get_ifaces()
        self.register_option('iface','Selected iface where the packets will be sent', required=True, default=ifaces[0])
        self.register_option("speed", '0 = real-time, 1 = rapide avec progress bar, 2 = full speed.', default=0)
        self.register_option("pcap", 'PCAP file path.', required=True)
        self.register_option("index", 'Replay only a specific packet by index (0-based).', default=None)
        self.register_option("range", 'Replay a range of packets by index (0-based). Format: start-end.', default=None)
        self.register_option("ip", 'Rewrite IP. Format: old=new old=new')
        self.register_option("ipv6", 'Rewrite IPV6. Format: old=new old=new')
        self.register_option("mac", 'Rewrite MAC. Format: old=new old=new')
        self.register_option("arp-ip", 'Rewrite ARP IP. Format: old=new old=new')
        self.register_option("dns", 'Rewrite DNS domain. Format: old=new old=new')
        self.register_option("tcp", 'Rewrite TCP port. Format: old=new old=new')
        self.register_option("udp", 'Rewrite UDP port. Format: old=new old=new')


    def do_show(self, args):                                                                              
        """Show mitre data: show tactics | show techniques <tactic_id> | show pcaps <technique_id>"""
        parts = args.strip().split(" ", 1)                                                                
        cmd = parts[0]
        arg = parts[1] if len(parts) > 1 else None                                                        
                                                                                                            
        if cmd == "tactics":
            tactics = list_tactics()
            if not tactics:
                print("[Mitre] No tactic found in 'mitre/tactics' directory.")
                return
            print_tactics_table(tactics)
        elif cmd == "techniques" and arg:
            techniques = list_techniques_for_tactic(arg)
            if techniques is None:
                print(f"[Mitre] Error: tactic '{arg}' not found.")
                return
            if not techniques:
                print(f"[Mitre] No technique found for tactic '{arg}'.")
                return
            print_techniques_from_tactic_table(techniques, arg)
        elif cmd == "pcaps" and arg:                                                                      
            pcaps = list_pcaps_for_technique(arg)
            if pcaps is None:
                print(f"[Mitre] Error: technique '{arg}' not found.")
                return
            if not pcaps:
                print(f"[Mitre] No pcap found for technique '{arg}'.")
                return
            print_pcaps_from_technique_table(pcaps, arg)   
        else:                                                                                             
            print("Usage: show tactics | show techniques <tactic_id> | show pcaps <technique_id>")

    def complete_show(self, text, line, begidx, endidx):                                                  
      parts = line.split(" ")                                                                           
      if len(parts) == 2:                                                                               
          options = ["tactics", "techniques", "pcaps"]                                                  
          return [o for o in options if o.startswith(text)]                                             
      return []
    
    def _execute(self):
        pcap_path = self.get_option('pcap')
        iface = self.get_option('iface')
        speed = self.get_option('speed')
        pkt_index = self.get_option('index')
        pkt_range = self.get_option('range')
        if not os.path.isfile(pcap_path):
            print(f'File not found: {pcap_path}')
            return
        packets = read_pcap(pcap_path)
        ip_map = parse_mapping(self.get_option('ip').split()) if self.get_option('ip') else None             
        mac_map = parse_mapping(self.get_option('mac').split()) if self.get_option('mac') else None             
        ipv6_map = parse_mapping(self.get_option('ipv6').split()) if self.get_option('ipv6') else None             
        arp_ip_map = parse_mapping(self.get_option('arp-ip').split()) if self.get_option('arp-ip') else None             
        dns_map = parse_mapping(self.get_option('dns').split()) if self.get_option('dns') else None             
        tcp_map = parse_mapping(self.get_option('tcp').split()) if self.get_option('tcp') else None             
        udp_map = parse_mapping(self.get_option('udp').split()) if self.get_option('udp') else None
        has_rewrite = any([
            ip_map, mac_map, ipv6_map, arp_ip_map,
            dns_map, tcp_map, udp_map
        ])
        packets = filter_packets(packets=packets, pkt_index=pkt_index, pkt_range=pkt_range)
        if has_rewrite:
            packets = rewrite_packets(packets, ip_map, mac_map, ipv6_map, arp_ip_map, dns_map, tcp_map, udp_map)
        replay_with_speed(packets=packets, iface=iface, speed=int(speed))
                                                                          