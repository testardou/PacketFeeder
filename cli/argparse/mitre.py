import sys

from core.mitre.list_pcaps_for_technique import list_pcaps_for_technique
from core.mitre.list_tactics import list_tactics
from core.mitre.list_techniques_for_tactic import list_techniques_for_tactic
from core.display.print_pcaps_from_technique_table import print_pcaps_from_technique_table
from core.display.print_tactics_table import print_tactics_table
from core.display.print_techniques_from_tactic_table import print_techniques_from_tactic_table



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


def run_list_tactics(args):
    """Run list-tactics command."""
    tactics = list_tactics()

    if not tactics:
        print("[Mitre] No tactic found in 'mitre/tactics' directory.")
        return

    print_tactics_table(tactics)


def run_list_techniques(args):
    """Run list-techniques command."""
    techniques = list_techniques_for_tactic(args.tactic)

    if techniques is None:
        print(f"[Mitre] Error: tactic '{args.tactic}' not found.", file=sys.stderr)
        return

    if not techniques:
        print(f"[Mitre] No technique found for tactic '{args.tactic}'.")
        return

    print_techniques_from_tactic_table(techniques, args.tactic)


def run_list_technique_pcaps(args):
    """Run list-pcaps command."""
    pcaps = list_pcaps_for_technique(args.technique)

    if pcaps is None:
        print(f"[Mitre] Error: technique '{args.technique}' not found.", file=sys.stderr)
        return

    if not pcaps:
        print(f"[Mitre] No pcap found for technique '{args.technique}'.")
        return

    print_pcaps_from_technique_table(pcaps, args.technique)

def run(args):
    """Main run function that dispatches to the appropriate handler."""
    if hasattr(args, 'func'):
        args.func(args)
    else:
        print("[Mitre] Error: no action specified.", file=sys.stderr)

