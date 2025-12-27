import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Info } from "lucide-react";

import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

dayjs.extend(utc);

interface IPcapInfosProps {
  valuesArray: string[];
  newValues: { old: string; new: string }[];
  setNewValues: (newValues: { old: string; new: string }[]) => void;
  validator: RegExp;
  modalTitle: string;
  modalLabel: string;
  modalDescription: string;
  errorMessage: string;
  showInfoButton?: boolean;
  infoUrl?: (value: string | number) => string;
}

export const ScrollAreaModify = ({
  valuesArray,
  newValues,
  setNewValues,
  validator,
  modalTitle,
  modalLabel,
  modalDescription,
  errorMessage,
  showInfoButton = false,
  infoUrl,
}: IPcapInfosProps) => {
  const [newValue, setNewValue] = useState<string>("");
  return (
    <ScrollArea className="h-72  rounded-md border">
      <div className="p-4">
        {valuesArray
          .filter(
            (srcIp) =>
              newValues?.find((element) => element.old === srcIp) === undefined
          )
          .map((srcIp) => (
            <React.Fragment key={srcIp}>
              <div className="flex items-center gap-2">
                <Dialog onOpenChange={() => setNewValue(String(srcIp))}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="flex-1 justify-start">
                      {srcIp}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{modalTitle}</DialogTitle>
                      <DialogDescription>{modalDescription}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`new-ip-${srcIp}`}>{modalLabel}</Label>
                        <Input
                          id={`new-ip-${srcIp}`}
                          defaultValue={String(srcIp)}
                          onChange={(e) => setNewValue(e.target.value)}
                        />
                      </div>
                    </div>
                    {!validator.test(newValue) && (
                      <p className="text-red-600">{errorMessage}</p>
                    )}

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          variant="outline"
                          onClick={() => setNewValue("")}
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        disabled={
                          !validator.test(newValue) ||
                          newValue === String(srcIp)
                        }
                        onClick={() => {
                          setNewValues([
                            ...newValues,
                            { old: String(srcIp), new: newValue },
                          ]);
                          setNewValue("");
                        }}
                      >
                        Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {showInfoButton && infoUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                  >
                    <a
                      href={infoUrl(srcIp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <Info className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>

              <Separator className="my-2" />
            </React.Fragment>
          ))}
      </div>
    </ScrollArea>
  );
};
