import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useScenarioBuilderQueries } from "@/hooks/useScenarioBuilderQueries";
import { useScenarioItems } from "@/hooks/useScenarioItems";
import { useScenarioInfos } from "@/hooks/useScenarioInfos";
import { useScenarioRewrites } from "@/hooks/useScenarioRewrites";
import { ScenarioRewritePanel } from "@/components/scenariobuilder/ScenarioRewritePanel";
import { SelectInterface } from "@/components/selectInterface/SelectInterface";
import { SelectReplayModes } from "@/components/selectReplayModes/SelectReplayModes";
import { ReplayFilter } from "@/components/replayFilter/ReplayFilter";
import { API_CONFIG } from "@/config/api";
import type { InterfacesType, ReplayModeType } from "@/types/types";

import { ScenarioBuildPhase } from "@/components/scenarioBuildPhase/ScenarioBuildPhase";
import { Spinner } from "@/components/ui/spinner";
import { RunScenarioReplay } from "@/components/runReplay/RunScenarioReplay";
import { TechniqueScenarioList } from "@/components/scenariobuilder/TechniqueScenarioList";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function ScenarioBuilder() {
  const queries = useScenarioBuilderQueries();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const scenario = useScenarioItems();
  const {
    addPcapFromDrop,
    removeItem,
    reorderItems,
    addSleep,
    updateSleepDuration,
    scenarioItems,
    clearScenario,
    setScenarioItems,
  } = scenario;

  const scenarioInfosMutation = useScenarioInfos();

  const {
    globalRewrites,
    perPcapRewrites,
    globalRewriteValues,
    getPerPcapRewriteValues,
    resetAll: resetRewrites,
  } = useScenarioRewrites();

  const [selectedMode, setSelectedMode] = useState<ReplayModeType>("realTime");
  const [selectedInterface, setSelectedInterface] = useState<string | null>(
    null,
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [filterIndex, setFilterIndex] = useState<number | null>(null);
  const [filterRange, setFilterRange] = useState("");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step === 0) resetRewrites();
    if (step === 1) scenarioInfosMutation.mutate(scenarioItems, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const { data: ifacesList } = useQuery<InterfacesType>({
    queryKey: ["interfaces"],
    queryFn: async () => {
      const res = await fetch(`${API_CONFIG.API_BASE}/get_interfaces/`);
      if (!res.ok) throw new Error("Failed to load interfaces");
      return res.json();
    },
  });

  if (queries.tacticsLoading) {
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
    <>
      <div
        className={`fixed top-0 pt-12 left-0 bottom-0 w-80 border-r bg-card z-2 transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 pt-11 h-full flex flex-col">
          <TechniqueScenarioList
            clearScenario={clearScenario}
            items={scenarioItems}
            onRemove={removeItem}
            onReorder={reorderItems}
            onDropFromOutside={addPcapFromDrop}
            onAddSleep={addSleep}
            onUpdateSleepDuration={updateSleepDuration}
            setStep={setStep}
            step={step}
            setScenarioItems={setScenarioItems}
          />
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className={`fixed top-14 z-20 transition-all duration-200 ${
          sidebarOpen ? "left-68" : "left-2"
        }`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <PanelLeftClose className="size-6" />
        ) : (
          <PanelLeftOpen className="size-6" />
        )}
      </Button>
      <div className="p-6 space-y-4 max-w-6xl mx-auto">
        <h1 className="text-4xl mx-auto w-fit font-bold">Scenario Builder</h1>
        {step === 0 && (
          <ScenarioBuildPhase scenario={scenario} queries={queries} />
        )}
        {step === 1 && (
          <>
            {scenarioInfosMutation.isPending && (
              <div className="flex items-center justify-center h-screen">
                <div className="flex flex-row gap-2 items-center">
                  <Spinner className="size-8" />
                  <p className="text-5xl w-auto">Loading...</p>
                </div>
              </div>
            )}
            {scenarioInfosMutation.data && (
              <ScenarioRewritePanel
                globalRewriteValues={globalRewriteValues}
                getPerPcapRewriteValues={getPerPcapRewriteValues}
                scenarioInfos={scenarioInfosMutation.data}
              />
            )}
          </>
        )}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-row gap-8">
              <SelectInterface
                selectedInterface={selectedInterface}
                setSelectedInterface={setSelectedInterface}
                ifaces={ifacesList?.interfaces}
                disabled={false}
              />
              <SelectReplayModes
                selected={selectedMode}
                setSelected={setSelectedMode}
                disabled={false}
              />
              <ReplayFilter
                filterIndex={filterIndex}
                setFilterIndex={setFilterIndex}
                filterRange={filterRange}
                setFilterRange={setFilterRange}
                disabled={false}
              />
            </div>
            <RunScenarioReplay
              scenarioItems={scenarioItems}
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
    </>
  );
}
