import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import type {
  InterfacesType,
  PacketDetailsType,
  ReplayModeType,
} from "@/types/types";
import { ReplayModes } from "@/components/replayModes/ReplayModes";
import { SelectInterface } from "@/components/selectInterface/SelectInterface";
import { HandleFiles } from "@/components/handleFiles/HandleFiles";
import { PacketDetails } from "@/components/packetDetails/PacketDetails";
import { RunReplay } from "@/components/runReplay/RunReplay";
import { ReplayFilter } from "@/components/replayFilter/ReplayFilter";
import { API_CONFIG } from "@/config/api";
import { useRewriteContext } from "@/context/RewriteContext";

export const ReplayPage = () => {
  const { rewriteValues, resetRewrites } = useRewriteContext();

  const [selectFile, setSelectFile] = useState<string | null>(null);

  const [selectedMode, setSelectedMode] = useState<ReplayModeType>("realTime");
  const [selectedInterface, setSelectedInterface] = useState<string | null>(
    null,
  );

  const [stepIndex, setStepIndex] = useState<number>(0);
  const [filterIndex, setFilterIndex] = useState<number | null>(null);
  const [filterRange, setFilterRange] = useState<string>("");

  const resetStates = () => {
    resetRewrites();
    setStepIndex(0);
    setFilterIndex(null);
    setFilterRange("");
  };

  const { data: ifaces_list, isLoading } = useQuery<InterfacesType>({
    queryKey: ["interfaces"], // identifiant unique du cache
    queryFn: async () => {
      const res = await fetch(`${API_CONFIG.API_BASE}/get_interfaces/`);

      if (!res.ok) {
        throw new Error("Erreur API");
      }
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

  if (isLoading) {
    return <p>Loading interfaces...</p>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-4xl mx-auto w-fit font-bold">Replay</h1>
      <HandleFiles
        resetStates={resetStates}
        detailsMutation={detailsMutation}
        selectFile={selectFile}
        setSelectFile={handleSetSelectFile}
        rewriteValues={rewriteValues}
      />
      <div className="flex flex-col gap-5">
        <h2 className="text-2xl">Configuration</h2>

        <PacketDetails
          selectedFile={selectFile}
          data={detailsMutation?.data}
          isPending={detailsMutation.isPending}
        />
        <div className="flex flex-row gap-20">
          <SelectInterface
            selectedInterface={selectedInterface}
            setSelectedInterface={setSelectedInterface}
            ifaces={ifaces_list?.interfaces}
          />
          <ReplayModes selected={selectedMode} setSelected={setSelectedMode} />
        </div>
        <ReplayFilter
          filterIndex={filterIndex}
          setFilterIndex={setFilterIndex}
          filterRange={filterRange}
          setFilterRange={setFilterRange}
        />
        <RunReplay
          selectedInterface={selectedInterface}
          rewrites={rewriteValues}
          stepIndex={stepIndex}
          setStepIndex={setStepIndex}
          selectedMode={selectedMode}
          selectFile={selectFile}
          filterIndex={filterIndex}
          filterRange={filterRange}
        />
      </div>
    </div>
  );
};
