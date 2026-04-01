import json

from core.utils.get_technique_dir import get_technique_dir


def list_pcaps_for_technique(technique_id):
    """List all pcaps for a given technique ID.

    Returns a list of dicts with id, name, description and path.
    """
    techniques_dir = get_technique_dir()
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

    pcaps = []
    raw_pcaps = technique_file_data.get("datasets", {}).get("pcaps", [])
    for pcap in raw_pcaps:
        pcaps.append({
            "name": pcap.get("name", ""),
            "description": pcap.get("description", ""),
            "path": pcap.get("file", ""),
        })

    return pcaps