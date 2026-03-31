import glob
import os

from rich.console import Console
from rich.table import Table

from backend.routes.get_interfaces import get_interfaces


class Option:
    def __init__(self, name, description, required=False, default=None):
        self.name = name
        self.description = description
        self.required = required
        self.value = default
        self.default = default

class BaseModule:
    name = ""
    description = ""
    def __init__(self):
        self.options: dict[str, Option] = {}

    def register_option(self, name, description, required=False, default=None):
        self.options[name] = Option(name, description, required, default)

    def complete_option(self, key, text):                                                                                                                                                                            
        if self.options.get(key) and key == "pcap":
            if not text:                                                                                  
                results =  glob.glob("pcaps/*")
            else:
                results = glob.glob(text + "*")  
            return [r + "/" if os.path.isdir(r) else r for r in results]                                                                                                                                                                           
        return []

    def set_option(self, key, value):
        if key not in self.options:
            print(f"Unknown option '{key}'.")
            return False
        self.options[key].value = value
        return True
    
    def unset_option(self, key):
        if key not in self.options:
            print(f"Unknown option '{key}'.")
            return False
        self.options[key].value = self.options[key].default
        return True
    
    def get_option(self, key):
        opt = self.options.get(key)
        if opt is None:
            return None
        return opt.value
    
    def show_options(self):
        console = Console()
        table = Table(title=f"{self.name} Options")
        table.add_column("Option", style="cyan")
        table.add_column("Value", style="magenta")
        table.add_column("Required", style="yellow")
        table.add_column("Description", style="green")
        for opt in self.options.values():
            table.add_row(opt.name, str(opt.value), str(opt.required), opt.description)
        console.print(table)

    def validate(self):
        missing = [opt.name for opt in self.options.values() if opt.required and opt.value is None ]
        if len(missing) > 0:
            print(f"Missing options {', '.join(missing)}")
            return False
        return True

    def run(self):                                                                                                                                                                                                   
        if not self.validate():                                                                                                                                                                                      
            return                                                                                                                                                                                                   
        self._execute()                                                                                                                                                                                              
                
    def _execute(self):
        raise NotImplementedError

