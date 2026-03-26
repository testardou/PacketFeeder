import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useChainBuilderQueries } from "@/hooks/useChainBuilderQueries";
import { useChainItems } from "@/hooks/useChainItems";
import { useChainInfos } from "@/hooks/useChainInfos";
import { useChainRewrites } from "@/hooks/useChainRewrites";
import { ChainRewritePanel } from "@/components/chainbuilder/ChainRewritePanel";
import { SelectInterface } from "@/components/selectInterface/SelectInterface";
import { ReplayModes } from "@/components/replayModes/ReplayModes";
import { ReplayFilter } from "@/components/replayFilter/ReplayFilter";
import { RunChainReplay } from "@/components/runReplay/RunChainReplay";
import { API_CONFIG } from "@/config/api";
import type { InterfacesType, ReplayModeType } from "@/types/types";
import { ChainBuildPhase } from "@/components/chainBuildPhase/ChainBuildPhase";

export default function ChainBuilder() {
  const queries = useChainBuilderQueries();

  const chain = useChainItems();

  // --- Chain infos ---
  const chainInfosMutation = useChainInfos();

  // --- Rewrites ---
  const {
    globalRewrites,
    perPcapRewrites,
    globalRewriteValues,
    getPerPcapRewriteValues,
    resetAll: resetRewrites,
  } = useChainRewrites();

  // --- Replay state ---
  const [selectedMode, setSelectedMode] = useState<ReplayModeType>("realTime");
  const [selectedInterface, setSelectedInterface] = useState<string | null>(
    null,
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [filterIndex, setFilterIndex] = useState<number | null>(null);
  const [filterRange, setFilterRange] = useState("");

  const { data: ifacesList } = useQuery<InterfacesType>({
    queryKey: ["interfaces"],
    queryFn: async () => {
      const res = await fetch(`${API_CONFIG.API_BASE}/get_interfaces/`);
      if (!res.ok) throw new Error("Failed to load interfaces");
      return res.json();
    },
  });

  if (queries.tacticsLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-4xl mx-auto w-fit font-bold">Chain Builder</h1>

      <ChainBuildPhase
        chain={chain}
        queries={queries}
        chainInfosMutation={chainInfosMutation}
        resetRewrites={resetRewrites}
      />

      {chainInfosMutation.data && (
        <ChainRewritePanel
          chainInfos={chainInfosMutation.data}
          globalRewriteValues={globalRewriteValues}
          getPerPcapRewriteValues={getPerPcapRewriteValues}
        />
      )}
      {chain.chainItems.some((item) => item.type === "pcap") && (
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-bold">Replay</h2>

          <div className="flex flex-row gap-20">
            <SelectInterface
              selectedInterface={selectedInterface}
              setSelectedInterface={setSelectedInterface}
              ifaces={ifacesList?.interfaces}
            />
            <ReplayModes
              selected={selectedMode}
              setSelected={setSelectedMode}
            />
          </div>

          <ReplayFilter
            filterIndex={filterIndex}
            setFilterIndex={setFilterIndex}
            filterRange={filterRange}
            setFilterRange={setFilterRange}
          />

          <RunChainReplay
            chainItems={chain.chainItems}
            globalRewrites={globalRewrites}
            perPcapRewrites={perPcapRewrites}
            selectedMode={selectedMode}
            selectedInterface={selectedInterface}
            stepIndex={stepIndex}
            setStepIndex={setStepIndex}
            filterIndex={filterIndex}
            filterRange={filterRange}
          />
        </div>
      )}
    </div>
  );
}
