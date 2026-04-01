import os
import readline

import cmd2

from backend.routes.get_interfaces import get_interfaces
from cli.modules.infos import InfosModule
from cli.modules.mitre import MitreModule
from cli.modules.replay import ReplayModule
from cli.modules.rewrite import RewriteModule
from core.utils.get_ifaces import get_ifaces
from core.utils.get_project_root import get_project_root


BANNER = """                                                                                                                                                                                                     
            ╔═════════════════════════════════════════════════╗
            ║                  PacketFeeder                   ║
            ╚═════════════════════════════════════════════════╝
              -:                                            :-                          
             -%%*.                                        .*%%-                         
             *##%#-                                      -#%*#*                         
            .%#*+#%*                                    *%#+*#%.                        
            -%#+++*##-                                -##*+++#%=                        
            *%*++++*#%*                              *%#+++++*##                        
           .##*++++++*#%-                          -%#*++++++*##:                       
           .##*+++++++*#%*:......................:+%#*+++++++*##.                       
            =%#++++++++#%%%%%%%%%%%%%%%%%%%%%%%%%%%%*++++++++*%+                        
            .%#*++++*#%%#*++++++++++++++++++++++++*#%%#*++++*#%.                        
             *%*++*#%#*++++++++++++++++++++++++++++++*#%#*++*%*                         
             :%#*#%#**++++++++++++++++++++++++++++++++**#%#*#%:                         
              *%%#*++++++++++++++++++++++++++++++++++++++*#%%*.                         
              +%*+++++++++**+++++++++++++++++++***+++++++++*%=                          
              +%*++++++++*#%#++++++++++++++++++#%#*++++++++*%=                          
              +%*++++++++*#%#++++++++++++++++++#%#*++++++++*%=                          
              +%*++++++++*##*++++*########*++++*##*++++++++*%=                          
              +%*+++++++++++++++*#%%%%%%%%#*+++++++++++++++*%=                          
    -#%###%#: +%*++++***+++++++++*%%%%%%%#*+++++++++***++++*%= -#%###%#=                
  :##*++*++*###%*++++*#%*++++++++++**#%**++++++++++*%#*++++*%##%*++*++*##:              
 :%#+####%#*+#%%#++++*#%#++++++++++*#%%#*++++++++++*%#*++++#%%*+*##%###+#%:             
 +%**##**%*%%++#########%#********#%#%*%%#********#%#########++%#*+#*#%**%+             
 =%*+##*#%#%%%#**********#%%#%%%%%%##%##%%%%%%%%%##**********#%%##*%##%+*%=             
  *#*+#%#**#*#**#****#*#+*#+#**#*#**#%+##****#*#+#**#****#**#*#***#%%#+*#*              
   #%*+##+*#*#*+##***#*#+*#+*#*###**#%**#*#*+###****###**#*+#*##*##%#+*%#               
 .##+*##*###%%##***************#%%**#*####*%#***************##%#**#*#%*+##.             
 +%**##**##*#++#################%#+*#*###%*%#################+*#**#*#%%**%+             
 -%*+#%%%%%*+#%%#*++++++++++++#%#*++++++++*#%#++++++++++++*#%%*+#%%%%%#+*%-             
  +%#++***+*###%*++++++++++++++*#%###**###%#*++++++++++++++*%###*+***++##=              
   .+#####%#=.+%*++++++++++++++++****##****++++++++++++++++*%=.=#%####%+.               
              +%*++*********************+++++++++********++*%=                          
              +%*++*###################*+++++++++*######*++*%=                          
              +%*++++++++++++++++++++++++++++++++++++++++++*%=                          
              +%*+++###################*+++++++++++++++++++*%=                          
              +%*++**#################**+++++++++++++++++++*%=                          
              +%*++++++++++++++++++++++++++++++++++++++++++*%=                          
              +%*++*%%%%%%%%%%%%%%%%%%%#+++++++++*#%%%*++++*%=                          
              +%*+++********************+++++++++#%**%#*+++*%=                          
              +%*++++++++++++++++++++++++++++++++*##%#*++++*%=                          
              +%*++++++++++++++++++++++++++++++++++++++++++*%=                          
              =%**++++++++++++++++++++++++++++++++++++++++*#%=                          
               =#%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#-                           
                 .*#+***++#%:                  -##++++++%*.                             
                 .*%######%%:                  :#%######%*.                             
                   ........                     .........                               
  Type 'help' for available commands.
  """

