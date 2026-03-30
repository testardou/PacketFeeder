from cli.modules.base import BaseModule
import os

from core.pcap_infos.pcap_infos_table import pcap_infos_table
from core.utils.pcap_infos import pcap_infos
from core.utils.read_pcap import read_pcap

class InfosModule(BaseModule):
    name = "infos"
    description = "Print infos PCAP informations."

    def __init__(self):
        super().__init__()
        self.register_option("pcap", 'PCAP file path.', required=True)

    def _execute(self):
        pcap_path = self.get_option('pcap')
        if not os.path.isfile(pcap_path):
            print(f'File not found: {pcap_path}')
            return
        packets = read_pcap(pcap_path)
        infos = pcap_infos(packets)
        pcap_infos_table(infos)