import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { PcapInfoType } from "@/types/types";
import type { UseMutationResult } from "@tanstack/react-query";
import React, { useState } from "react";

interface IPcapInfoScrollAreaProps {
  pcapInfos?: UseMutationResult<PcapInfoType, Error, string, unknown>;
}

type ProtocolType = "ip" | "ipv6" | "mac" | "tcp" | "udp" | "dns" | null;

export const PcapInfoScrollArea = ({ pcapInfos }: IPcapInfoScrollAreaProps) => {
  const pcapInfosData = pcapInfos?.data;
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolType>(null);

  const protocols = [
    {
      key: "ip" as const,
      label: "IPs",
      count: pcapInfosData?.protocols?.ips.length ?? 0,
    },
    {
      key: "ipv6" as const,
      label: "IPv6s",
      count: pcapInfosData?.protocols?.ipv6s?.length ?? 0,
    },
    {
      key: "mac" as const,
      label: "MACs",
      count: pcapInfosData?.protocols?.macs.length ?? 0,
    },
    {
      key: "tcp" as const,
      label: "TCP Ports",
      count: pcapInfosData?.protocols?.tcp_ports.length ?? 0,
    },
    {
      key: "udp" as const,
      label: "UDP Ports",
      count: pcapInfosData?.protocols?.udp_ports.length ?? 0,
    },
    {
      key: "dns" as const,
      label: "DNS Domains",
      count: pcapInfosData?.protocols?.dns_domains?.length ?? 0,
    },
  ];

  const renderProtocolData = () => {
    if (!selectedProtocol || !pcapInfosData || !pcapInfosData.protocols)
      return null;

    switch (selectedProtocol) {
      case "ip":
        return (
          <div className="space-y-1">
            {pcapInfosData.protocols.ips.map((ip, index) => (
              <React.Fragment key={ip}>
                <div className="text-sm font-mono">{ip}</div>
                {index < pcapInfosData.protocols.ips.length - 1 && (
                  <Separator className="my-1" />
                )}
              </React.Fragment>
            ))}
          </div>
        );
      case "ipv6":
        return (
          <div className="space-y-1">
            {(pcapInfosData.protocols.ipv6s ?? []).map(
              (ipv6: string, index: number) => (
                <React.Fragment key={ipv6}>
                  <div className="text-sm font-mono">{ipv6}</div>
                  {index < (pcapInfosData.protocols.ipv6s?.length ?? 0) - 1 && (
                    <Separator className="my-1" />
                  )}
                </React.Fragment>
              )
            )}
          </div>
        );
      case "mac":
        return (
          <div className="space-y-1">
            {pcapInfosData.protocols.macs.map((mac, index) => (
              <React.Fragment key={mac}>
                <div className="text-sm font-mono">{mac}</div>
                {index < pcapInfosData.protocols.macs.length - 1 && (
                  <Separator className="my-1" />
                )}
              </React.Fragment>
            ))}
          </div>
        );
      case "tcp":
        return (
          <div className="space-y-1">
            {pcapInfosData.protocols.tcp_ports.map((port, index) => (
              <React.Fragment key={port}>
                <a
                  className="text-sm font-mono hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://isc.sans.edu/data/port/${port}`}
                >
                  {port}
                </a>
                {index < pcapInfosData.protocols.tcp_ports.length - 1 && (
                  <Separator className="my-1" />
                )}
              </React.Fragment>
            ))}
          </div>
        );
      case "udp":
        return (
          <div className="space-y-1">
            {pcapInfosData.protocols.udp_ports.map((port, index) => (
              <React.Fragment key={port}>
                <a
                  className="text-sm font-mono hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://isc.sans.edu/data/port/${port}`}
                >
                  {port}
                </a>
                {index < pcapInfosData.protocols.udp_ports.length - 1 && (
                  <Separator className="my-1" />
                )}
              </React.Fragment>
            ))}
          </div>
        );
      case "dns":
        return (
          <div className="space-y-1">
            {(pcapInfosData.protocols.dns_domains ?? []).map(
              (domain: string, index: number) => (
                <React.Fragment key={domain}>
                  <div className="text-sm font-mono">{domain}</div>
                  {index <
                    (pcapInfosData.protocols.dns_domains?.length ?? 0) - 1 && (
                    <Separator className="my-1" />
                  )}
                </React.Fragment>
              )
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-row gap-4 w-full">
      {/* Protocols List */}
      <ScrollArea className="h-96 w-48 rounded-md border">
        <div className="p-4 space-y-2">
          {protocols.map((protocol) => (
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

      {/* Protocol Data */}
      {selectedProtocol && (
        <ScrollArea className="h-96 flex-1 rounded-md border">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">
              {protocols.find((p) => p.key === selectedProtocol)?.label}
            </h3>
            {renderProtocolData()}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
