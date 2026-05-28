import { useRef, useState } from "react";
import { Clock, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  ImportScenarioResponse,
  ScenarioItem,
  ScenarioPcapItem,
} from "./types";
import { PcapItemCard } from "./PcapItemCard";
import { SleepItemCard } from "./SleepItemCard";
import { API_CONFIG } from "@/config/api";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export type { ScenarioItem, ScenarioPcapItem } from "./types";

interface TechniqueScenarioListProps {
  items: ScenarioItem[];
  onRemove: (id: string) => void;
  onReorder: (reorderedItems: ScenarioItem[]) => void;
  onDropFromOutside?: (data: Omit<ScenarioPcapItem, "id">) => void;
  onAddSleep: () => void;
  onUpdateSleepDuration: (id: string, duration: number) => void;
  setStep: (val: number) => void;
  step: number;
  clearScenario: () => void;
  setScenarioItems: (items: ScenarioItem[]) => void;
}

export function TechniqueScenarioList({
  items,
  onRemove,
  onReorder,
  onDropFromOutside,
  onAddSleep,
  onUpdateSleepDuration,
  setStep,
  step,
  clearScenario,
  setScenarioItems,
}: TechniqueScenarioListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragOverContainer, setIsDragOverContainer] = useState(false);
  const [exportFilename, setExportFilename] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const parseDropData = (
    e: React.DragEvent,
  ): Omit<ScenarioPcapItem, "id"> | null => {
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      return {
        type: "pcap",
        techniqueId: data.techniqueId,
        technique: data.technique,
        tacticId: data.tacticId,
        file_path: data.file_path,
      };
    } catch {
      return null;
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setIsDragOverContainer(false);
    setDragOverIndex(null);

    const externalData = parseDropData(e);
    if (externalData && onDropFromOutside) {
      onDropFromOutside(externalData);
      return;
    }

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const reordered = [...items];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, removed);
    onReorder(reordered);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverContainer(true);
  };

  const handleContainerDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      setIsDragOverContainer(false);
    }
  };

  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverContainer(false);

    const externalData = parseDropData(e);
    if (externalData && onDropFromOutside) {
      onDropFromOutside(externalData);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!Array.isArray(parsed.items)) {
        throw new Error("Invalid scenario file: missing items array");
      }

      const res = await fetch(`${API_CONFIG.API_BASE}/import-scenario/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: parsed.items }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || `Server returned ${res.status}`);
      }

      const data: ImportScenarioResponse = await res.json();

      const now = Date.now();
      const reconstructed: ScenarioItem[] = data.items.map((item, i) => {
        if (item.type === "sleep") {
          return {
            type: "sleep",
            id: `sleep-${now}-${i}`,
            duration: item.duration,
          };
        }
        return {
          type: "pcap",
          id: `${item.techniqueId}-${now}-${i}`,
          techniqueId: item.techniqueId,
          tacticId: item.tacticId,
          file_path: item.file_path,
          technique: item.technique,
          dataset: item.dataset,
        };
      });

      setScenarioItems(reconstructed);

      if (data.missing.length > 0) {
        alert(
          `Some techniques were not found and have been skipped:\n${data.missing.join(", ")}`,
        );
      }
    } catch (err) {
      alert(
        `Failed to import scenario: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  const exportScenario = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`${API_CONFIG.API_BASE}/export-scenario/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: exportFilename || "scenario",
          items: items.map((item) =>
            item.type === "sleep"
              ? { type: "sleep", duration: item.duration }
              : {
                  type: "pcap",
                  techniqueId: item.techniqueId,
                  tacticId: item.tacticId,
                  file_path: item.file_path,
                },
          ),
        }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || `Server returned ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="?([^"]+)"?/);
      const filename =
        match?.[1] ??
        `${(exportFilename || "scenario").replace(/[^a-z0-9-_]/gi, "_")}.json`;

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportFilename(null);
    } catch (err) {
      alert(
        `Failed to export scenario: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsExporting(false);
    }
  };

  const dropZoneClass = isDragOverContainer
    ? "border-primary bg-primary/5"
    : "border-border";

  return (
    <div className="flex flex-col h-full gap-3">
      <div
        className={
          items.length === 0
            ? `flex-1 flex flex-col items-center justify-center text-center p-4 text-muted-foreground border-2 border-dashed rounded-lg transition-colors ${dropZoneClass}`
            : `flex-1 min-h-0 rounded-lg border-2 border-dashed p-3 transition-colors overflow-y-auto ${dropZoneClass}`
        }
        onDragOver={handleContainerDragOver}
        onDragLeave={handleContainerDragLeave}
        onDrop={handleContainerDrop}
      >
        {items.length === 0 ? (
          <>
            <p>No technique in the scenario</p>
            <p className="text-sm mt-2">
              {isDragOverContainer
                ? "Release to add the technique"
                : "Select a tactic and technique on the left to get started, or drag and drop"}
            </p>
          </>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <Card
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`cursor-move transition-all duration-200 ${
                  draggedIndex === index ? "opacity-50 scale-95" : ""
                } ${
                  dragOverIndex === index && draggedIndex !== index
                    ? "border-primary border-2 shadow-lg bg-primary/5"
                    : "hover:border-border/50"
                }`}
              >
                <CardContent className="p-4">
                  {item.type === "pcap" ? (
                    <PcapItemCard
                      item={item}
                      index={index}
                      onRemove={onRemove}
                    />
                  ) : (
                    <SleepItemCard
                      item={item}
                      index={index}
                      onRemove={onRemove}
                      onUpdateDuration={onUpdateSleepDuration}
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            {isImporting ? "Importing..." : "Import"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1"
                disabled={items.length === 0}
              >
                Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export scenario</DialogTitle>
                <DialogDescription>
                  <div className="flex flex-col gap-2">
                    Export the current scenario ({items.length} item(s)) as a
                    JSON file that can be shared and re-imported later.
                    <Label>New file name</Label>
                    <Input
                      disabled={items.length === 0}
                      onChange={(e) => setExportFilename(e.target.value)}
                    />
                  </div>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose>Cancel</DialogClose>
                <DialogClose>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={exportScenario}
                    disabled={items.length === 0 || exportFilename === null || isExporting}
                  >
                    {isExporting ? "Exporting..." : "Export"}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Button variant="outline" className="flex-1" onClick={onAddSleep}>
          <Clock className="h-4 w-4 mr-2" />
          Add a Sleep
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={items.length === 0}
            >
              <Trash2Icon className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear scenario?</DialogTitle>
              <DialogDescription>
                This will remove all {items.length} item(s) from the scenario.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose>Cancel</DialogClose>
              <DialogClose>
                <Button
                  onClick={() => clearScenario()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {items.length > 0 && step > 0 && (
          <Button className="flex-1" onClick={() => setStep(step - 1)}>
            Previous Step
          </Button>
        )}
        {items.length > 0 && step < 2 && (
          <Button
            variant="outline"
            className="flex-1 bg-blue-500 hover:bg-blue-700 text-white"
            onClick={() => setStep(step + 1)}
          >
            Next Step
          </Button>
        )}
      </div>
    </div>
  );
}
