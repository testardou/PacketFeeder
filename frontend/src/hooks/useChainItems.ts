import { useState } from "react";
import type { ChainItem, ChainPcapItem } from "@/components/chainbuilder/types";

export function useChainItems() {
  const [chainItems, setChainItems] = useState<ChainItem[]>([]);

  const addPcap = (
    techniqueId: string,
    technique: ChainPcapItem["technique"],
    pcapFile: string,
    tacticId?: string
  ) => {
    const newItem: ChainPcapItem = {
      type: "pcap",
      id: `${techniqueId}-${Date.now()}`,
      techniqueId,
      technique,
      tacticId,
      pcapFile,
    };
    setChainItems((prev) => [...prev, newItem]);
  };

  const addPcapFromDrop = (data: Omit<ChainPcapItem, "id">) => {
    const newItem: ChainPcapItem = {
      ...data,
      type: "pcap",
      id: `${data.techniqueId}-${Date.now()}`,
    };
    setChainItems((prev) => [...prev, newItem]);
  };

  const addSleep = () => {
    setChainItems((prev) => [
      ...prev,
      { type: "sleep", id: `sleep-${Date.now()}`, duration: 5 },
    ]);
  };

  const updateSleepDuration = (id: string, duration: number) => {
    setChainItems((prev) =>
      prev.map((item) =>
        item.id === id && item.type === "sleep"
          ? { ...item, duration }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setChainItems((prev) => prev.filter((item) => item.id !== id));
  };

  const reorderItems = (reorderedItems: ChainItem[]) => {
    setChainItems(reorderedItems);
  };

  return {
    chainItems,
    addPcap,
    addPcapFromDrop,
    addSleep,
    updateSleepDuration,
    removeItem,
    reorderItems,
  };
}

