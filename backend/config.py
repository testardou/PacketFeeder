import os

# Get the PacketFeeder project root directory
# config.py is in backend/, so we go up one level to get the project root
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Use environment variable for upload folder, with fallback to project directory
# If UPLOAD_FOLDER is set, use it; otherwise use PROJECT_ROOT/pcaps/pcap_files/
default_upload_folder = os.path.join(PROJECT_ROOT, "pcaps", "pcap_files")
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", default_upload_folder)

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