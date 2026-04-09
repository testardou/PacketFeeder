import { useState, useEffect } from "react";
import { useQuery, type UseMutationResult } from "@tanstack/react-query";
import type {
  InterfacesType,
  PcapInfoType,
  ReplayModeType,
} from "@/types/types";
import { SelectInterface } from "@/components/selectInterface/SelectInterface";
import { SelectReplayModes } from "@/components/selectReplayModes/SelectReplayModes";
import { ReplayFilter } from "@/components/replayFilter/ReplayFilter";
import { RunReplay } from "@/components/runReplay/RunReplay";
import { API_CONFIG } from "@/config/api";
import { useRewriteContext } from "@/context/RewriteContext";

interface ReplayConfigurationProps {
  selectFile: string;
  infosMutation: UseMutationResult<PcapInfoType, Error, string, unknown>;
}

export function ReplayConfiguration({
  selectFile,
  infosMutation,
}: ReplayConfigurationProps) {
  const { rewriteValues, resetRewrites } = useRewriteContext();

  const [selectedMode, setSelectedMode] = useState<ReplayModeType>("realTime");
  const [selectedInterface, setSelectedInterface] = useState<string | null>(
    null,
  );

  const [stepIndex, setStepIndex] = useState<number>(0);
  const [filterIndex, setFilterIndex] = useState<number | null>(null);
  const [filterRange, setFilterRange] = useState<string>("");

  useEffect(() => {
    resetRewrites();
    setStepIndex(0);
    setFilterIndex(null);
    setFilterRange("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectFile]);

  const { data: ifaces_list, isLoading: interfacesLoading } =
    useQuery<InterfacesType>({
      queryKey: ["interfaces"],
      queryFn: async () => {
        const res = await fetch(`${API_CONFIG.API_BASE}/get_interfaces/`);
        if (!res.ok) {
          throw new Error("Erreur API");
        }
        return res.json();
      },
    });

  if (interfacesLoading) {
    return <p>Loading interfaces...</p>;
  }

  return (
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
  );
}
