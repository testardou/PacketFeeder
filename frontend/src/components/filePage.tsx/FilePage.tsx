import { HandleFiles } from "@/components/handleFiles/HandleFiles";
import { PacketDetails } from "@/components/packetDetails/PacketDetails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PacketDetailsType } from "@/types/types";
import { Label } from "@radix-ui/react-label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { API_CONFIG } from "@/config/api";
import { useRewriteContext } from "@/context/RewriteContext";

export const FilePage = () => {
  const queryClient = useQueryClient();
  const { rewriteState, resetRewrites } = useRewriteContext();

  const [fileName, setFileName] = useState<string | null>(null);
  const [selectFile, setSelectFile] = useState<string | null>(null);

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
      resetRewrites();
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
      resetRewrites();
    },
  });

  const handleSetSelectFile = (fileName: string | null) => {
    // Reset all states when file selection changes
    if (fileName !== selectFile) {
      resetRewrites();
      detailsMutation.reset();
    }
    setSelectFile(fileName);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-4xl mx-auto w-fit font-bold">Files</h1>
      <HandleFiles
        resetStates={resetRewrites}
        detailsMutation={detailsMutation}
        selectFile={selectFile}
        setSelectFile={handleSetSelectFile}
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
