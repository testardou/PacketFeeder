import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { PacketDetailsType, PcapInfoType } from "@/types/types";
import { HandleFiles } from "@/components/handleFiles/HandleFiles";
import { API_CONFIG } from "@/config/api";
import { useRewriteContext } from "@/context/RewriteContext";
import { ReplayConfiguration } from "@/components/mitre/ReplayConfiguration";
import { PcapInformations } from "@/components/pcapInformations/PcapInformations";

export const ReplayPage = () => {
  const { resetRewrites } = useRewriteContext();

  const [selectFile, setSelectFile] = useState<string | null>(null);

  const infosMutation = useMutation<PcapInfoType, Error, string>({
    mutationFn: async (file: string) => {
      const res = await fetch(`${API_CONFIG.API_BASE}/infos-pcap?file=${file}`);

      if (!res.ok) throw new Error("API Error");

      return res.json();
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
  });

  useEffect(() => {
    detailsMutation.reset();
    infosMutation.reset();
    resetRewrites();
    if (selectFile) {
      infosMutation.mutate(selectFile);
      detailsMutation.mutate(selectFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectFile]);

  return (
    <div className="p-6 space-y-4 max-w-6xl mx-auto">
      <h1 className="text-4xl mx-auto w-fit font-bold">Replay</h1>
      <HandleFiles
        detailsMutation={detailsMutation}
        selectFile={selectFile}
        setSelectFile={setSelectFile}
      />
      {selectFile && (
        <PcapInformations
          selectedFile={selectFile}
          detailsMutation={detailsMutation}
          infosMutation={infosMutation}
        />
      )}
      <ReplayConfiguration
        infosMutation={infosMutation}
        selectFile={selectFile ?? ""}
      />
    </div>
  );
};
