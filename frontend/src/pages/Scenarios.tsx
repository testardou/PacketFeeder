import { useState, useEffect } from "react";
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
import { ReplayConfiguration } from "@/components/scenarios/ReplayConfiguration";
import { API_CONFIG } from "@/config/api";
import { RewriteProvider } from "@/context/RewriteContext";

export default function Scenarios() {
  const [selectedTactic, setSelectedTactic] = useState<string | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(
    null,
  );
  const [selectFile, setSelectFile] = useState<string | null>(null);
  const [tacticData, setTacticData] = useState<Tactic | null>(null);
  const [techniqueData, setTechniqueData] = useState<Technique | null>(null);

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
        `${API_CONFIG.API_BASE}/get-tactic/${selectedTactic}`,
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

      // Load all techniques in parallel
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

  // Load technique data when selected
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

  // Load PCAP datasets for selected technique
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

  // Update state when tactic data loads
  useEffect(() => {
    if (loadedTactic) {
      setTacticData(loadedTactic);
      setSelectedTechnique(null);
      setTechniqueData(null);
      setSelectFile(null);
    }
  }, [loadedTactic]);

  // Update state when technique data loads
  useEffect(() => {
    if (loadedTechnique) {
      setTechniqueData(loadedTechnique);
      setSelectFile(null);
    }
  }, [loadedTechnique]);

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

  if (tacticsLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-4xl mx-auto w-fit font-bold">Scenarios</h1>

      {/* Tactic and Technique Selection */}
      <Card>
        <CardHeader>
          <CardTitle>MITRE ATT&CK Scenario Selection</CardTitle>
          <CardDescription>
            Select a tactic and technique to replay attack scenarios
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
          />
        </CardContent>
      </Card>

      {/* Replay Configuration */}
      {selectFile && (
        <RewriteProvider>
          <ReplayConfiguration selectFile={selectFile} />
        </RewriteProvider>
      )}
    </div>
  );
}
