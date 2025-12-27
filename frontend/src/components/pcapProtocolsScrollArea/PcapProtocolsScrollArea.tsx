import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollAreaModify } from "@/components/scrollAreaModify/ScrollAreaModify";
import { ModifiedPcapRecap } from "@/components/modifiedPcapRecap/ModifiedPcapRecap";
import type { PcapInfoType, RewriteValues } from "@/types/types";
import type { UseMutationResult } from "@tanstack/react-query";
import React, { useState } from "react";

interface IPcapProtocolsScrollAreaProps {
  pcapInfos?: UseMutationResult<PcapInfoType, Error, string, unknown>;
  rewriteValues: RewriteValues;
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
  pcapInfos,
  rewriteValues,
}: IPcapProtocolsScrollAreaProps) => {
  const pcapInfosData = pcapInfos?.data;
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
      <ScrollArea className="h-96 rounded-md border">
        <div className="p-4 text-sm text-muted-foreground">
          No protocol data available
        </div>
      </ScrollArea>
    );
  }

  // Build list of available protocols (only those with data)
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

  const renderProtocolData = () => {
    if (!selectedProtocol || !protocols) return null;

    const protocol = availableProtocols.find((p) => p.key === selectedProtocol);
    if (!protocol || !protocol.data) return null;

    // Modifiable protocols using ScrollAreaModify
    if (selectedProtocol === "ip" && rewriteValues.setRewriteIps) {
      return (
        <ScrollAreaModify
          valuesArray={protocol.data as string[]}
          setNewValues={rewriteValues.setRewriteIps}
          newValues={rewriteValues.rewriteIps}
          validator={ipv4Regex}
          modalLabel="New IP"
          modalTitle="Edit IP"
          modalDescription="Modify or rewrite this IP."
          errorMessage="The new IP is not valid"
        />
      );
    }

    if (selectedProtocol === "mac" && rewriteValues.setRewriteMacs) {
      return (
        <ScrollAreaModify
          valuesArray={protocol.data as string[]}
          setNewValues={rewriteValues.setRewriteMacs}
          newValues={rewriteValues.rewriteMacs}
          validator={macAddrRegex}
          modalLabel="New MAC address"
          modalTitle="Edit MAC address"
          modalDescription="Modify or rewrite this MAC address."
          errorMessage="The new MAC address is not valid"
        />
      );
    }

    if (selectedProtocol === "ipv6" && rewriteValues.setRewriteIpv6s) {
      return (
        <ScrollAreaModify
          valuesArray={protocol.data as string[]}
          setNewValues={rewriteValues.setRewriteIpv6s}
          newValues={rewriteValues.rewriteIpv6s}
          validator={ipv6Regex}
          modalLabel="New IPv6"
          modalTitle="Edit IPv6"
          modalDescription="Modify or rewrite this IPv6 address."
          errorMessage="The new IPv6 address is not valid"
        />
      );
    }

    if (selectedProtocol === "arp" && rewriteValues.setRewriteArpIps) {
      return (
        <ScrollAreaModify
          valuesArray={protocol.data as string[]}
          setNewValues={rewriteValues.setRewriteArpIps}
          newValues={rewriteValues.rewriteArpIps}
          validator={ipv4Regex}
          modalLabel="New ARP IP"
          modalTitle="Edit ARP IP"
          modalDescription="Modify or rewrite this ARP IP address."
          errorMessage="The new ARP IP is not valid"
        />
      );
    }

    if (selectedProtocol === "dns" && rewriteValues.setRewriteDnsDomains) {
      return (
        <ScrollAreaModify
          valuesArray={protocol.data as string[]}
          setNewValues={rewriteValues.setRewriteDnsDomains}
          newValues={rewriteValues.rewriteDnsDomains}
          validator={dnsDomainRegex}
          modalLabel="New DNS Domain"
          modalTitle="Edit DNS Domain"
          modalDescription="Modify or rewrite this DNS domain."
          errorMessage="The new DNS domain is not valid"
        />
      );
    }

    if (selectedProtocol === "tcp" && rewriteValues.setRewriteTcpPorts) {
      return (
        <ScrollAreaModify
          valuesArray={protocol.data.map(String)}
          setNewValues={rewriteValues.setRewriteTcpPorts}
          newValues={rewriteValues.rewriteTcpPorts}
          validator={portRegex}
          modalLabel="New TCP Port"
          modalTitle="Edit TCP Port"
          modalDescription="Modify or rewrite this TCP port."
          errorMessage="The new TCP port is not valid (must be between 0 and 65535)"
          showInfoButton={true}
          infoUrl={(value) => `https://isc.sans.edu/data/port/${value}`}
        />
      );
    }

    if (selectedProtocol === "udp" && rewriteValues.setRewriteUdpPorts) {
      return (
        <ScrollAreaModify
          valuesArray={protocol.data.map(String)}
          setNewValues={rewriteValues.setRewriteUdpPorts}
          newValues={rewriteValues.rewriteUdpPorts}
          validator={portRegex}
          modalLabel="New UDP Port"
          modalTitle="Edit UDP Port"
          modalDescription="Modify or rewrite this UDP port."
          errorMessage="The new UDP port is not valid (must be between 0 and 65535)"
          showInfoButton={true}
          infoUrl={(value) => `https://isc.sans.edu/data/port/${value}`}
        />
      );
    }

    // Non-modifiable protocols (read-only display)
    return (
      <div className="space-y-1">
        {protocol.data.map((item: string | number, index: number) => (
          <React.Fragment key={item}>
            {protocol.isPort ? (
              <a
                className="text-sm font-mono hover:underline block"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://isc.sans.edu/data/port/${item}`}
              >
                {item}
              </a>
            ) : (
              <div className="text-sm font-mono">{item}</div>
            )}
            {index < protocol.data.length - 1 && <Separator className="my-1" />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (availableProtocols.length === 0) {
    return (
      <ScrollArea className="h-96 rounded-md border">
        <div className="p-4 text-sm text-muted-foreground">
          No protocols found in this PCAP file
        </div>
      </ScrollArea>
    );
  }

  // Check if selected protocol has modifications
  const getSelectedProtocolModifications = () => {
    if (!selectedProtocol) return null;

    switch (selectedProtocol) {
      case "ip":
        if (
          rewriteValues.rewriteIps &&
          rewriteValues.rewriteIps.length > 0 &&
          rewriteValues.setRewriteIps
        ) {
          return (
            <ModifiedPcapRecap
              cardTitle="Modified IPs"
              rewriteValues={rewriteValues.rewriteIps}
              setRewriteValues={rewriteValues.setRewriteIps}
            />
          );
        }
        return null;
      case "mac":
        if (
          rewriteValues.rewriteMacs &&
          rewriteValues.rewriteMacs.length > 0 &&
          rewriteValues.setRewriteMacs
        ) {
          return (
            <ModifiedPcapRecap
              cardTitle="Modified MACs"
              rewriteValues={rewriteValues.rewriteMacs}
              setRewriteValues={rewriteValues.setRewriteMacs}
            />
          );
        }
        return null;
      case "ipv6":
        if (
          rewriteValues.rewriteIpv6s &&
          rewriteValues.rewriteIpv6s.length > 0 &&
          rewriteValues.setRewriteIpv6s
        ) {
          return (
            <ModifiedPcapRecap
              cardTitle="Modified IPv6s"
              rewriteValues={rewriteValues.rewriteIpv6s}
              setRewriteValues={rewriteValues.setRewriteIpv6s}
            />
          );
        }
        return null;
      case "arp":
        if (
          rewriteValues.rewriteArpIps &&
          rewriteValues.rewriteArpIps.length > 0 &&
          rewriteValues.setRewriteArpIps
        ) {
          return (
            <ModifiedPcapRecap
              cardTitle="Modified ARP IPs"
              rewriteValues={rewriteValues.rewriteArpIps}
              setRewriteValues={rewriteValues.setRewriteArpIps}
            />
          );
        }
        return null;
      case "dns":
        if (
          rewriteValues.rewriteDnsDomains &&
          rewriteValues.rewriteDnsDomains.length > 0 &&
          rewriteValues.setRewriteDnsDomains
        ) {
          return (
            <ModifiedPcapRecap
              cardTitle="Modified DNS Domains"
              rewriteValues={rewriteValues.rewriteDnsDomains}
              setRewriteValues={rewriteValues.setRewriteDnsDomains}
            />
          );
        }
        return null;
      case "tcp":
        if (
          rewriteValues.rewriteTcpPorts &&
          rewriteValues.rewriteTcpPorts.length > 0 &&
          rewriteValues.setRewriteTcpPorts
        ) {
          return (
            <ModifiedPcapRecap
              cardTitle="Modified TCP Ports"
              rewriteValues={rewriteValues.rewriteTcpPorts}
              setRewriteValues={rewriteValues.setRewriteTcpPorts}
            />
          );
        }
        return null;
      case "udp":
        if (
          rewriteValues.rewriteUdpPorts &&
          rewriteValues.rewriteUdpPorts.length > 0 &&
          rewriteValues.setRewriteUdpPorts
        ) {
          return (
            <ModifiedPcapRecap
              cardTitle="Modified UDP Ports"
              rewriteValues={rewriteValues.rewriteUdpPorts}
              setRewriteValues={rewriteValues.setRewriteUdpPorts}
            />
          );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-row gap-4 w-fit">
      <Card className="w-fit border-2 bg-muted/50 p-4">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Protocols</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-48 rounded-md border p-4">
            <div className=" space-y-2">
              {availableProtocols.map((protocol) => (
                <Button
                  key={protocol.key}
                  variant={
                    selectedProtocol === protocol.key ? "default" : "outline"
                  }
                  className="w-full justify-start"
                  onClick={() =>
                    setSelectedProtocol(
                      selectedProtocol === protocol.key ? null : protocol.key
                    )
                  }
                >
                  {protocol.label} ({protocol.count})
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Protocol Data */}
      {selectedProtocol && (
        <ScrollArea className="h-96 w-96 rounded-md border bg-muted/50">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">
              {
                availableProtocols.find((p) => p.key === selectedProtocol)
                  ?.label
              }
            </h3>
            {renderProtocolData()}
          </div>
        </ScrollArea>
      )}

      {/* Modifications Recap - Only for selected protocol */}
      {selectedProtocol && getSelectedProtocolModifications()}
    </div>
  );
};
