import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useScenarioBuilderQueries } from "@/hooks/useScenarioBuilderQueries";
import { useScenarioItems } from "@/hooks/useScenarioItems";
import { useScenarioInfos } from "@/hooks/useScenarioInfos";
import { useScenarioRewrites } from "@/hooks/useScenarioRewrites";
import { ScenarioRewritePanel } from "@/components/scenariobuilder/ScenarioRewritePanel";
import { SelectInterface } from "@/components/selectInterface/SelectInterface";
import { SelectReplayModes } from "@/components/selectReplayModes/SelectReplayModes";
import { ReplayFilter } from "@/components/replayFilter/ReplayFilter";
// import { RunScenarioReplay } from "@/components/runReplay/RunScenarioReplay";
import { API_CONFIG } from "@/config/api";
import type { InterfacesType, ReplayModeType } from "@/types/types";
import { ScenarioBuildPhase } from "@/components/scenarioBuildPhase/ScenarioBuildPhase";

export default function ScenarioBuilder() {
  const queries = useScenarioBuilderQueries();

  const scenario = useScenarioItems();

  // --- Scenario infos ---
  const scenarioInfosMutation = useScenarioInfos();

  // --- Rewrites ---
  const {
    // globalRewrites,
    // perPcapRewrites,
    globalRewriteValues,
    getPerPcapRewriteValues,
    resetAll: resetRewrites,
  } = useScenarioRewrites();

  // --- Replay state ---
  const [selectedMode, setSelectedMode] = useState<ReplayModeType>("realTime");
  const [selectedInterface, setSelectedInterface] = useState<string | null>(
    null,
  );
  // const [stepIndex, setStepIndex] = useState(0);
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
      <h1 className="text-4xl mx-auto w-fit font-bold">Scenario Builder</h1>

      <ScenarioBuildPhase
        scenario={scenario}
        queries={queries}
        scenarioInfosMutation={scenarioInfosMutation}
        resetRewrites={resetRewrites}
      />

      {scenarioInfosMutation.data && (
        <ScenarioRewritePanel
          scenarioInfos={scenarioInfosMutation.data}
          globalRewriteValues={globalRewriteValues}
          getPerPcapRewriteValues={getPerPcapRewriteValues}
        />
      )}
      {scenario.scenarioItems.some((item) => item.type === "pcap") && (
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-bold">Replay</h2>

          <div className="flex flex-row gap-20">
            <SelectInterface
              selectedInterface={selectedInterface}
              setSelectedInterface={setSelectedInterface}
              ifaces={ifacesList?.interfaces}
            />
            <SelectReplayModes
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

          {/* <RunScenarioReplay
            scenarioItems={scenario.scenarioItems}
            globalRewrites={globalRewrites}
            perPcapRewrites={perPcapRewrites}
            selectedMode={selectedMode}
            selectedInterface={selectedInterface}
            stepIndex={stepIndex}
            setStepIndex={setStepIndex}
            filterIndex={filterIndex}
            filterRange={filterRange}
          /> */}
        </div>
      )}
    </div>
  );
}
