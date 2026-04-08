
import argparse
import sys
from cli.console import PacketFeederConsole
from cli.argparse import print_pcap_infos
from cli.argparse import replay
from cli.argparse import rewrite_pcap
from cli.argparse import mitre

def main():
    parser = argparse.ArgumentParser(
        prog="packetsFeeder",
        description="Pcap Feeder - replay PCAP & mitre based PCAPS for IDS testing"
    )
    
    parser.add_argument("-x", nargs=argparse.REMAINDER, help="Execute a command directly (e.g. -x replay --pcap test.pcap)")
    args = parser.parse_args()

    if args.x is not None:
        if not args.x:
          print("Usage: packetFeeder.py -x <command> [args...]")
          sys.exit(1)
        sub_parser = argparse.ArgumentParser()
        subparsers = sub_parser.add_subparsers(dest="mode", required=True)
        replay.add_parser(subparsers)
        print_pcap_infos.add_parser(subparsers)
        rewrite_pcap.add_parser(subparsers)
        mitre.add_parser(subparsers)
        sub_args = sub_parser.parse_args(args.x)
        sub_args.func(sub_args)
    else:
        PacketFeederConsole().cmdloop()

if __name__ == "__main__":
    main()