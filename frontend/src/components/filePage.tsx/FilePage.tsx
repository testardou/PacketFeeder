import { HandleFiles } from "@/components/handleFiles/HandleFiles";
import { PacketDetails } from "@/components/packetDetails/PacketDetails";
import { Button } from "@/components/ui/button";
import type { PacketDetailsType, PcapInfoType } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { API_CONFIG } from "@/config/api";
import { useRewriteContext } from "@/context/RewriteContext";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { ChevronDownIcon } from "lucide-react";

export const FilePage = () => {
  const { resetRewrites } = useRewriteContext();

  const [selectFile, setSelectFile] = useState<string | null>(null);

  const detailsMutation = useMutation<PacketDetailsType[], Error, string>({
    mutationFn: async (file: string) => {
      const res = await fetch(
        `${API_CONFIG.API_BASE}/detail-packets-pcap?file=${file}`,
      );

      if (!res.ok) throw new Error("Erreur API");

      return res.json();
    },
    onSuccess: () => {
      resetRewrites();
    },
  });

  const infosMutation = useMutation<PcapInfoType, Error, string>({
    mutationFn: async (file: string) => {
      const res = await fetch(`${API_CONFIG.API_BASE}/infos-pcap?file=${file}`);

      if (!res.ok) throw new Error("API Error");

      return res.json();
    },
    onSuccess: () => {
      resetRewrites();
    },
  });

  const handleSetSelectFile = (fileName: string | null) => {
    if (fileName !== selectFile) {
      resetRewrites();
      detailsMutation.reset();
      infosMutation.reset();
    }
    setSelectFile(fileName);
    if (fileName) {
      infosMutation.mutate(fileName);
      detailsMutation.mutate(fileName);
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-6xl mx-auto">
      <h1 className="text-4xl mx-auto w-fit font-bold">Files</h1>
      <HandleFiles
        infosMutation={infosMutation}
        resetStates={resetRewrites}
        detailsMutation={detailsMutation}
        selectFile={selectFile}
        setSelectFile={handleSetSelectFile}
      />
      {selectFile && (
        <Card>
          <CardContent>
            <Collapsible className="rounded-md">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="group w-full">
                  Packet Details
                  <ChevronDownIcon className="ml-auto group-data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-8">
                {detailsMutation?.isPending ? (
                  <div className="flex flex-row gap-2">
                    <Spinner />
                    <p>Fetching packet details...</p>
                  </div>
                ) : (
                  <PacketDetails
                    selectedFile={selectFile}
                    data={detailsMutation?.data}
                    isPending={detailsMutation.isPending}
                  />
                )}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
