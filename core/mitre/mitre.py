import sys

from rich.table import Table
from rich.console import Console

from core.utils.list_pcaps_for_technique import list_pcaps_for_technique
from core.utils.list_tactics import list_tactics
from core.utils.list_techniques_for_tactic import list_techniques_for_tactic



def add_parser(subparsers):
    """Add mitre subcommand parser."""
    parser = subparsers.add_parser(
        "mitre",
        help="List MITRE tactics and techniques from mitre"
    )

    subparsers_mitre = parser.add_subparsers(dest="mitre_action", required=True)

    # Subcommand: list-tactics
    list_tactics_parser = subparsers_mitre.add_parser(
        "list-tactics",
        help="List all available tactics in a rich table"
    )
    list_tactics_parser.set_defaults(func=run_list_tactics)

    # Subcommand: list-techniques
    list_techniques_parser = subparsers_mitre.add_parser(
        "list-techniques",
        help="List techniques related to a tactic in a rich table"
    )
    list_techniques_parser.add_argument(
        "--tactic",
        required=True,
        help="Tactic ID (e.g., TA0007)"
    )
    list_techniques_parser.set_defaults(func=run_list_techniques)

    # Subcommand: list-pcaps
    list_pcaps_parser = subparsers_mitre.add_parser(
        "list-pcaps",
        help="List pcaps related to a technique in a rich table"
    )
    list_pcaps_parser.add_argument(
        "--technique",
        required=True,
        help="Technique ID (e.g., T1018)"
    )
    list_pcaps_parser.set_defaults(func=run_list_technique_pcaps)


def _print_tactics_table(tactics):
    console = Console()
    table = Table(title="MITRE Tactics")

    table.add_column("ID", style="cyan", no_wrap=True)
    table.add_column("Name", style="magenta")
    table.add_column("Description", style="green")
    table.add_column("Path", style="yellow")

    for t in tactics:
        table.add_row(
            t.get("id", "") or "",
            t.get("name", "") or "",
            t.get("description", "") or "",
            t.get("path", "") or "",
        )

    console.print(table)

def _print_techniques_table(techniques, tactic_id):
    console = Console()
    title = f"Techniques for tactic {tactic_id}"
    table = Table(title=title)

    table.add_column("Name", style="magenta")
    table.add_column("Description", style="green")
    table.add_column("Path", style="yellow")

    for tech in techniques:
        table.add_row(
            tech.get("id", "") or "",
            tech.get("name", "") or "",
            tech.get("description", "") or "",
            tech.get("path", "") or "",
        )

    console.print(table)

def _print_pcaps_table(pcaps, technique_id):
    console = Console()
    title = f"Pcaps for technique {technique_id}"
    table = Table(title=title)

    table.add_column("Name", style="magenta")
    table.add_column("Description", style="green")
    table.add_column("Path", style="yellow")

    for pcap in pcaps:
        table.add_row(
            pcap.get("name", "") or "",
            pcap.get("description", "") or "",
            pcap.get("path", "") or "",
        )

    console.print(table)


def run_list_tactics(args):
    """Run list-tactics command."""
    tactics = list_tactics()

    if not tactics:
        print("[Mitre] No tactic found in 'mitre/tactics' directory.")
        return

    _print_tactics_table(tactics)


def run_list_techniques(args):
    """Run list-techniques command."""
    techniques = list_techniques_for_tactic(args.tactic)

    if techniques is None:
        print(f"[Mitre] Error: tactic '{args.tactic}' not found.", file=sys.stderr)
        return

    if not techniques:
        print(f"[Mitre] No technique found for tactic '{args.tactic}'.")
        return

    _print_techniques_table(techniques, args.tactic)


def run_list_technique_pcaps(args):
    """Run list-pcaps command."""
    pcaps = list_pcaps_for_technique(args.technique)

    if pcaps is None:
        print(f"[Mitre] Error: technique '{args.technique}' not found.", file=sys.stderr)
        return

    if not pcaps:
        print(f"[Mitre] No pcap found for technique '{args.technique}'.")
        return

    _print_pcaps_table(pcaps, args.technique)

def run(args):
    """Main run function that dispatches to the appropriate handler."""
    if hasattr(args, 'func'):
        args.func(args)
    else:
        print("[Mitre] Error: no action specified.", file=sys.stderr)

