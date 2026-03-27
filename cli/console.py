import cmd2


BANNER = """                                                                                                                                                                                                     
  ╔═══════════════════════════════════╗
  ║           PacketFeeder            ║                                                                                                                                                                            
  ╚═══════════════════════════════════╝
  Type 'help' for available commands.
  """

class PacketFeederConsole(cmd2.cmd):
    prompt = "PacketFeeder > "
    intro = BANNER

    def __init__(self):
        super().__init__()
        self.modules = {
            "replay": ReplayModule,
            "rewrite": RewriteModule,
            "infos": InfosModule,
            "scenarios": ScenariosModule,
            "chain": ChainModule,
        }
        self.active_module = None

    def do_use(self, args):
        """Select a module: use <module>"""
        name = args.strip()
        if name not in self.modules:
            print(f"Unknown module: {name}")
            print(f"Available: {', '.join(self.modules.keys())}")
            return
        self.active_module = self.modules[name]()
        self.prompt = f"PacketFeeder ({name}) > "

    def complete_use(self, text, line, begidx, endidx):
        return [m for m in self.modules if m.startswith(text)]

    def do_back(self, _args):
        """Return to main prompt"""
        self.active_module = None
        self.prompt = "PacketFeeder > "


