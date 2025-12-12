
import argparse
from core.pcap_infos import print_pcap_infos
from core.replay import replay

def main():
    parser = argparse.ArgumentParser(
        prog="packetsFeeder",
        description="Pcap Feeder - replay PCAP & scenarios for IDS testing"
    )
    
    subparsers = parser.add_subparsers(dest="mode", required=True)

    replay.add_parser(subparsers)
    print_pcap_infos.add_parser(subparsers)

    args = parser.parse_args()
    args.func(args)   # Call handler

if __name__ == "__main__":
    main()