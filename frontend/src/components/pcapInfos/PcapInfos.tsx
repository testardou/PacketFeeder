import type { PcapInfoType } from "@/types/types";
import type { UseMutationResult } from "@tanstack/react-query";
import { PcapGeneralInfos } from "@/components/pcapGeneralInfos/PcapGeneralInfos";
import { PcapProtocolsScrollArea } from "@/components/pcapProtocolsScrollArea/PcapProtocolsScrollArea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface IPcapInfosProps {
  pcapInfos?: UseMutationResult<PcapInfoType, Error, string, unknown>;
}

export const PcapInfos = ({ pcapInfos }: IPcapInfosProps) => {
  const data: PcapInfoType | undefined = pcapInfos?.data;

  return (
    <div className="flex flex-col gap-6 flex-1">
      <Card>
        <CardContent>
          <Collapsible className="rounded-md">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="group w-full">
                Pcap Informations
                <ChevronDownIcon className="ml-auto group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-8">
              {pcapInfos?.isPending ? (
                <div className="flex flex-row gap-2">
                  <Spinner />
                  <p>Fetching PCAP Informations...</p>
                </div>
              ) : (
                <PcapGeneralInfos pcapInfosData={data} />
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Collapsible className="rounded-md">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="group w-full">
                Protocols & Rewrite
                <ChevronDownIcon className="ml-auto group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-8">
              {pcapInfos?.isPending ? (
                <div className="flex flex-row gap-2">
                  <Spinner />
                  <p>Fetching protocols & Rewrite...</p>
                </div>
              ) : (
                <PcapProtocolsScrollArea pcapInfosData={data} />
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
};
