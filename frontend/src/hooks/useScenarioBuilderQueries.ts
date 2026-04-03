import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Tactic, Technique, PcapDataResponse } from "@/types/mitre";
import { API_CONFIG } from "@/config/api";

export function useScenarioBuilderQueries() {
  const [selectedTactic, setSelectedTactic] = useState<string | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(
    null,
  );
  const [tacticData, setTacticData] = useState<Tactic | null>(null);
  const [techniqueData, setTechniqueData] = useState<Technique | null>(null);
  const [selectFile, setSelectFile] = useState<string | null>(null);

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

  const { data: loadedTactic } = useQuery<Tactic>({
    queryKey: ["tactic", selectedTactic],
    queryFn: async () => {
      if (!selectedTactic) throw new Error("No tactic selected");
      const res = await fetch(
        `${API_CONFIG.API_BASE}/get-tactic/${selectedTactic}`,
      );
      if (!res.ok) throw new Error("Failed to load tactic");
      return res.json();
    },
    enabled: !!selectedTactic,
  });

  const { data: techniquesData } = useQuery<Record<string, Technique>>({
    queryKey: ["tactic_techniques", tacticData?.techniques],
    queryFn: async () => {
      if (!tacticData?.techniques) throw new Error("No techniques available");
      const techniques: Record<string, Technique> = {};

      await Promise.all(
        tacticData.techniques.map(async (techId) => {
          try {
            const res = await fetch(
              `${API_CONFIG.API_BASE}/get-technique/${techId}`,
            );
            if (res.ok) {
              const data = await res.json();
              techniques[techId] = data;
            }
          } catch (error) {
            console.error(`Failed to load technique ${techId}:`, error);
          }
        }),
      );

      return techniques;
    },
    enabled: !!tacticData?.techniques && tacticData.techniques.length > 0,
  });

  const { data: loadedTechnique } = useQuery<Technique>({
    queryKey: ["technique", selectedTechnique],
    queryFn: async () => {
      if (!selectedTechnique) throw new Error("No technique selected");
      const res = await fetch(
        `${API_CONFIG.API_BASE}/get-technique/${selectedTechnique}`,
      );
      if (!res.ok) throw new Error("Failed to load technique");
      return res.json();
    },
    enabled: !!selectedTechnique,
  });

  const { data: pcapData, isLoading: pcapFilesLoading } =
    useQuery<PcapDataResponse>({
      queryKey: ["technique_pcaps", selectedTechnique],
      queryFn: async () => {
        if (!selectedTechnique) throw new Error("No technique selected");
        const res = await fetch(
          `${API_CONFIG.API_BASE}/get-technique-pcaps/${selectedTechnique}`,
        );
        if (!res.ok) throw new Error("Failed to load PCAP datasets");
        return res.json();
      },
      enabled: !!selectedTechnique,
    });

  // Sync loaded data into local state
  if (loadedTactic && loadedTactic !== tacticData) {
    setTacticData(loadedTactic);
    setSelectedTechnique(null);
    setTechniqueData(null);
    setSelectFile(null);
  }

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

  return {
    selectedTactic,
    selectedTechnique,
    tacticData,
    techniqueData,
    selectFile,
    tacticsList,
    tacticsLoading,
    techniquesData,
    pcapData,
    pcapFilesLoading,
    handleTacticChange,
    handleTechniqueChange,
    handleFileChange,
  };
}
