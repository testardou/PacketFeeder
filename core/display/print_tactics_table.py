from rich.console import Console
from rich.table import Table


def print_tactics_table(tactics):
    console = Console()
    table = Table(title="MITRE Tactics", show_lines=True)

    table.add_column("ID", style="cyan", no_wrap=True)
    table.add_column("Name", style="magenta")
    table.add_column("Description", style="green")

    for t in tactics:
        table.add_row(
            t.get("id", "") or "",
            t.get("name", "") or "",
            t.get("description", "") or "",
        )

    console.print(table)