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
  return (
    <Card className="w-fit">
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72  rounded-md border">
          <div className="p-4">
            {rewriteValues?.map((element) => (
              <React.Fragment key={element.old}>
                <div className="text-sm flex flex-row gap-4 justify-around justify-items-center">
                  <p className="text-sm my-auto">{`${element.old} -> ${element.new}`}</p>
                  <Button
                    className="bg-red-500 text-amber-50 hover:bg-red-600 hover:text-amber-100"
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
