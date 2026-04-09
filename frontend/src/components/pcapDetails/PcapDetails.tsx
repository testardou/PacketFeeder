import type { PacketDetailsType } from "@/types/types";
import type { UseMutationResult } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { PcapDetailsTable } from "@/components/pcapDetailsTable/PcapDetailsTable";

interface IPcapDetailsProps {
  detailsMutation?: UseMutationResult<
    PacketDetailsType[],
    Error,
    string,
    unknown
  >;
  selectedFile: string | null;
}

export const PcapDetails = ({
  detailsMutation,
  selectedFile,
}: IPcapDetailsProps) => {
  return (
    <Card>
      <CardContent>
        <Collapsible className="rounded-md">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="group w-full">
              Packet Details {detailsMutation?.isPending && <Spinner />}
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
              <PcapDetailsTable
                selectedFile={selectedFile}
                data={detailsMutation?.data}
                isPending={detailsMutation?.isPending}
              />
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
