import { HandleFiles } from "@/components/handleFiles/HandleFiles";
import { PacketDetails } from "@/components/packetDetails/PacketDetails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PacketDetailsType, RewriteValues } from "@/types/types";
import { Label } from "@radix-ui/react-label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useReducer, useState } from "react";
import { API_CONFIG } from "@/config/api";
import { initialRewriteState, rewriteReducer } from "@/hooks/useRewriteReducer";

export const Files = () => {
  const queryClient = useQueryClient();
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectFile, setSelectFile] = useState<string | null>(null);
  const [rewriteState, dispatchRewrite] = useReducer(
    rewriteReducer,
    initialRewriteState,
  );

  const rewriteValues: RewriteValues = {
    rewriteIps: rewriteState.rewriteIps,
    setRewriteIps: (ips) =>
      dispatchRewrite({ type: "SET_REWRITE_IPS", payload: ips }),
    rewriteMacs: rewriteState.rewriteMacs,
    setRewriteMacs: (macs) =>
      dispatchRewrite({ type: "SET_REWRITE_MACS", payload: macs }),
    rewriteIpv6s: rewriteState.rewriteIpv6s,
    setRewriteIpv6s: (ipv6s) =>
      dispatchRewrite({ type: "SET_REWRITE_IPV6S", payload: ipv6s }),
    rewriteArpIps: rewriteState.rewriteArpIps,
    setRewriteArpIps: (arpIps) =>
      dispatchRewrite({ type: "SET_REWRITE_ARP_IPS", payload: arpIps }),
    rewriteDnsDomains: rewriteState.rewriteDnsDomains,
    setRewriteDnsDomains: (dnsDomains) =>
      dispatchRewrite({ type: "SET_REWRITE_DNS_DOMAINS", payload: dnsDomains }),
    rewriteTcpPorts: rewriteState.rewriteTcpPorts,
    setRewriteTcpPorts: (tcpPorts) =>
      dispatchRewrite({ type: "SET_REWRITE_TCP_PORTS", payload: tcpPorts }),
    rewriteUdpPorts: rewriteState.rewriteUdpPorts,
    setRewriteUdpPorts: (udpPorts) =>
      dispatchRewrite({ type: "SET_REWRITE_UDP_PORTS", payload: udpPorts }),
  };

  const resetStates = () => {
    dispatchRewrite({ type: "RESET" });
  };

  const rewriteMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("file", selectFile ?? "");
      formData.append("filename", fileName ?? "");
      formData.append("rewriteIps", JSON.stringify(rewriteState.rewriteIps));
      formData.append("rewriteMacs", JSON.stringify(rewriteState.rewriteMacs));
      formData.append(
        "rewriteIpv6s",
        JSON.stringify(rewriteState.rewriteIpv6s),
      );
      formData.append(
        "rewriteArpIps",
        JSON.stringify(rewriteState.rewriteArpIps),
      );
      formData.append(
        "rewriteDnsDomains",
        JSON.stringify(rewriteState.rewriteDnsDomains),
      );
      formData.append(
        "rewriteTcpPorts",
        JSON.stringify(rewriteState.rewriteTcpPorts),
      );
      formData.append(
        "rewriteUdpPorts",
        JSON.stringify(rewriteState.rewriteUdpPorts),
      );

      const res = await fetch(`${API_CONFIG.API_BASE}/rewrite-pcap-file/`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erreur API");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pcap_files"] });
      resetStates();
    },
  });

  const detailsMutation = useMutation<PacketDetailsType[], Error, string>({
    mutationFn: async (file: string) => {
      const res = await fetch(
        `${API_CONFIG.API_BASE}/detail-packets-pcap?file=${file}`,
      );

      if (!res.ok) throw new Error("Erreur API");

      return res.json();
    },
    onSuccess: () => {
      resetStates();
    },
  });

  const handleSetSelectFile = (fileName: string | null) => {
    // Reset all states when file selection changes
    if (fileName !== selectFile) {
      resetStates();
      detailsMutation.reset();
    }
    setSelectFile(fileName);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-4xl mx-auto w-fit font-bold">Files</h1>
      <HandleFiles
        resetStates={resetStates}
        detailsMutation={detailsMutation}
        selectFile={selectFile}
        setSelectFile={handleSetSelectFile}
        rewriteValues={rewriteValues}
      />
      <PacketDetails
        selectedFile={selectFile}
        data={detailsMutation?.data}
        isPending={detailsMutation.isPending}
      />
      <div className="flex flex-row gap-5 items-center">
        <div className="flex flex-col gap-2">
          <Label>New file name</Label>
          <Input
            disabled={
              !selectFile ||
              (rewriteState.rewriteIps.length === 0 &&
                rewriteState.rewriteMacs.length === 0 &&
                rewriteState.rewriteIpv6s.length === 0 &&
                rewriteState.rewriteArpIps.length === 0 &&
                rewriteState.rewriteDnsDomains.length === 0 &&
                rewriteState.rewriteTcpPorts.length === 0 &&
                rewriteState.rewriteUdpPorts.length === 0)
            }
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>
        <Button
          onClick={() => rewriteMutation.mutate()}
          disabled={
            !selectFile ||
            (rewriteState.rewriteIps.length === 0 &&
              rewriteState.rewriteMacs.length === 0 &&
              rewriteState.rewriteIpv6s.length === 0 &&
              rewriteState.rewriteArpIps.length === 0 &&
              rewriteState.rewriteDnsDomains.length === 0 &&
              rewriteState.rewriteTcpPorts.length === 0 &&
              rewriteState.rewriteUdpPorts.length === 0) ||
            !fileName
          }
          className="mt-auto"
        >
          Create
        </Button>
      </div>
    </div>
  );
};
