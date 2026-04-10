import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PcapGeneralInfos } from "@/components/pcapGeneralInfos/PcapGeneralInfos";
import { PcapProtocolsScrollArea } from "@/components/pcapProtocolsScrollArea/PcapProtocolsScrollArea";
import type { RewriteValues } from "@/types/types";
import type { ScenarioInfosResponse } from "@/components/scenariobuilder/types";
import { RewriteProvider } from "@/context/RewriteContext";
import { PcapRewriteEntry } from "@/components/pcapRewriteEntry/PcapRewriteEntry";

interface ScenarioRewritePanelProps {
  scenarioInfos: ScenarioInfosResponse;
  globalRewriteValues: RewriteValues;
  getPerPcapRewriteValues: (index: number) => RewriteValues;
}

export const ScenarioRewritePanel = ({
  scenarioInfos,
  globalRewriteValues,
  getPerPcapRewriteValues,
}: ScenarioRewritePanelProps) => {
  const [expandedPcaps, setExpandedPcaps] = useState<Record<number, boolean>>(
    {},
  );

  const togglePcap = (index: number) => {
    setExpandedPcaps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All PCAPs (Global Rewrites)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PcapGeneralInfos pcapInfosData={scenarioInfos.all} />
          <RewriteProvider externalValues={globalRewriteValues}>
            <PcapProtocolsScrollArea pcapInfosData={scenarioInfos.all} />
          </RewriteProvider>
        </CardContent>
      </Card>
      {scenarioInfos.per_pcap.length > 1 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Per-PCAP Rewrites</h3>
          {scenarioInfos.per_pcap.map((entry) => {
            return (
              <PcapRewriteEntry
                key={entry.index}
                entry={entry}
                getPerPcapRewriteValues={getPerPcapRewriteValues}
                expandedPcaps={expandedPcaps}
                togglePcap={togglePcap}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
