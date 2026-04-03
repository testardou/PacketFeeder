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

  if (selectedProtocol === "ip") {
    return (
      <ScrollAreaModify
        valuesArray={protocol.data as string[]}
        setNewValues={(v) => rewriteValues.setRewrite("ip", v)}
        newValues={rewriteValues.rewrites.ip}
        validator={ipv4Regex}
        modalLabel="New IP"
        modalTitle="Edit IP"
        modalDescription="Modify or rewrite this IP."
        errorMessage="The new IP is not valid"
      />
    );
  }
  if (selectedProtocol === "mac") {
    return (
      <ScrollAreaModify
        valuesArray={protocol.data as string[]}
        setNewValues={(v) => rewriteValues.setRewrite("mac", v)}
        newValues={rewriteValues.rewrites.mac}
        validator={macAddrRegex}
        modalLabel="New MAC address"
        modalTitle="Edit MAC address"
        modalDescription="Modify or rewrite this MAC address."
        errorMessage="The new MAC address is not valid"
      />
    );
  }

  if (selectedProtocol === "ipv6") {
    return (
      <ScrollAreaModify
        valuesArray={protocol.data as string[]}
        setNewValues={(v) => rewriteValues.setRewrite("ipv6", v)}
        newValues={rewriteValues.rewrites.ipv6}
        validator={ipv6Regex}
        modalLabel="New IPv6"
        modalTitle="Edit IPv6"
        modalDescription="Modify or rewrite this IPv6 address."
        errorMessage="The new IPv6 address is not valid"
      />
    );
  }

  if (selectedProtocol === "arp") {
    return (
      <ScrollAreaModify
        valuesArray={protocol.data as string[]}
        setNewValues={(v) => rewriteValues.setRewrite("arp-ip", v)}
        newValues={rewriteValues.rewrites["arp-ip"]}
        validator={ipv4Regex}
        modalLabel="New ARP IP"
        modalTitle="Edit ARP IP"
        modalDescription="Modify or rewrite this ARP IP address."
        errorMessage="The new ARP IP is not valid"
      />
    );
  }

  if (selectedProtocol === "dns") {
    return (
      <ScrollAreaModify
        valuesArray={protocol.data as string[]}
        setNewValues={(v) => rewriteValues.setRewrite("dns", v)}
        newValues={rewriteValues.rewrites.dns}
        validator={dnsDomainRegex}
        modalLabel="New DNS Domain"
        modalTitle="Edit DNS Domain"
        modalDescription="Modify or rewrite this DNS domain."
        errorMessage="The new DNS domain is not valid"
      />
    );
  }

  if (selectedProtocol === "tcp") {
    return (
      <ScrollAreaModify
        valuesArray={protocol.data.map(String)}
        setNewValues={(v) => rewriteValues.setRewrite("tcp", v)}
        newValues={rewriteValues.rewrites.tcp}
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

  if (selectedProtocol === "udp") {
    return (
      <ScrollAreaModify
        valuesArray={protocol.data.map(String)}
        setNewValues={(v) => rewriteValues.setRewrite("udp", v)}
        newValues={rewriteValues.rewrites.udp}
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
