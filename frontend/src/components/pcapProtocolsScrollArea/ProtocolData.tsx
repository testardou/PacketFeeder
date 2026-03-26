import { Separator } from "@/components/ui/separator";
import { ScrollAreaModify } from "@/components/scrollAreaModify/ScrollAreaModify";
import type { ProtocolDataType, ProtocolType } from "@/types/types";
import React from "react";
import { useRewriteContext } from "@/context/RewriteContext";

interface IProtocolDataProps {
  selectedProtocol: ProtocolType;
  protocol: ProtocolDataType | undefined;
  ipv4Regex: RegExp;
  ipv6Regex: RegExp;
  macAddrRegex: RegExp;
  dnsDomainRegex: RegExp;
  portRegex: RegExp;
}

export const ProtocolData = ({
  selectedProtocol,
  protocol,
  ipv4Regex,
  ipv6Regex,
  macAddrRegex,
  dnsDomainRegex,
  portRegex,
}: IProtocolDataProps) => {
  const { rewriteValues } = useRewriteContext();

  if (!selectedProtocol || !protocol || !protocol.data) return null;

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
