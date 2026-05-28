from core.mitre.list_pcaps_for_technique import list_pcaps_for_technique
from core.mitre.list_tactics import list_tactics
from core.mitre.list_techniques_for_tactic import list_techniques_for_tactic
from core.display.print_pcaps_from_technique_table import print_pcaps_from_technique_table
from core.display.print_tactics_table import print_tactics_table
from core.display.print_techniques_from_tactic_table import print_techniques_from_tactic_table


class ShowMixin:
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
