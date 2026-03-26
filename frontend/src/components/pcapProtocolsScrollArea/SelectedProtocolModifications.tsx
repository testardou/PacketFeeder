import { ModifiedPcapRecap } from "@/components/modifiedPcapRecap/ModifiedPcapRecap";
import { useRewriteContext } from "@/context/RewriteContext";
import type { ProtocolType } from "@/types/types";

interface ISelectedProtocolModificationsProps {
  selectedProtocol: ProtocolType;
}

export const SelectedProtocolModifications = ({
  selectedProtocol,
}: ISelectedProtocolModificationsProps) => {
  const { rewriteValues } = useRewriteContext();

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
