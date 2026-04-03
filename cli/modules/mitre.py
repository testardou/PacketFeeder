import os

from cli.mixins.infos import InfosMixin
from cli.mixins.rewrite import RewriteMixin
from cli.modules.base import BaseModule

from core.replay.rewrite_packets import rewrite_packets
from core.rewrite.rewrite_params import build_rewrite_kwargs
from core.utils.filter_packets import filter_packets
from core.utils.get_ifaces import get_ifaces
from core.utils.list_pcaps_for_technique import list_pcaps_for_technique
from core.utils.list_tactics import list_tactics
from core.utils.list_techniques_for_tactic import list_techniques_for_tactic
from core.utils.print_pcaps_from_technique_table import print_pcaps_from_technique_table
from core.utils.print_tactics_table import print_tactics_table
from core.utils.print_techniques_from_tactic_table import print_techniques_from_tactic_table
from core.utils.read_pcap import read_pcap
from core.utils.replay_with_speed import replay_with_speed


class MitreModule(RewriteMixin, InfosMixin, BaseModule):
    name = "mitre"
    description = "Browse and replay MITRE ATT&CK tactics, techniques and pcaps"

    def __init__(self):
        super().__init__()
        ifaces = get_ifaces()
        self.register_option('iface','Selected iface where the packets will be sent', required=True, default=ifaces[0])
        self.register_option("speed", '0 = real-time, 1 = rapide avec progress bar, 2 = full speed.', default=0)
        self.register_option("pcap", 'PCAP file path.', required=True)
        self.register_option("index", 'Replay only a specific packet by index (0-based).', default=None)
        self.register_option("range", 'Replay a range of packets by index (0-based). Format: start-end.', default=None)


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
        packets = filter_packets(packets=packets, pkt_index=pkt_index, pkt_range=pkt_range)
        if self.rewrites:                                                                                                                                                                                            
          packets = rewrite_packets(                                                                                                                                                                               
              packets,
              **build_rewrite_kwargs(self.rewrites)
          )
        replay_with_speed(packets=packets, iface=iface, speed=int(speed))
                                                                          