import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import type {
  InterfacesType,
  PacketDetailsType,
  PcapInfoType,
  ReplayModeType,
} from "@/types/types";
import { SelectInterface } from "@/components/selectInterface/SelectInterface";
import { HandleFiles } from "@/components/handleFiles/HandleFiles";
import { RunReplay } from "@/components/runReplay/RunReplay";
import { ReplayFilter } from "@/components/replayFilter/ReplayFilter";
import { API_CONFIG } from "@/config/api";
import { useRewriteContext } from "@/context/RewriteContext";
import { PcapInfos } from "@/components/pcapInfos/PcapInfos";
import { PcapRewrite } from "@/components/pcapRewrite/PcapRewrite";
import { PcapDetails } from "@/components/pcapDetails/PcapDetails";
import { SelectReplayModes } from "@/components/selectReplayModes/SelectReplayModes";
import { Spinner } from "@/components/ui/spinner";

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
    if (fileName !== selectFile) {
      resetStates();
      detailsMutation.reset();
      infosMutation.reset();
    }
    setSelectFile(fileName);
    if (fileName) {
      infosMutation.mutate(fileName);
      detailsMutation.mutate(fileName);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-row gap-2 items-center ">
          <Spinner className="size-8" />
          <p className="text-5xl w-auto ">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 max-w-6xl mx-auto">
      <h1 className="text-4xl mx-auto w-fit font-bold">Replay</h1>
      <HandleFiles
        resetStates={resetStates}
        detailsMutation={detailsMutation}
        selectFile={selectFile}
        setSelectFile={handleSetSelectFile}
      />
      {selectFile && (
        <>
          <h2 className="text-2xl">Informations</h2>
          <PcapInfos pcapInfos={infosMutation} />
          <PcapRewrite pcapInfos={infosMutation} />
          <PcapDetails
            selectedFile={selectFile}
            detailsMutation={detailsMutation}
          />
        </>
      )}
      <div className="flex flex-col gap-5">
        <h2 className="text-2xl">Configurations</h2>
        <div className="flex flex-row gap-8">
          <SelectInterface
            disabled={!selectFile}
            selectedInterface={selectedInterface}
            setSelectedInterface={setSelectedInterface}
            ifaces={ifaces_list?.interfaces}
          />
          <SelectReplayModes
            disabled={!selectFile}
            selected={selectedMode}
            setSelected={setSelectedMode}
          />
          <ReplayFilter
            totalPackets={infosMutation?.data?.packet_count ?? 0}
            disabled={!selectFile || infosMutation.isPending}
            filterIndex={filterIndex}
            setFilterIndex={setFilterIndex}
            filterRange={filterRange}
            setFilterRange={setFilterRange}
          />
        </div>
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
