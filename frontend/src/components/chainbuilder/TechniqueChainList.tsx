import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ChainItem, ChainPcapItem } from "./types";
import { PcapItemCard } from "./PcapItemCard";
import { SleepItemCard } from "./SleepItemCard";

export type { ChainItem, ChainPcapItem } from "./types";

interface TechniqueChainListProps {
  items: ChainItem[];
  onRemove: (id: string) => void;
  onReorder: (reorderedItems: ChainItem[]) => void;
  onDropFromOutside?: (data: Omit<ChainPcapItem, "id">) => void;
  onAddSleep: () => void;
  onUpdateSleepDuration: (id: string, duration: number) => void;
}

export function TechniqueChainList({
  items,
  onRemove,
  onReorder,
  onDropFromOutside,
  onAddSleep,
  onUpdateSleepDuration,
}: TechniqueChainListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragOverContainer, setIsDragOverContainer] = useState(false);

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

  const parseDropData = (e: React.DragEvent): Omit<ChainPcapItem, "id"> | null => {
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      return {
        type: "pcap",
        techniqueId: data.techniqueId,
        technique: data.technique,
        tacticId: data.tacticId,
        pcapFile: data.pcapFile,
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

  const dropZoneClass = isDragOverContainer
    ? "border-primary bg-primary/5"
    : "border-border";

  if (items.length === 0) {
    return (
      <div className="flex flex-col h-full gap-3">
        <div
          className={`flex-1 flex flex-col items-center justify-center text-center p-4 text-muted-foreground border-2 border-dashed rounded-lg transition-colors ${dropZoneClass}`}
          onDragOver={handleContainerDragOver}
          onDragLeave={handleContainerDragLeave}
          onDrop={handleContainerDrop}
        >
          <p>No technique in the chain</p>
          <p className="text-sm mt-2">
            {isDragOverContainer
              ? "Release to add the technique"
              : "Select a tactic and technique on the left to get started, or drag and drop"}
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full shrink-0"
          onClick={onAddSleep}
        >
          <Clock className="h-4 w-4 mr-2" />
          Add a Sleep
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div
        className={`flex-1 rounded-lg border-2 border-dashed p-3 transition-colors overflow-auto ${dropZoneClass}`}
        onDragOver={handleContainerDragOver}
        onDragLeave={handleContainerDragLeave}
        onDrop={handleContainerDrop}
      >
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
      </div>
      <Button
        variant="outline"
        className="w-full shrink-0"
        onClick={onAddSleep}
      >
        <Clock className="h-4 w-4 mr-2" />
        Add a Sleep
      </Button>
    </div>
  );
}
