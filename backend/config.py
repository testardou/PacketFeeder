import os

# Get the PacketFeeder project root directory
# config.py is in backend/, so we go up one level to get the project root
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Root folder for all PCAP data (uploaded files + technique datasets)
PCAPS_ROOT = os.getenv("PCAPS_ROOT", os.path.join(PROJECT_ROOT, "pcaps"))

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", os.path.join(PCAPS_ROOT, "pcap_files"))

# Root folder for mitre definitions (tactics + techniques JSON)
MITRE_ROOT = os.getenv("MITRE_ROOT", os.path.join(PROJECT_ROOT, "mitre"))

TCP_FLAG_MAP = {
    "S": "SYN",
    "A": "ACK",
    "F": "FIN",
    "R": "RST",
    "P": "PSH",
    "U": "URG",
}

ALLOWED_EXTENSIONS = {".pcap", ".pcapng"}

# Maximum file size for uploads (default: 1000MB)
MAX_UPLOAD_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", 1000 * 1024 * 1024))