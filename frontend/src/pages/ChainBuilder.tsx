import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Tactic, Technique, PcapDataResponse } from "@/types/scenarios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TacticSelector } from "@/components/scenarios/TacticSelector";
import { TechniqueSelector } from "@/components/scenarios/TechniqueSelector";
import {
  TechniqueChainList,
  type ChainItem,
  type ChainPcapItem,
} from "@/components/chainbuilder/TechniqueChainList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { API_CONFIG } from "@/config/api";

export default function ChainBuilder() {
  const [selectedTactic, setSelectedTactic] = useState<string | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(
    null
  );
  const [tacticData, setTacticData] = useState<Tactic | null>(null);
  const [techniqueData, setTechniqueData] = useState<Technique | null>(null);
  const [selectFile, setSelectFile] = useState<string | null>(null);
  const [chainItems, setChainItems] = useState<ChainItem[]>([]);
  const leftRef = useRef<HTMLDivElement>(null);
  const [leftHeight, setLeftHeight] = useState<number | undefined>(undefined);

  // Observe left column height to sync right column min-height
  const updateHeight = useCallback(() => {
    if (leftRef.current) {
      setLeftHeight(leftRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    const el = leftRef.current;
    if (!el) return;

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateHeight]);

  // Load available tactics
  const { data: tacticsList, isLoading: tacticsLoading } = useQuery<{
    files: string[];
  }>({
    queryKey: ["tactics"],
    queryFn: async () => {
      const res = await fetch(`${API_CONFIG.API_BASE}/get-tactics/`);
      if (!res.ok) throw new Error("Failed to load tactics");
      return res.json();
    },
  });

  // Load tactic data when selected
  const { data: loadedTactic } = useQuery<Tactic>({
    queryKey: ["tactic", selectedTactic],
    queryFn: async () => {
      if (!selectedTactic) throw new Error("No tactic selected");
      const res = await fetch(
        `${API_CONFIG.API_BASE}/get-tactic/${selectedTactic}`
      );
      if (!res.ok) throw new Error("Failed to load tactic");
      return res.json();
    },
    enabled: !!selectedTactic,
  });

  // Load all techniques for the selected tactic to get their names
  const { data: techniquesData } = useQuery<Record<string, Technique>>({
    queryKey: ["tactic_techniques", tacticData?.techniques],
    queryFn: async () => {
      if (!tacticData?.techniques) throw new Error("No techniques available");
      const techniques: Record<string, Technique> = {};

      await Promise.all(
        tacticData.techniques.map(async (techId) => {
          try {
            const res = await fetch(
              `${API_CONFIG.API_BASE}/get-technique/${techId}`
            );
            if (res.ok) {
              const data = await res.json();
              techniques[techId] = data;
            }
          } catch (error) {
            console.error(`Failed to load technique ${techId}:`, error);
          }
        })
      );

      return techniques;
    },
    enabled: !!tacticData?.techniques && tacticData.techniques.length > 0,
  });

  // Load technique data when selected
  const { data: loadedTechnique } = useQuery<Technique>({
    queryKey: ["technique", selectedTechnique],
    queryFn: async () => {
      if (!selectedTechnique) throw new Error("No technique selected");
      const res = await fetch(
        `${API_CONFIG.API_BASE}/get-technique/${selectedTechnique}`
      );
      if (!res.ok) throw new Error("Failed to load technique");
      return res.json();
    },
    enabled: !!selectedTechnique,
  });

  // Load PCAP datasets for selected technique
  const { data: pcapData, isLoading: pcapFilesLoading } =
    useQuery<PcapDataResponse>({
      queryKey: ["technique_pcaps", selectedTechnique],
      queryFn: async () => {
        if (!selectedTechnique) throw new Error("No technique selected");
        const res = await fetch(
          `${API_CONFIG.API_BASE}/get-technique-pcaps/${selectedTechnique}`
        );
        if (!res.ok) throw new Error("Failed to load PCAP datasets");
        return res.json();
      },
      enabled: !!selectedTechnique,
    });

  // Update state when tactic data loads
  if (loadedTactic && loadedTactic !== tacticData) {
    setTacticData(loadedTactic);
    setSelectedTechnique(null);
    setTechniqueData(null);
    setSelectFile(null);
  }

  // Update state when technique data loads
  if (loadedTechnique && loadedTechnique !== techniqueData) {
    setTechniqueData(loadedTechnique);
    setSelectFile(null);
  }

  const handleTacticChange = (tacticFile: string) => {
    setSelectedTactic(tacticFile);
    setSelectedTechnique(null);
    setSelectFile(null);
  };

  const handleTechniqueChange = (techniqueId: string) => {
    setSelectedTechnique(techniqueId);
    setSelectFile(null);
  };

  const handleFileChange = (fileName: string | null) => {
    setSelectFile(fileName);
  };

  const handleAddTechnique = () => {
    if (!techniqueData || !selectedTechnique || !selectFile) return;

    const newItem: ChainPcapItem = {
      type: "pcap",
      id: `${selectedTechnique}-${Date.now()}`,
      techniqueId: selectedTechnique,
      technique: techniqueData,
      tacticId: selectedTactic || undefined,
      pcapFile: selectFile,
    };

    setChainItems([...chainItems, newItem]);
  };

  const handleAddTechniqueFromDrop = (
    technique: Omit<ChainPcapItem, "id">
  ) => {
    const newItem: ChainPcapItem = {
      ...technique,
      type: "pcap",
      id: `${technique.techniqueId}-${Date.now()}`,
    };
    setChainItems([...chainItems, newItem]);
  };

  const handleAddSleep = () => {
    setChainItems([
      ...chainItems,
      {
        type: "sleep",
        id: `sleep-${Date.now()}`,
        duration: 5,
      },
    ]);
  };

  const handleUpdateSleepDuration = (id: string, duration: number) => {
    setChainItems(
      chainItems.map((item) =>
        item.id === id && item.type === "sleep"
          ? { ...item, duration }
          : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setChainItems(chainItems.filter((item) => item.id !== id));
  };

  const handleReorderItems = (reorderedItems: ChainItem[]) => {
    setChainItems(reorderedItems);
  };

  if (tacticsLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-4xl mx-auto w-fit font-bold">Chain Builder</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side: Tactic and Technique Selection */}
        <div ref={leftRef}>
          <Card>
            <CardHeader>
              <CardTitle>MITRE ATT&CK Technique Selection</CardTitle>
              <CardDescription>
                Select a tactic, technique and PCAP to add to your chain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TacticSelector
                selectedTactic={selectedTactic}
                tacticsList={tacticsList}
                tacticData={tacticData}
                onTacticChange={handleTacticChange}
              />

              <TechniqueSelector
                selectedTechnique={selectedTechnique}
                tacticData={tacticData}
                techniquesData={techniquesData}
                techniqueData={techniqueData}
                selectFile={selectFile}
                pcapData={pcapData}
                pcapFilesLoading={pcapFilesLoading}
                onTechniqueChange={handleTechniqueChange}
                onDatasetSelect={handleFileChange}
                draggable={true}
                tacticId={selectedTactic}
              />

              {techniqueData && (
                <Button
                  onClick={handleAddTechnique}
                  className="w-full"
                  disabled={!selectedTechnique || !selectFile}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter le PCAP à la chaîne
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right side: Technique Chain — min-height synced with left */}
        <div
          style={{ minHeight: leftHeight ? `${leftHeight}px` : undefined }}
        >
          <Card className="h-full flex flex-col">
            <CardHeader className="shrink-0">
              <CardTitle>PCAP Chain</CardTitle>
              <CardDescription>
                Build your attack chain by adding and reordering technique PCAPs
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <TechniqueChainList
                items={chainItems}
                onRemove={handleRemoveItem}
                onReorder={handleReorderItems}
                onDropFromOutside={handleAddTechniqueFromDrop}
                onAddSleep={handleAddSleep}
                onUpdateSleepDuration={handleUpdateSleepDuration}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
