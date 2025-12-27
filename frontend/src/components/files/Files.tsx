import { HandleFiles } from "@/components/handleFiles/HandleFiles";
import { PacketDetails } from "@/components/packetDetails/PacketDetails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  NewValuesPcapType,
  PacketDetailsType,
  RewriteValues,
} from "@/types/types";
import { Label } from "@radix-ui/react-label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const Files = () => {
  const queryClient = useQueryClient();
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectFile, setSelectFile] = useState<string | null>(null);
  const [rewriteIps, setRewriteIps] = useState<NewValuesPcapType[]>([]);
  const [rewriteMacs, setRewriteMacs] = useState<NewValuesPcapType[]>([]);
  const [rewriteIpv6s, setRewriteIpv6s] = useState<NewValuesPcapType[]>([]);
  const [rewriteArpIps, setRewriteArpIps] = useState<NewValuesPcapType[]>([]);
  const [rewriteDnsDomains, setRewriteDnsDomains] = useState<
    NewValuesPcapType[]
  >([]);
  const [rewriteTcpPorts, setRewriteTcpPorts] = useState<NewValuesPcapType[]>(
    []
  );
  const [rewriteUdpPorts, setRewriteUdpPorts] = useState<NewValuesPcapType[]>(
    []
  );

  const rewriteValues: RewriteValues = {
    rewriteIps,
    setRewriteIps,
    rewriteMacs,
    setRewriteMacs,
    rewriteIpv6s,
    setRewriteIpv6s,
    rewriteArpIps,
    setRewriteArpIps,
    rewriteDnsDomains,
    setRewriteDnsDomains,
    rewriteTcpPorts,
    setRewriteTcpPorts,
    rewriteUdpPorts,
    setRewriteUdpPorts,
  };

  const resetStates = () => {
    setRewriteIps([]);
    setRewriteMacs([]);
    setRewriteIpv6s([]);
    setRewriteArpIps([]);
    setRewriteDnsDomains([]);
    setRewriteTcpPorts([]);
    setRewriteUdpPorts([]);
  };

  const rewriteMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("file", selectFile ?? "");
      formData.append("filename", fileName ?? "");
      formData.append("rewriteIps", JSON.stringify(rewriteIps));
      formData.append("rewriteMacs", JSON.stringify(rewriteMacs));
      formData.append("rewriteIpv6s", JSON.stringify(rewriteIpv6s));
      formData.append("rewriteArpIps", JSON.stringify(rewriteArpIps));
      formData.append("rewriteDnsDomains", JSON.stringify(rewriteDnsDomains));
      formData.append("rewriteTcpPorts", JSON.stringify(rewriteTcpPorts));
      formData.append("rewriteUdpPorts", JSON.stringify(rewriteUdpPorts));

      const res = await fetch("http://localhost:5000/api/rewrite-pcap-file/", {
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
        `http://localhost:5000/api/detail-packets-pcap?file=${file}`
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
              (rewriteIps.length === 0 &&
                rewriteMacs.length === 0 &&
                rewriteIpv6s.length === 0 &&
                rewriteArpIps.length === 0 &&
                rewriteDnsDomains.length === 0 &&
                rewriteTcpPorts.length === 0 &&
                rewriteUdpPorts.length === 0)
            }
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>
        <Button
          onClick={() => rewriteMutation.mutate()}
          disabled={
            !selectFile ||
            (rewriteIps.length === 0 &&
              rewriteMacs.length === 0 &&
              rewriteIpv6s.length === 0 &&
              rewriteArpIps.length === 0 &&
              rewriteDnsDomains.length === 0 &&
              rewriteTcpPorts.length === 0 &&
              rewriteUdpPorts.length === 0) ||
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
