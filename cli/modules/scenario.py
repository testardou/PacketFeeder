import glob
import os

from cli.mixins.infos import InfosMixin
from cli.mixins.rewrite import REWRITE_TYPES, RewriteMixin
from cli.modules.base import BaseModule
from core.rewrite.rewrite_params import REWRITE_KEY_TO_PARAM
from core.utils.get_ifaces import get_ifaces
from core.utils.merge_pcaps import merge_pcaps
from core.utils.parse_mapping import parse_mapping
from core.utils.replay_with_speed import replay_with_speed

class ScenarioModule(RewriteMixin, InfosMixin, BaseModule):
    name = "scenario"
    description = "Build and replay attack scenarios from MITRE technique PCAPs"

    def __init__(self):
        super().__init__()
        ifaces = get_ifaces()
        self.register_option('iface','Selected iface where the packets will be sent', required=True, default=ifaces[0])
        self.register_option("speed", '0 = real-time, 1 = rapide avec progress bar, 2 = full speed.', default=0)
        self.scenario = []
        self.per_pcap_rewrites = {} 

    def do_add(self, args):
        """Add instruction to scenario. add pcap <path> | add sleep <seconds>"""
        parts = args.strip().split()
        if len(parts) < 2:
            print("Usage: add pcap <path> | add sleep <seconds>")
            return
        if parts[0] == 'pcap':
            pcap = parts[1]
            if not os.path.isfile(pcap):
                print('Error: PCAP not found')
                return
            self.scenario.append({"type": "pcap", "file_path": pcap})
            print(f"[Scenario] Added pcap: {pcap} (index {len(self.scenario) - 1})")
        elif parts[0] == "sleep":
            try:
                duration = float(parts[1])
            except ValueError:
                print("Duration must be a number (seconds)")
                return
            self.scenario.append({"type": "sleep", "duration": duration})
            print(f"[Scenario] Added sleep: {duration}s (index {len(self.scenario) - 1})")
        else:
            print("Usage: add pcap <path> | add sleep <seconds>")

    def complete_add(self, text, line, begidx, endidx):
        parts = line.split()
        if len(parts) == 2:
            return [o for o in ["pcap", "sleep"] if o.startswith(text)]
        if len(parts) >= 3 and parts[1] == "pcap":
            pattern = (text or "pcaps/") + "*"
            results = glob.glob(pattern)
            return [r + "/" if os.path.isdir(r) else r for r in results]
        return []

    def do_list(self, _args):
        """List scenario items"""
        if not self.scenario:
            print("Scenario is empty.")
            return
        for i, item in enumerate(self.scenario):
            if item["type"] == "pcap":
                rewrites_info = ""
                if str(i) in self.per_pcap_rewrites:
                    count = sum(len(v) for v in self.per_pcap_rewrites[str(i)].values())
                    rewrites_info = f" ({count} rewrites)"
                print(f"  [{i}] pcap: {item['file_path']}{rewrites_info}")
            elif item["type"] == "sleep":
                print(f"  [{i}] sleep: {item['duration']}s")
        if self.rewrites:
            print(f"\n  Global rewrites:")
            for rtype, mappings in self.rewrites.items():
                print(f"    {rtype}: {' '.join(f'{k}={v}' for k, v in mappings.items())}")

    def do_remove(self, args):
        """Remove an item: remove <index>"""
        try:
            index = int(args.strip())
        except ValueError:
            print("Usage: remove <index>")
            return
        if index < 0 or index >= len(self.scenario):
            print(f"Invalid index. Range: 0-{len(self.scenario) - 1}")
            return
        removed = self.scenario.pop(index)
        self.per_pcap_rewrites.pop(str(index), None)
        new_rewrites = {}
        for key, value in self.per_pcap_rewrites.items():
            k = int(key)
            if k > index:
                new_rewrites[str(k - 1)] = value
            else:
                new_rewrites[key] = value
        self.per_pcap_rewrites = new_rewrites
        print(f"[Scenario] Removed: {removed['type']} at index {index}")

    def do_move(self, args):
        """Move an item: move <from_index> <to_index>"""
        parts = args.strip().split()                                                                      
        if len(parts) != 2:                                                                               
            print("Usage: move <from_index> <to_index>")                                                  
            return                                                                                        
        if not parts[0].isdigit() or not parts[1].isdigit():
            print("Usage: move <from_index> <to_index>")                                                  
            return
        src = int(parts[0])                                                                               
        dst = int(parts[1])
        if src < 0 or src >= len(self.scenario) or dst < 0 or dst >= len(self.scenario):                  
            print(f"Invalid index. Range: 0-{len(self.scenario) - 1}")
            return                                                                                        
        item = self.scenario.pop(src)
        self.scenario.insert(dst, item)                                                                   
        # Reindex per_pcap_rewrites
        src_rw = self.per_pcap_rewrites.pop(str(src), None)                                               
        new_rewrites = {}
        for key, value in self.per_pcap_rewrites.items():                                                 
            k = int(key)
            if src < dst:                                                                                 
                if src < k <= dst:                                                                        
                    new_rewrites[str(k - 1)] = value
                else:                                                                                     
                    new_rewrites[key] = value
            else:                                                                                         
                if dst <= k < src:
                    new_rewrites[str(k + 1)] = value                                                      
                else:
                    new_rewrites[key] = value
        if src_rw:                                                                                        
            new_rewrites[str(dst)] = src_rw
        self.per_pcap_rewrites = new_rewrites                                                             
        print(f"[Scenario] Moved index {src} -> {dst}")


    def do_rewrite(self, args):
        """Rewrites: rewrite <type> <old=new> (global) | rewrite <index> <type> <old=new> (per-pcap) | rewrite show | rewrite clear"""
        parts = args.strip().split()
        if not parts:
            print("Usage: rewrite <type> <old=new> | rewrite <index> <type> <old=new> | rewrite show | rewrite clear")
            print(f"Types: {', '.join(REWRITE_TYPES)}")
            return
        if parts[0].isdigit():                                                                                                                                                                                           
            index = int(parts[0])
            if index < 0 or index >= len(self.scenario):                                                                                                                                                                    
                print(f"Invalid index. Range: 0-{len(self.scenario) - 1}")
                return                                                                                                                                                                                                   
            if self.scenario[index]["type"] != "pcap":
                print(f"Index {index} is not a pcap item")                                                                                                                                                               
                return
            self._per_pcap_rewrite(index, parts[1:])                                                                                                                                                                     
            return      
        super().do_rewrite(args)

    def _per_pcap_rewrite(self, index, parts):
        key = str(index)
        if not parts:
            print(f"Usage: rewrite {index} <type> <old=new>")
            return
        cmd = parts[0]
        if cmd == "show":
            rw = self.per_pcap_rewrites.get(key, {})
            if not rw:
                print(f"No per-pcap rewrites for index {index}")
                return
            for rtype, mappings in rw.items():
                print(f"  {rtype}: {' '.join(f'{k}={v}' for k, v in mappings.items())}")
            return
        if cmd == "clear":
            if len(parts) > 1 and parts[1] in REWRITE_TYPES:
                if key in self.per_pcap_rewrites:
                    self.per_pcap_rewrites[key].pop(REWRITE_KEY_TO_PARAM.get(parts[1], parts[1]), None)
                print(f"Cleared {parts[1]} rewrites for index {index}")
            else:
                self.per_pcap_rewrites.pop(key, None)
                print(f"Cleared all rewrites for index {index}")
            return
        if cmd not in REWRITE_TYPES:
            print(f"Unknown rewrite type '{cmd}'. Available: {', '.join(REWRITE_TYPES)}")
            return
        if len(parts) < 2:
            print(f"Usage: rewrite {index} {cmd} old=new [old=new ...]")
            return
        try:
            new_mappings = parse_mapping(parts[1:])
        except ValueError as e:
            print(f"[Rewrite] Error: {e}")
            return
        param_name = REWRITE_KEY_TO_PARAM[cmd]
        if key not in self.per_pcap_rewrites:
            self.per_pcap_rewrites[key] = {}
        if param_name not in self.per_pcap_rewrites[key]:
            self.per_pcap_rewrites[key][param_name] = {}
        self.per_pcap_rewrites[key][param_name].update(new_mappings)
        print(f"[Rewrite pcap {index}] {cmd}: {' '.join(f'{k}={v}' for k, v in self.per_pcap_rewrites[key][param_name].items())}")

    def _execute(self):
        if not self.scenario:
            print("Scenario is empty. Use 'add pcap <path>' to add items.")
            return
        iface = self.get_option('iface')
        speed = int(self.get_option('speed'))
        global_rw = None
        if self.rewrites:
            global_rw = {}
            for rtype, mappings in self.rewrites.items():
                param = REWRITE_KEY_TO_PARAM.get(rtype)
                if param:
                    global_rw[param] = mappings
        packets, duration = merge_pcaps(self.scenario, global_rw, self.per_pcap_rewrites)
        if not packets:
            print("No packets to replay.")
            return
        print(f"[Scenario] {len(packets)} packets, {duration:.1f}s total duration")
        replay_with_speed(packets=packets, iface=iface, speed=speed)
        print("[Scenario] Done.")

        