from core.utils.parse_mapping import parse_mapping


REWRITE_TYPES = ["ip", "ipv6", "mac", "arp-ip", "dns", "tcp", "udp"]                                                                                                                                             
                                                                                                                                                                                                                
                                                                                                                                                                                                                
class RewriteMixin:                                                                                                                                                                                              
    def __init__(self):                                                                                                                                                                                          
        super().__init__()
        self.rewrites = {}

    def do_rewrite(self, args):
        """Manage rewrites: rewrite <type> <old=new> | rewrite show | rewrite clear [type] | rewrite remove <type> <old_value>"""
        parts = args.strip().split()                                                                                                                                                                             
        if not parts:
            print("Usage: rewrite <type> <old=new> | rewrite show | rewrite clear [type] | rewrite remove <type> <old_value>")                                                                                                                       
            print(f"Types: {', '.join(REWRITE_TYPES)}")                                                                                                                                                          
            return
        cmd = parts[0]                                                                                                                                                                                           
        if cmd == "show":                                                                                                                                                                                        
            if not self.rewrites:
                print("No rewrites configured.")
                return
            for rtype, mappings in self.rewrites.items():
                print(f"  {rtype}: {' '.join(f'{k}={v}' for k, v in mappings.items())}")                                                                                                                         
            return                                                                                                                                                                                               
        if cmd == "clear":                                                                                                                                                                                       
            if len(parts) > 1 and parts[1] in REWRITE_TYPES:
                self.rewrites.pop(parts[1], None)
                print(f"Cleared {parts[1]} rewrites.")                                                                                                                                                           
            else:
                self.rewrites = {}                                                                                                                                                                               
                print("Cleared all rewrites.")                                                                                                                                                                   
            return
        if cmd == "remove":
            if len(parts) < 3 or parts[1] not in REWRITE_TYPES:
                print(f"Usage: rewrite remove <type> <old_value>")
                return
            rtype = parts[1]
            key = parts[2]
            if rtype in self.rewrites and key in self.rewrites[rtype]:
                del self.rewrites[rtype][key]
                print(f"Removed {rtype} rewrite for {key}")
            else:
                print(f"No {rtype} rewrite found for {key}")
            return
        if cmd not in REWRITE_TYPES:
            print(f"Unknown rewrite type '{cmd}'. Available: {', '.join(REWRITE_TYPES)}")
            return                                                                                                                                                                                               
        if len(parts) < 2:                                                                                                                                                                                       
            print(f"Usage: rewrite {cmd} old=new [old=new ...]")
            return                                                                                                                                                                                               
        new_mappings = parse_mapping(parts[1:])                                                                                                                                                                  
        if cmd not in self.rewrites:
            self.rewrites[cmd] = {}                                                                                                                                                                              
        self.rewrites[cmd].update(new_mappings)
        print(f"[Rewrite] {cmd}: {' '.join(f'{k}={v}' for k, v in self.rewrites[cmd].items())}")                                                                                                                 
                                                                                                                                                                                                                
    def complete_rewrite(self, text, line, begidx, endidx):                                                                                                                                                      
        parts = line.split()                                                                                                                                                                                     
        if len(parts) == 2:
            options = REWRITE_TYPES + ["show", "clear"]                                                                                                                                                          
            return [o for o in options if o.startswith(text)]
        return []