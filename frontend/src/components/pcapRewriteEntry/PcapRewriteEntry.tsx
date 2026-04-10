import { PcapGeneralInfos } from "@/components/pcapGeneralInfos/PcapGeneralInfos";
import { PcapProtocolsScrollArea } from "@/components/pcapProtocolsScrollArea/PcapProtocolsScrollArea";
import type { PerPcapInfoEntry } from "@/components/scenariobuilder/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RewriteProvider } from "@/context/RewriteContext";
import type { RewriteValues } from "@/types/types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo } from "react";

interface PcapRewriteEntryProps {
  entry: PerPcapInfoEntry;
  getPerPcapRewriteValues: (index: number) => RewriteValues;
  expandedPcaps: Record<number, boolean>;
  togglePcap: (index: number) => void;
}

export const PcapRewriteEntry = ({
  entry,
  getPerPcapRewriteValues,
  expandedPcaps,
  togglePcap,
}: PcapRewriteEntryProps) => {
  const rewriteValues = useMemo(
    () => getPerPcapRewriteValues(entry.index),
    [getPerPcapRewriteValues, entry.index],
  );

  const isExpanded = expandedPcaps[entry.index] ?? false;
  const fileName = entry.file_path?.split("/").pop() ?? "Unknown";

  return (
    <Card key={entry.index}>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => togglePcap(entry.index)}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
          <CardTitle className="text-base flex items-center gap-3">
            <span>{fileName}</span>
            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {entry.infos.packet_count} packets
            </span>
          </CardTitle>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          <PcapGeneralInfos pcapInfosData={entry.infos} />
          <RewriteProvider externalValues={rewriteValues}>
            <PcapProtocolsScrollArea pcapInfosData={entry.infos} />
          </RewriteProvider>
        </CardContent>
      )}
    </Card>
  );
};
