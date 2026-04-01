
from rich.console import Console
from rich.table import Table


def print_techniques_from_tactic_table(techniques, tactic_id):
    console = Console()
    title = f"Techniques for tactic {tactic_id}"
    table = Table(title=title, show_lines=True)

    table.add_column("ID", style="cyan", no_wrap=True)
    table.add_column("Name", style="magenta")
    table.add_column("Description", style="green")

    for tech in techniques:
        table.add_row(
            tech.get("id", "") or "",
            tech.get("name", "") or "",
            tech.get("description", "") or "",
        )

    console.print(table)