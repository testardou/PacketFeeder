
import argparse
from cli.console import PacketFeederConsole
from core.pcap_infos import print_pcap_infos
from core.replay import replay
from core.rewrite import rewrite_pcap
from core.mitre import mitre

def main():
    parser = argparse.ArgumentParser(
        prog="packetsFeeder",
        description="Pcap Feeder - replay PCAP & mitre based PCAPS for IDS testing"
    )
    
    subparsers = parser.add_subparsers(dest="mode", required=True)

    replay.add_parser(subparsers)
    print_pcap_infos.add_parser(subparsers)
    rewrite_pcap.add_parser(subparsers)
    mitre.add_parser(subparsers)
    console_parser = subparsers.add_parser("console", help="Interactive CLI")                                                                                                                                        
    console_parser.set_defaults(func=lambda _: PacketFeederConsole().cmdloop())


    args = parser.parse_args()
    args.func(args)   # Call handler

if __name__ == "__main__":
    main()