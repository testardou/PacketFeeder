import type { NewValuesPcapType } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import { Separator } from "@/components/ui/separator";

interface IModifiedPcapRecapProps {
  rewriteIps?: NewValuesPcapType[];
  setRewriteIps: (rewriteIps: NewValuesPcapType[]) => void;
}

export const ModifiedPcapRecap = ({
  rewriteIps,
  setRewriteIps,
}: IModifiedPcapRecapProps) => {
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Replaced IPs</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72  rounded-md border">
          <div className="p-4">
            {rewriteIps?.map((element) => (
              <React.Fragment key={element.old}>
                <div className="text-sm">{`${element.old} -> ${element.new}`}</div>
                <Separator className="my-2" />
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
