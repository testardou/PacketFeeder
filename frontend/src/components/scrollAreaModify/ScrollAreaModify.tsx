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
              <Dialog onOpenChange={() => setNewValue(srcIp)}>
                <DialogTrigger asChild>
                  <Button variant="ghost">{srcIp}</Button>
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
                        defaultValue={srcIp}
                        onChange={(e) => setNewValue(e.target.value)}
                      />
                    </div>
                  </div>
                  {!validator.test(newValue) && (
                    <p className="text-red-600">{errorMessage}</p>
                  )}

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" onClick={() => setNewValue("")}>
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      disabled={!validator || newValue === srcIp}
                      onClick={() => {
                        setNewValues([
                          ...newValues,
                          { old: srcIp, new: newValue },
                        ]);
                        setNewValue("");
                      }}
                    >
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Separator className="my-2" />
            </React.Fragment>
          ))}
      </div>
    </ScrollArea>
  );
};
