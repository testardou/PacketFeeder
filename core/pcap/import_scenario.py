import json
import re
from core.utils.get_technique_dir import get_technique_dir


def load_technique(technique_id: str) -> dict:
    """
    Load a technique JSON by ID.

    Raises ValueError if the ID is invalid or the technique is not found.
    """
    technique_id = technique_id.upper().strip()

    if not re.match(r'^T\d+(\.\d+)?$', technique_id):
        raise ValueError(f"Invalid technique ID format: {technique_id}")

    techniques_dir = get_technique_dir()

    matches = [
        f for f in techniques_dir.iterdir()
        if f.name.startswith(technique_id + "_") and f.name.endswith(".json")
    ]

    if not matches:
        raise ValueError(f"Technique not found: {technique_id}")

    technique_path = matches[0].resolve()
    if not str(technique_path).startswith(str(techniques_dir.resolve()) + "/"):
        raise ValueError("Invalid file path")

    with open(technique_path, "r", encoding="utf-8") as f:
        return json.load(f)


def resolve_scenario_import(items: list) -> dict:
    """
    Validate items and resolve each pcap item with its technique + dataset data.

    Raises ValueError on invalid items (bad type, missing fields, invalid duration).
    Techniques that cannot be loaded are added to 'missing' instead of raising.

    Returns: {"items": [...resolved items...], "missing": [...techniqueIds...]}
    """
    resolved = []
    missing = []

    for i, item in enumerate(items):
        item_type = item.get("type")

        if item_type == "sleep":
            duration = item.get("duration")
            if duration is None or not isinstance(duration, (int, float)) or duration < 0:
                raise ValueError(f"Item {i}: 'duration' must be a non-negative number")
            resolved.append({"type": "sleep", "duration": duration})

        elif item_type == "pcap":
            technique_id = item.get("techniqueId")
            pcap_file = item.get("pcapFile")
            tactic_id = item.get("tacticId")

            if not technique_id or not pcap_file:
                raise ValueError(f"Item {i}: missing 'techniqueId' or 'pcapFile'")

            try:
                technique_data = load_technique(technique_id)
            except ValueError:
                missing.append(technique_id)
                continue

            dataset = None
            for candidate in technique_data.get("datasets", {}).get("pcaps", []):
                if candidate.get("file") == pcap_file:
                    dataset = candidate
                    break

            resolved.append({
                "type": "pcap",
                "techniqueId": technique_id,
                "tacticId": tactic_id,
                "pcapFile": pcap_file,
                "technique": technique_data,
                "dataset": dataset,
            })

        else:
            raise ValueError(f"Item {i}: unknown type '{item_type}'")

    return {"items": resolved, "missing": missing}
