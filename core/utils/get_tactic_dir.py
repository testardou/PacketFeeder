from pathlib import Path

from core.utils.get_project_root import get_project_root


def get_tactic_dir():
    """Get the tactic directory."""
    project_root = get_project_root()
    return Path(f'{project_root}/mitre/tactics')