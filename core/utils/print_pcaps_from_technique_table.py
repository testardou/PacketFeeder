from rich.console import Console
from rich.table import Table


def print_pcaps_from_technique_table(pcaps, technique_id):
    console = Console()
    title = f"Pcaps for technique {technique_id}"
    table = Table(title=title, show_lines=True)

    table.add_column("Name", style="magenta")
    table.add_column("Description", style="green")
    table.add_column("Path", style="yellow", overflow="fold")
    

    for pcap in pcaps:
        table.add_row(
            pcap.get("name", "") or "",
            pcap.get("description", "") or "",
            pcap.get("path", "") or "",
        )

    console.print(table)