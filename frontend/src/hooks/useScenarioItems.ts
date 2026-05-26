import { useState } from "react";
import type {
  ScenarioItem,
  ScenarioPcapItem,
} from "@/components/scenariobuilder/types";
import type { PcapDataset } from "@/types/mitre";

export function useScenarioItems() {
  const [scenarioItems, setScenarioItems] = useState<ScenarioItem[]>([]);

  const addPcap = (
    techniqueId: string,
    technique: ScenarioPcapItem["technique"],
    pcapFile: string,
    tacticId?: string,
    dataset?: PcapDataset,
  ) => {
    const newItem: ScenarioPcapItem = {
      type: "pcap",
      id: `${techniqueId}-${Date.now()}`,
      techniqueId,
      technique,
      tacticId,
      pcapFile,
      dataset,
    };
    setScenarioItems((prev) => [...prev, newItem]);
  };

  const clearScenario = () => {
    setScenarioItems([]);
  };

  const addPcapFromDrop = (data: Omit<ScenarioPcapItem, "id">) => {
    const newItem: ScenarioPcapItem = {
      ...data,
      type: "pcap",
      id: `${data.techniqueId}-${Date.now()}`,
    };
    setScenarioItems((prev) => [...prev, newItem]);
  };

  const addSleep = () => {
    setScenarioItems((prev) => [
      ...prev,
      { type: "sleep", id: `sleep-${Date.now()}`, duration: 5 },
    ]);
  };

  const updateSleepDuration = (id: string, duration: number) => {
    setScenarioItems((prev) =>
      prev.map((item) =>
        item.id === id && item.type === "sleep" ? { ...item, duration } : item,
      ),
    );
  };

  const removeItem = (id: string) => {
    setScenarioItems((prev) => prev.filter((item) => item.id !== id));
  };

  const reorderItems = (reorderedItems: ScenarioItem[]) => {
    setScenarioItems(reorderedItems);
  };

  return {
    scenarioItems,
    setScenarioItems,
    addPcap,
    addPcapFromDrop,
    addSleep,
    updateSleepDuration,
    removeItem,
    reorderItems,
    clearScenario,
  };
}
