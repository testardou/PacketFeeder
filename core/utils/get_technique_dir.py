from pathlib import Path

from core.utils.get_project_root import get_project_root


def get_technique_dir():
    """Get the technique directory."""
    project_root = get_project_root()
    return Path(f'{project_root}/mitre/techniques')