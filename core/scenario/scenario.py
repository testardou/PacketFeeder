import os
import json
import sys
import argparse
from pathlib import Path

from rich.table import Table
from rich.console import Console


def get_project_root():
    """Get the project root directory."""
    # Get the directory where this file is located (core/scenario/)
    current_file = Path(__file__).resolve()
    # Go up: core/scenario -> core -> project root
    return current_file.parent.parent.parent


def list_tactics():
    """List all tactics from scenarios/tactics directory.

    Returns a list of dicts with id, name, description and path.
    """
    project_root = get_project_root()
    tactics_dir = project_root / "scenarios" / "tactics"

    if not tactics_dir.exists():
        return []

    tactics = []
    for file_path in tactics_dir.glob("*.json"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                tactic_data = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"[Scenarios] Warning: Error reading {file_path.name}: {e}", file=sys.stderr)
            continue

        mitre = tactic_data.get("mitre", {})
        tactic_id = mitre.get("tactic_id", "")
        name = mitre.get("tactic_name", "")
        description = tactic_data.get("description", "")
        rel_path = str(file_path.relative_to(project_root))

        tactics.append(
            {
                "id": tactic_id,
                "name": name,
                "description": description,
                "path": rel_path,
            }
        )

    return tactics


def list_techniques_for_tactic(tactic_id):
    """List all techniques for a given tactic ID.

    Returns a list of dicts with id, name, description and path.
    """
    project_root = get_project_root()
    tactics_dir = project_root / "scenarios" / "tactics"
    techniques_dir = project_root / "scenarios" / "techniques"

    # Find the tactic file
    tactic_file_data = None
    for file_path in tactics_dir.glob("*.json"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                tactic_data = json.load(f)
        except (json.JSONDecodeError, IOError):
            continue

        if tactic_data.get("mitre", {}).get("tactic_id") == tactic_id.upper():
            tactic_file_data = tactic_data
            break

    if not tactic_file_data:
        return None

    # Get technique IDs from the tactic
    technique_ids = tactic_file_data.get("techniques", [])

    # Find corresponding technique files
    techniques = []
    for technique_id in technique_ids:
        technique_id_upper = technique_id.upper()
        # Find files starting with technique_id_
        for file_path in techniques_dir.glob(f"{technique_id_upper}_*.json"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    technique_data = json.load(f)
            except (json.JSONDecodeError, IOError) as e:
                print(f"[Scenarios] Warning: Error reading {file_path.name}: {e}", file=sys.stderr)
                continue

            mitre = technique_data.get("mitre", {})
            tech_id = mitre.get("technique_id", technique_id_upper)
            name = mitre.get("technique_name", "")
            description = technique_data.get("description", "")
            rel_path = str(file_path.relative_to(project_root))

            techniques.append(
                {
                    "id": tech_id,
                    "name": name,
                    "description": description,
                    "path": rel_path,
                }
            )
            break  # Take first matching file

    return techniques

def list_events_for_technique(technique_id):
    """List all events for a given technique ID.

    Returns a list of dicts with id, name, description and path.
    """
    project_root = get_project_root()
    techniques_dir = project_root / "scenarios" / "techniques"
    technique_file_data = None
    for file_path in techniques_dir.glob("*.json"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                technique_data = json.load(f)
        except (json.JSONDecodeError, IOError):
            continue

        if technique_data.get("mitre", {}).get("technique_id") == technique_id.upper():
            technique_file_data = technique_data
            break

    if not technique_file_data:
        return None

    events = []
    pcaps = technique_file_data.get("datasets", {}).get("pcaps", [])
    for pcap in pcaps:
        event = {
            "name": pcap.get("name", ""),
            "description": pcap.get("description", ""),
            "path": pcap.get("file", ""),
        }
        events.append(event)

    return events


def add_parser(subparsers):
    """Add scenarios subcommand parser."""
    parser = subparsers.add_parser(
        "scenarios",
        help="List MITRE tactics and techniques from scenarios"
    )

    subparsers_scenarios = parser.add_subparsers(dest="scenario_action", required=True)

    # Subcommand: list-tactics
    list_tactics_parser = subparsers_scenarios.add_parser(
        "list-tactics",
        help="List all available tactics in a rich table"
    )
    list_tactics_parser.set_defaults(func=run_list_tactics)

    # Subcommand: list-techniques
    list_techniques_parser = subparsers_scenarios.add_parser(
        "list-techniques",
        help="List techniques related to a tactic in a rich table"
    )
    list_techniques_parser.add_argument(
        "--tactic",
        required=True,
        help="Tactic ID (e.g., TA0007)"
    )
    list_techniques_parser.set_defaults(func=run_list_techniques)

    # Subcommand: list-events
    list_events_parser = subparsers_scenarios.add_parser(
        "list-events",
        help="List techneventsiques related to a technique in a rich table"
    )
    list_events_parser.add_argument(
        "--technique",
        required=True,
        help="Technique ID (e.g., T1018)"
    )
    list_events_parser.set_defaults(func=run_list_events)


def _print_tactics_table(tactics):
    console = Console()
    table = Table(title="MITRE Tactics (scenarios)")

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
    title = f"Events for technique {tactic_id}"
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

def _print_events_table(events, technique_id):
    console = Console()
    title = f"Events for technique {technique_id}"
    table = Table(title=title)

    table.add_column("Name", style="magenta")
    table.add_column("Description", style="green")
    table.add_column("Path", style="yellow")

    for event in events:
        table.add_row(
            event.get("name", "") or "",
            event.get("description", "") or "",
            event.get("path", "") or "",
        )

    console.print(table)


def run_list_tactics(args):
    """Run list-tactics command."""
    tactics = list_tactics()

    if not tactics:
        print("[Scenarios] No tactic found in 'scenarios/tactics' directory.")
        return

    _print_tactics_table(tactics)


def run_list_techniques(args):
    """Run list-techniques command."""
    techniques = list_techniques_for_tactic(args.tactic)

    if techniques is None:
        print(f"[Scenarios] Error: tactic '{args.tactic}' not found.", file=sys.stderr)
        return

    if not techniques:
        print(f"[Scenarios] No technique found for tactic '{args.tactic}'.")
        return

    _print_techniques_table(techniques, args.tactic)


def run_list_events(args):
    """Run list-events command."""
    events = list_events_for_technique(args.technique)

    if events is None:
        print(f"[Scenarios] Error: technique '{args.technique}' not found.", file=sys.stderr)
        return

    if not events:
        print(f"[Scenarios] No event found for technique '{args.technique}'.")
        return

    _print_events_table(events, args.technique)

def run(args):
    """Main run function that dispatches to the appropriate handler."""
    if hasattr(args, 'func'):
        args.func(args)
    else:
        print("[Scenarios] Error: no action specified.", file=sys.stderr)

