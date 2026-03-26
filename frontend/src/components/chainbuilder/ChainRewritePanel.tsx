import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { PcapGeneralInfos } from "@/components/pcapGeneralInfos/PcapGeneralInfos";
import { PcapProtocolsScrollArea } from "@/components/pcapProtocolsScrollArea/PcapProtocolsScrollArea";
import type { RewriteValues } from "@/types/types";
import type { ChainInfosResponse } from "@/components/chainbuilder/types";
import { RewriteProvider } from "@/context/RewriteContext";

interface ChainRewritePanelProps {
  chainInfos: ChainInfosResponse;
  globalRewriteValues: RewriteValues;
  getPerPcapRewriteValues: (index: number) => RewriteValues;
}

export const ChainRewritePanel = ({
  chainInfos,
  globalRewriteValues,
  getPerPcapRewriteValues,
}: ChainRewritePanelProps) => {
  const [expandedPcaps, setExpandedPcaps] = useState<Record<number, boolean>>(
    {},
  );

  const togglePcap = (index: number) => {
    setExpandedPcaps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-6">
      {/* All PCAPs section */}
      <Card>
        <CardHeader>
          <CardTitle>All PCAPs (Global Rewrites)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PcapGeneralInfos pcapInfosData={chainInfos.all} />
          <RewriteProvider externalValues={globalRewriteValues}>
            <PcapProtocolsScrollArea pcapInfosData={chainInfos.all} />
          </RewriteProvider>
        </CardContent>
      </Card>

      {/* Per-pcap sections */}
      {chainInfos.per_pcap.length > 1 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Per-PCAP Rewrites</h3>
          {chainInfos.per_pcap.map((entry) => {
            const isExpanded = expandedPcaps[entry.index] ?? false;
            const rewriteValues = getPerPcapRewriteValues(entry.index);
            const fileName =
              entry.pcap_file.split("/").pop() ?? entry.pcap_file;

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
          })}
        </div>
      )}
    </div>
  );
};
