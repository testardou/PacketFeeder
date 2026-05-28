import os

from cli.mixins.infos import InfosMixin
from cli.mixins.rewrite import RewriteMixin
from cli.mixins.show import ShowMixin
from cli.modules.base import BaseModule

from core.pcap.rewrite_packets import rewrite_packets
from core.utils.rewrite_params import build_rewrite_kwargs
from core.pcap.filter_packets import filter_packets
from core.utils.get_ifaces import get_ifaces
from core.pcap.read_pcap import read_pcap
from core.replay.replay_with_speed import replay_with_speed


class MitreModule(ShowMixin, RewriteMixin, InfosMixin, BaseModule):
    name = "mitre"
    description = "Browse and replay MITRE ATT&CK tactics, techniques and pcaps"

    def __init__(self):
        super().__init__()
        ifaces = get_ifaces()
        self.register_option('iface','Selected iface where the packets will be sent', required=True, default=ifaces[0])
        self.register_option("speed", '0 = real-time, 1 = rapide avec progress bar, 2 = full speed.', default=0)
        self.register_option("pcap", 'PCAP file path.', required=True)
        self.register_option("index", 'Replay only a specific packet by index (0-based).', default=None)
        self.register_option("range", 'Replay a range of packets by index (0-based). Format: start-end.', default=None)


    def _execute(self):
        pcap_path = self.get_option('pcap')
        iface = self.get_option('iface')
        speed = self.get_option('speed')
        pkt_index = self.get_option('index')
        pkt_range = self.get_option('range')
        if not os.path.isfile(pcap_path):
            print(f'File not found: {pcap_path}')
            return
        packets = read_pcap(pcap_path)
        packets = filter_packets(packets=packets, pkt_index=pkt_index, pkt_range=pkt_range)
        if self.rewrites:                                                                                                                                                                                            
          packets = rewrite_packets(                                                                                                                                                                               
              packets,
              **build_rewrite_kwargs(self.rewrites)
          )
        replay_with_speed(packets=packets, iface=iface, speed=int(speed))
                                                                          