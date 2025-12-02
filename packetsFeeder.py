
import argparse
from core.replay import replay

def main():
    parser = argparse.ArgumentParser(
        prog="treatmyids",
        description="Treat My IDS - replay PCAP & scenarios for IDS testing"
    )
    
    subparsers = parser.add_subparsers(dest="mode", required=True)

    replay.add_parser(subparsers)
    # scenario.add_parser(subparsers)
    # lab.add_parser(subparsers)
    # step.add_parser(subparsers)

    args = parser.parse_args()
    args.func(args)   # Call handler

if __name__ == "__main__":
    main()