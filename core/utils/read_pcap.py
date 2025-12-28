from scapy.all import rdpcap
import logging

logger = logging.getLogger(__name__)


def read_pcap(file_path):
    """
    Read packets from a PCAP file.
    
    Args:
        file_path: Path to the PCAP file
        
    Returns:
        List of Scapy packets
        
    Raises:
        FileNotFoundError: If the file doesn't exist
        IOError: If the file cannot be read
        Exception: For other errors (corrupted file, etc.)
    """
    try:
        packets = rdpcap(file_path)
        logger.debug("Successfully read %d packets from %s", len(packets), file_path)
        return packets
    except FileNotFoundError:
        logger.error("PCAP file not found: %s", file_path)
        raise
    except IOError as e:
        logger.error("IO error reading PCAP file %s: %s", file_path, str(e))
        raise
    except Exception as e:
        logger.error("Error reading PCAP file %s: %s", file_path, str(e))
        raise