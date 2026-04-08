import json
import sys

from core.utils.get_project_root import get_project_root
from core.utils.get_tactic_dir import get_tactic_dir
from core.utils.get_technique_dir import get_technique_dir


def list_techniques_for_tactic(tactic_id):
    """List all techniques for a given tactic ID.

    Returns a list of dicts with id, name, description and path.
    """
    project_root = get_project_root()
    tactics_dir = get_tactic_dir()
    techniques_dir = get_technique_dir()

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
                print(f"[Mitre] Warning: Error reading {file_path.name}: {e}", file=sys.stderr)
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