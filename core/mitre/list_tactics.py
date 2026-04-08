import json
import sys

from core.utils.get_project_root import get_project_root
from core.utils.get_tactic_dir import get_tactic_dir


def list_tactics():
    """List all tactics from mitre/tactics directory.

    Returns a list of dicts with id, name, description and path.
    """
    project_root = get_project_root()
    tactics_dir = get_tactic_dir()

    if not tactics_dir.exists():
        return []

    tactics = []
    for file_path in tactics_dir.glob("*.json"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                tactic_data = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"[mitre] Warning: Error reading {file_path.name}: {e}", file=sys.stderr)
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