import { HandleFiles } from "@/components/handleFiles/HandleFiles";
import { ModifiedPcapRecap } from "@/components/modifiedPcapRecap/ModifiedPcapRecap";
import { PacketDetails } from "@/components/packetDetails/PacketDetails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { NewValuesPcapType, PacketDetailsType } from "@/types/types";
import { Label } from "@radix-ui/react-label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const Files = () => {
  const queryClient = useQueryClient();
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectFile, setSelectFile] = useState<string | null>(null);
  const [rewriteIps, setRewriteIps] = useState<NewValuesPcapType[]>([]);
  const [rewriteMacs, setRewriteMacs] = useState<NewValuesPcapType[]>([]);

  const resetStates = () => {
    setRewriteIps([]);
    setRewriteMacs([]);
  };

  const rewriteMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("file", selectFile ?? "");
      formData.append("filename", fileName ?? "");
      formData.append("rewriteIps", JSON.stringify(rewriteIps));
      formData.append("rewriteMacs", JSON.stringify(rewriteMacs));

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

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-4xl mx-auto w-fit font-bold">Files</h1>
      <HandleFiles
        resetStates={resetStates}
        detailsMutation={detailsMutation}
        selectFile={selectFile}
        setSelectFile={setSelectFile}
        rewriteIps={rewriteIps}
        setRewriteIps={setRewriteIps}
        rewriteMacs={rewriteMacs}
        setRewriteMacs={setRewriteMacs}
      />
      {(rewriteIps.length > 0 || rewriteMacs.length > 0) && (
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl">Modifications</h2>
          <div className="flex flex-row gap-4">
            {rewriteIps.length > 0 && (
              <ModifiedPcapRecap
                cardTitle="Replaced Ips"
                setRewriteValues={setRewriteIps}
                rewriteValues={rewriteIps}
              />
            )}
            {rewriteMacs.length > 0 && (
              <ModifiedPcapRecap
                cardTitle="Replaced MACs addresses"
                setRewriteValues={setRewriteMacs}
                rewriteValues={rewriteMacs}
              />
            )}
          </div>
        </div>
      )}
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
              (rewriteIps.length === 0 && rewriteMacs.length === 0)
            }
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>
        <Button
          onClick={() => rewriteMutation.mutate()}
          disabled={
            !selectFile ||
            (rewriteIps.length === 0 && rewriteMacs.length === 0) ||
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
