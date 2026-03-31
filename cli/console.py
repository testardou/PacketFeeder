import cmd2

from cli.modules.infos import InfosModule
from cli.modules.rewrite import RewriteModule


BANNER = """                                                                                                                                                                                                     
  ╔═══════════════════════════════════╗
  ║           PacketFeeder            ║                                                                                                                                                                            
  ╚═══════════════════════════════════╝
  Type 'help' for available commands.
  """

class PacketFeederConsole(cmd2.Cmd):
    prompt = "\033[1;32mPacketFeeder\033[0m > "
    intro = BANNER

    def __init__(self):
        super().__init__()
        self.modules = {
            # "replay": ReplayModule,
            "rewrite": RewriteModule,
            "infos": InfosModule,
            # "scenarios": ScenariosModule,
            # "chain": ChainModule,
        }
        self.active_module = None
        for cmd in ['alias', 'edit', 'macro', 'run_pyscript', 'run_script', 'shell', 'shortcuts']:            
            self.disable_command(cmd, "Not available")  
        self.allow_appended_space = False                                                                      


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

