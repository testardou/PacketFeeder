from pathlib import Path


def get_project_root():
    """Get the project root directory."""
    current_file = Path(__file__).resolve()
    return current_file.parent.parent.parent