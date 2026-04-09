import { HandleFiles } from "@/components/handleFiles/HandleFiles";
import type { PacketDetailsType, PcapInfoType } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { API_CONFIG } from "@/config/api";
import { useRewriteContext } from "@/context/RewriteContext";
import { PcapInformations } from "@/components/pcapInformations/PcapInformations";

export const FilePage = () => {
  const { resetRewrites } = useRewriteContext();

  const [selectFile, setSelectFile] = useState<string | null>(null);

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

  const infosMutation = useMutation<PcapInfoType, Error, string>({
    mutationFn: async (file: string) => {
      const res = await fetch(`${API_CONFIG.API_BASE}/infos-pcap?file=${file}`);

      if (!res.ok) throw new Error("API Error");

      return res.json();
    },
    onSuccess: () => {
      resetRewrites();
    },
  });

  const handleSetSelectFile = (fileName: string | null) => {
    if (fileName !== selectFile) {
      resetRewrites();
      detailsMutation.reset();
      infosMutation.reset();
    }
    setSelectFile(fileName);
    if (fileName) {
      infosMutation.mutate(fileName);
      detailsMutation.mutate(fileName);
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-6xl mx-auto">
      <h1 className="text-4xl mx-auto w-fit font-bold">Files</h1>
      <HandleFiles
        detailsMutation={detailsMutation}
        selectFile={selectFile}
        setSelectFile={handleSetSelectFile}
      />
      {selectFile && (
        <PcapInformations
          selectedFile={selectFile}
          detailsMutation={detailsMutation}
          infosMutation={infosMutation}
        />
      )}
    </div>
  );
};
