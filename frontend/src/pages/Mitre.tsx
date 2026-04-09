import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Tactic, Technique, PcapDataResponse } from "@/types/mitre";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TacticSelector } from "@/components/mitre/TacticSelector";
import { TechniqueSelector } from "@/components/mitre/TechniqueSelector";
import { API_CONFIG } from "@/config/api";
import { PcapInfos } from "@/components/pcapInfos/PcapInfos";
import { PcapDetails } from "@/components/pcapDetails/PcapDetails";
import { PcapRewrite } from "@/components/pcapRewrite/PcapRewrite";
import { ReplayConfiguration } from "@/components/mitre/ReplayConfiguration";
import { RewriteProvider } from "@/context/RewriteContext";
import type { PacketDetailsType, PcapInfoType } from "@/types/types";
import { TechniqueCard } from "@/components/mitre/TechniqueCard";

export default function Mitre() {
  const [selectedTactic, setSelectedTactic] = useState<string | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(
    null,
  );
  const [selectFile, setSelectFile] = useState<string | null>(null);
  const [tacticData, setTacticData] = useState<Tactic | null>(null);
  const [techniqueData, setTechniqueData] = useState<Technique | null>(null);

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

  const infosMutation = useMutation<PcapInfoType, Error, string>({
    mutationFn: async (file: string) => {
      const res = await fetch(`${API_CONFIG.API_BASE}/infos-pcap?file=${file}`);

      if (!res.ok) throw new Error("API Error");

      return res.json();
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
  });

  useEffect(() => {
    if (loadedTactic) {
      setTacticData(loadedTactic);
      setSelectedTechnique(null);
      setTechniqueData(null);
      setSelectFile(null);
    }
  }, [loadedTactic]);

  useEffect(() => {
    if (loadedTechnique) {
      setTechniqueData(loadedTechnique);
      setSelectFile(null);
    }
  }, [loadedTechnique]);

  useEffect(() => {
    detailsMutation.reset();
    infosMutation.reset();
    // resetRewrites();
    if (selectFile) {
      infosMutation.mutate(selectFile);
      detailsMutation.mutate(selectFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectFile]);

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
    <div className="p-6 space-y-4 max-w-6xl mx-auto">
      <h1 className="text-4xl mx-auto w-fit font-bold">Mitre</h1>
      <Card>
        <CardHeader>
          <CardTitle>MITRE ATT&CK Selection</CardTitle>
          <CardDescription>
            Select a tactic and technique to replay
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
            onTechniqueChange={handleTechniqueChange}
          />
          {techniqueData && (
            <TechniqueCard
              technique={techniqueData}
              selectFile={selectFile}
              pcapData={pcapData}
              pcapFilesLoading={pcapFilesLoading}
              onDatasetSelect={handleFileChange}
            />
          )}
        </CardContent>
      </Card>

      <RewriteProvider>
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
        <ReplayConfiguration
          infosMutation={infosMutation}
          selectFile={selectFile ?? ""}
        />
      </RewriteProvider>
    </div>
  );
}
