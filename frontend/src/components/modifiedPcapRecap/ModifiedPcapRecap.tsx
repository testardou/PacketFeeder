import type { NewValuesPcapType } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface IModifiedPcapRecapProps {
  cardTitle: string;
  rewriteValues?: NewValuesPcapType[];
  setRewriteValues: (rewriteValues: NewValuesPcapType[]) => void;
}

export const ModifiedPcapRecap = ({
  cardTitle,
  rewriteValues,
  setRewriteValues,
}: IModifiedPcapRecapProps) => {
  if (rewriteValues === undefined || rewriteValues.length === 0) return null;
  return (
    <Card className="w-fit border-2">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-base font-semibold">{cardTitle}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-72 rounded-md border">
          <div className="p-4">
            {rewriteValues?.map((element) => (
              <React.Fragment key={element.old}>
                <div className="text-sm flex flex-row gap-4 justify-between items-center">
                  <p className="text-sm my-auto font-mono">{`${element.old} -> ${element.new}`}</p>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      setRewriteValues(
                        rewriteValues.filter(
                          (rewriteValue) => element.old !== rewriteValue.old
                        )
                      )
                    }
                  >
                    X
                  </Button>
                </div>
                <Separator className="my-2" />
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