class PacketFeederConsole(cmd2.Cmd):
    prompt = "\033[1;32mPacketFeeder\033[0m > "
    intro = BANNER

    def __init__(self):
        root_dir = get_project_root()
        super().__init__(allow_cli_args=False, persistent_history_file=os.path.expanduser(f"{root_dir}/.packetfeeder_history"))
        self.modules = {
            "replay": ReplayModule,
            "rewrite": RewriteModule,
            "infos": InfosModule,
            "mitre": MitreModule,
            # "chain": ChainModule,
        }
        self.active_module = None
        for cmd in ['alias', 'edit', 'macro', 'run_pyscript', 'run_script', 'shell', 'shortcuts']:            
            self.disable_command(cmd, "Not available")  
        self.allow_appended_space = False                                                                      

    def default(self, statement):
        if self.active_module and hasattr(self.active_module, f"do_{statement.command}"):
            self.history.append(statement)
            getattr(self.active_module, f"do_{statement.command}")(statement.args)
        else:
            print(f"Unknown command: {statement.command}")
    
    def do_help(self, args):
      if not args and self.active_module:
        super().do_help(args)
        cmds = [(m[3:], getattr(self.active_module, m).__doc__ or "") for m in dir(self.active_module) if m.startswith("do_")]                                                       
        if cmds:                                                                                    
            print(f"\nModule commands:")                                                            
            for name, desc in cmds:
                print(f"  {name:20s} {desc}")
      else:
          super().do_help(args)


    def _complete_option(self, text):
        if not self.active_module:
            print('No module selected')
            return
        return [option for option in self.active_module.options if option.startswith(text)]        

    def do_use(self, args):
        """Select a module: use <module>"""
        name = args.strip()
        if name not in self.modules:
            print(f"Unknown module: {name}")
            print(f"Available: {', '.join(self.modules.keys())}")
            return
        self.active_module = self.modules[name]()
        self.prompt = f"\033[1;32mPacketFeeder\033[0m (\033[1;36m{name}\033[0m) > "

    def complete_use(self, text, line, begidx, endidx):
        return [m for m in self.modules if m.startswith(text)]
    
    def completedefault(self, text, line, begidx, endidx):                                                
      if self.active_module:                                                                            
          cmd = line.split()[0]
          complete_method = f"complete_{cmd}"                                                           
          if hasattr(self.active_module, complete_method):                                              
              return getattr(self.active_module, complete_method)(text, line, begidx, endidx)
      return []

    def do_back(self, _args):
        """Return to main prompt"""
        self.active_module = None
        self.prompt = "PacketFeeder > "

    def do_set(self, args):
        if not self.active_module:
            print('No module selected')
            return
        setter = args.split(" ",1)
        if len(setter) < 2:
            print('Usage: <key> <value>')
        self.active_module.set_option(setter[0], setter[1])
    def do_ifaces(self):
        ifaces = get_ifaces()
        for iface, i in ifaces:
            print(f'{iface}{" *" if i == 0 else ""}')
        print('* = default')

    def complete_set(self, text, line, begidx, endidx):                                                   
        parts = line.split(" ")                                                                           
        if len(parts) == 2:                                                                               
          return self._complete_option(text)                                                            
        elif len(parts) >= 3 and self.active_module:                                                      
          key = parts[1]                                                                                
          results = self.active_module.complete_option(key, text)                                       
          if results and any(r.endswith("/") for r in results):                                         
              self.allow_appended_space = False                                                         
          return results                                                                                
        return []                                                                                                                                                                          
                                                                                                                                                                                                                   
    def complete_unset(self, text, line, begidx, endidx):
      return self._complete_option(text)   

    def do_options(self, _args):
        if not self.active_module:
            print('No module selected')
            return
        self.active_module.show_options()

    def do_run(self, _args):
        if not self.active_module:
            print('No module selected')
            return
        self.active_module.run()

    def do_unset(self, args):            
        if not self.active_module:
            print('No module selected')
            return
        self.active_module.unset_option(args.strip())        

