import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtocolData } from "./ProtocolData";
import { SelectedProtocolModifications } from "./SelectedProtocolModifications";
import type { PcapInfoType } from "@/types/types";
import { useState } from "react";

interface IPcapProtocolsScrollAreaProps {
  pcapInfosData?: PcapInfoType;
}

type ProtocolType =
  | "ip"
  | "ipv6"
  | "mac"
  | "tcp"
  | "udp"
  | "icmp"
  | "arp"
  | "dns"
  | null;

export const PcapProtocolsScrollArea = ({
  pcapInfosData,
}: IPcapProtocolsScrollAreaProps) => {
  const protocols = pcapInfosData?.protocols;
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolType>(null);

  // Validation regexes
  const ipv4Regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex =
    /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$|^([0-9a-fA-F]{1,4}:)*::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/;
  const macAddrRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  const dnsDomainRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const portRegex = /^[0-9]+$/;

  if (!protocols) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No protocols available
      </div>
    );
  }

  const availableProtocols = [
    {
      key: "ip" as const,
      label: "IPs",
      count: protocols.ips?.length ?? 0,
      data: protocols.ips,
    },
    {
      key: "ipv6" as const,
      label: "IPv6s",
      count: protocols.ipv6s?.length ?? 0,
      data: protocols.ipv6s,
    },
    {
      key: "mac" as const,
      label: "MACs",
      count: protocols.macs?.length ?? 0,
      data: protocols.macs,
    },
    {
      key: "tcp" as const,
      label: "TCP Ports",
      count: protocols.tcp_ports?.length ?? 0,
      data: protocols.tcp_ports,
      isPort: true,
    },
    {
      key: "udp" as const,
      label: "UDP Ports",
      count: protocols.udp_ports?.length ?? 0,
      data: protocols.udp_ports,
      isPort: true,
    },
    {
      key: "icmp" as const,
      label: "ICMP Types",
      count: protocols.icmp_types?.length ?? 0,
      data: protocols.icmp_types,
    },
    {
      key: "arp" as const,
      label: "ARP IPs",
      count: protocols.arp_ips?.length ?? 0,
      data: protocols.arp_ips,
    },
    {
      key: "dns" as const,
      label: "DNS Domains",
      count: protocols.dns_domains?.length ?? 0,
      data: protocols.dns_domains,
    },
  ].filter((p) => p.count > 0);

  if (availableProtocols.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No protocols found in this PCAP file
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-4 w-full">
      <Card className="h-96 border-2 bg-muted/50 flex-1">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Protocols</CardTitle>
        </CardHeader>
        <div className="px-6 pb-6">
          <ScrollArea className="h-72 rounded-md border p-4">
            <div className="space-y-2">
              {availableProtocols.map((protocol) => (
                <Button
                  key={protocol.key}
                  variant={
                    selectedProtocol === protocol.key ? "default" : "outline"
                  }
                  className="w-full justify-start"
                  onClick={() =>
                    setSelectedProtocol(
                      selectedProtocol === protocol.key ? null : protocol.key,
                    )
                  }
                >
                  {protocol.label} ({protocol.count})
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </Card>
      <div className="flex-1">
        {selectedProtocol && (
          <Card className="h-96 border-2 bg-muted/50 ">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                {
                  availableProtocols.find((p) => p.key === selectedProtocol)
                    ?.label
                }
              </CardTitle>
            </CardHeader>
            <div className="px-6 pb-6">
              <ProtocolData
                selectedProtocol={selectedProtocol}
                protocol={availableProtocols.find(
                  (p) => p.key === selectedProtocol,
                )}
                ipv4Regex={ipv4Regex}
                ipv6Regex={ipv6Regex}
                macAddrRegex={macAddrRegex}
                dnsDomainRegex={dnsDomainRegex}
                portRegex={portRegex}
              />
            </div>
          </Card>
        )}
      </div>
      <div className="flex-1">
        {selectedProtocol && (
          <SelectedProtocolModifications selectedProtocol={selectedProtocol} />
        )}
      </div>
    </div>
  );
};
