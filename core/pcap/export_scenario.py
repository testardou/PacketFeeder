import re
from datetime import datetime, timezone


def build_scenario_export(name: str, items: list) -> dict:
    """
    Validate items and build a scenario export dict.

    Raises ValueError on invalid input.
    """
    exported_items = []

    for i, item in enumerate(items):
        item_type = item.get("type")

        if item_type == "sleep":
            duration = item.get("duration")
            if duration is None or not isinstance(duration, (int, float)) or duration < 0:
                raise ValueError(f"Item {i}: 'duration' must be a non-negative number")
            exported_items.append({"type": "sleep", "duration": duration})

        elif item_type == "pcap":
            technique_id = item.get("techniqueId")
            tactic_id = item.get("tacticId")
            pcap_file = item.get("pcapFile")
            if not technique_id or not pcap_file:
                raise ValueError(f"Item {i}: missing 'techniqueId' or 'pcapFile'")
            exported_items.append({
                "type": "pcap",
                "techniqueId": technique_id,
                "tacticId": tactic_id,
                "pcapFile": pcap_file,
            })

        else:
            raise ValueError(f"Item {i}: unknown type '{item_type}'")

    return {
        "version": 1,
        "date": datetime.now(timezone.utc).isoformat(),
        "name": name,
        "items": exported_items,
    }


def safe_export_filename(name: str) -> str:
    safe = re.sub(r"[^a-z0-9\-_]", "_", name or "scenario", flags=re.IGNORECASE)
    return f"{safe}.json"
