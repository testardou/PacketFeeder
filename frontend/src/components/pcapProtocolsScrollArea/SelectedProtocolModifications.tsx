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
      if (rewriteValues.rewrites.ip && rewriteValues.rewrites.ip.length > 0) {
        return (
          <ModifiedPcapRecap
            cardTitle="Modified IPs"
            rewriteValues={rewriteValues.rewrites.ip}
            setRewriteValues={(value) => rewriteValues.setRewrite("ip", value)}
          />
        );
      }
      return null;
    case "mac":
      if (rewriteValues.rewrites.mac && rewriteValues.rewrites.mac.length > 0) {
        return (
          <ModifiedPcapRecap
            cardTitle="Modified MACs"
            rewriteValues={rewriteValues.rewrites.mac}
            setRewriteValues={(value) => rewriteValues.setRewrite("mac", value)}
          />
        );
      }
      return null;
    case "ipv6":
      if (
        rewriteValues.rewrites.ipv6 &&
        rewriteValues.rewrites.ipv6.length > 0
      ) {
        return (
          <ModifiedPcapRecap
            cardTitle="Modified IPv6s"
            rewriteValues={rewriteValues.rewrites.ipv6}
            setRewriteValues={(value) =>
              rewriteValues.setRewrite("ipv6", value)
            }
          />
        );
      }
      return null;
    case "arp":
      if (
        rewriteValues.rewrites["arp-ip"] &&
        rewriteValues.rewrites["arp-ip"].length > 0
      ) {
        return (
          <ModifiedPcapRecap
            cardTitle="Modified ARP IPs"
            rewriteValues={rewriteValues.rewrites["arp-ip"]}
            setRewriteValues={(value) =>
              rewriteValues.setRewrite("arp-ip", value)
            }
          />
        );
      }
      return null;
    case "dns":
      if (rewriteValues.rewrites.dns && rewriteValues.rewrites.dns.length > 0) {
        return (
          <ModifiedPcapRecap
            cardTitle="Modified DNS Domains"
            rewriteValues={rewriteValues.rewrites.dns}
            setRewriteValues={(value) => rewriteValues.setRewrite("dns", value)}
          />
        );
      }
      return null;
    case "tcp":
      if (rewriteValues.rewrites.tcp && rewriteValues.rewrites.tcp.length > 0) {
        return (
          <ModifiedPcapRecap
            cardTitle="Modified TCP Ports"
            rewriteValues={rewriteValues.rewrites.tcp}
            setRewriteValues={(value) => rewriteValues.setRewrite("tcp", value)}
          />
        );
      }
      return null;
    case "udp":
      if (rewriteValues.rewrites.udp && rewriteValues.rewrites.udp.length > 0) {
        return (
          <ModifiedPcapRecap
            cardTitle="Modified UDP Ports"
            rewriteValues={rewriteValues.rewrites.udp}
            setRewriteValues={(value) => rewriteValues.setRewrite("udp", value)}
          />
        );
      }
      return null;
    default:
      return null;
  }
};
