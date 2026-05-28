import { useState, useMemo, useRef, useEffect } from "react";
import {
  ExternalLink,
  Search,
  X,
  ChevronDown,
  Check,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Technique, PcapDataset } from "@/types/mitre";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TechniqueCardProps {
  technique: Technique;
  selectFile: string | null;
  pcapData?: { datasets?: PcapDataset[]; files?: string[] };
  pcapFilesLoading?: boolean;
  onDatasetSelect: (fileName: string) => void;
  draggablePcaps?: boolean;
  tacticId?: string | null;
}

export function TechniqueCard({
  technique,
  selectFile,
  pcapData,
  pcapFilesLoading,
  onDatasetSelect,
  draggablePcaps = false,
  tacticId = null,
}: TechniqueCardProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Get all available filters from datasets
  const availableFilters = useMemo(() => {
    if (!pcapData || !Array.isArray(pcapData.datasets)) return [];
    const filterSet = new Set<string>();
    pcapData.datasets.forEach((dataset) => {
      if (dataset.filter) {
        dataset.filter.forEach((filter) => filterSet.add(filter));
      }
    });
    return Array.from(filterSet).sort();
  }, [pcapData]);

  // Filter available filters based on search query
  const filteredAvailableFilters = useMemo(() => {
    if (!searchQuery.trim()) return availableFilters;
    const query = searchQuery.toLowerCase().trim();
    return availableFilters.filter((filter) =>
      filter.toLowerCase().includes(query),
    );
  }, [availableFilters, searchQuery]);

  // Filter datasets based on selected filters and search query
  const filteredDatasets = useMemo(() => {
    if (!pcapData || !Array.isArray(pcapData.datasets)) return [];

    let filtered = pcapData.datasets;

    // Filter by selected filters
    if (selectedFilters.length > 0) {
      filtered = filtered.filter((dataset) => {
        if (!Array.isArray(dataset.filter)) return false;
        // A dataset must match all selected filters
        return selectedFilters.every((filter) =>
          dataset.filter?.includes(filter),
        );
      });
    }

    return filtered;
  }, [pcapData, selectedFilters]);

  // Handle filter toggle
  const handleFilterToggle = (filter: string) => {
    setSelectedFilters((prev) => {
      if (prev.includes(filter)) {
        return prev.filter((f) => f !== filter);
      }
      return [...prev, filter];
    });
  };

  const handleClearFilters = () => {
    setSelectedFilters([]);
    setSearchQuery("");
  };

  const handleDatasetDragStart = (e: React.DragEvent, dataset: PcapDataset) => {
    if (!draggablePcaps) {
      e.preventDefault();
      return;
    }

    const dragData = {
      techniqueId: technique.mitre.technique_id,
      technique,
      tacticId: tacticId || undefined,
      file_path: dataset.file,
    };

    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFileDragStart = (e: React.DragEvent, file: string) => {
    if (!draggablePcaps) {
      e.preventDefault();
      return;
    }

    const dragData = {
      techniqueId: technique.mitre.technique_id,
      technique,
      tacticId: tacticId || undefined,
      file_path: file,
    };

    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "move";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false);
      }
    };

    if (isFilterDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">
              {technique.mitre.technique_id}
            </span>
            <span className="text-muted-foreground">-</span>
            <span className="font-medium">
              {technique.mitre.technique_name}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {technique.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
              {technique.metadata.domain}
            </span>
            <span className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-md">
              Confidence: {technique.metadata.confidence}
            </span>
            {technique.variants && (
              <span className="text-muted-foreground">
                {technique.variants.length} variant
                {technique.variants.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <a
          href={technique.mitre.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 transition-colors"
          title="View on MITRE ATT&CK"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {technique.artifacts && technique.artifacts.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-sm font-medium">Network Artifacts:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {technique.artifacts.map((artifact, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-1.5">•</span>
                <span>{artifact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Datasets from pcapData (API response) */}
      {pcapFilesLoading ? (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-sm font-medium">Available Datasets:</p>
          <p className="text-xs text-muted-foreground">Loading datasets...</p>
        </div>
      ) : pcapData?.datasets && pcapData.datasets.length > 0 ? (
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Available Datasets
              <span className="text-xs text-muted-foreground ml-2">
                ({filteredDatasets.length} of {pcapData.datasets.length})
              </span>
            </p>
          </div>

          {/* Multi-select avec barre de recherche intégrée */}
          <div className="relative" ref={filterDropdownRef}>
            <div className="space-y-2">
              {/* Bouton trigger pour ouvrir le multi-select */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="w-full justify-between h-9 text-xs"
              >
                <span className="flex items-center gap-2">
                  <Search className="h-3.5 w-3.5" />
                  {selectedFilters.length > 0
                    ? `${selectedFilters.length} filtre${
                        selectedFilters.length > 1 ? "s" : ""
                      } sélectionné${selectedFilters.length > 1 ? "s" : ""}`
                    : "Rechercher et filtrer les datasets"}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    isFilterDropdownOpen && "rotate-180",
                  )}
                />
              </Button>

              {/* Tags des filtres sélectionnés */}
              {selectedFilters.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedFilters.map((filter) => (
                    <span
                      key={filter}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
                    >
                      {filter}
                      <button
                        type="button"
                        onClick={() => handleFilterToggle(filter)}
                        className="hover:text-primary/70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {selectedFilters.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="text-xs"
                    >
                      Tout effacer
                    </Button>
                  )}
                </div>
              )}

              {/* Dropdown avec barre de recherche */}
              {isFilterDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md">
                  {/* Barre de recherche intégrée */}
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Rechercher un filtre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-7 pr-7 h-8 text-xs"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Liste des filtres */}
                  <div className="max-h-[200px] overflow-auto">
                    <div className="p-2 space-y-1">
                      {filteredAvailableFilters.length > 0 ? (
                        filteredAvailableFilters.map((filter) => {
                          const isSelected = selectedFilters.includes(filter);
                          return (
                            <button
                              key={filter}
                              type="button"
                              onClick={() => handleFilterToggle(filter)}
                              className={cn(
                                "w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs text-left hover:bg-accent transition-colors",
                                isSelected && "bg-accent",
                              )}
                            >
                              <div
                                className={cn(
                                  "flex h-4 w-4 items-center justify-center rounded-sm border",
                                  isSelected
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-input",
                                )}
                              >
                                {isSelected && <Check className="h-3 w-3" />}
                              </div>
                              <span>{filter}</span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                          Aucun filtre trouvé
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable dataset list */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-1.5 pr-4">
              {filteredDatasets.length > 0 ? (
                filteredDatasets.map((dataset) => {
                  const isSelected = selectFile === dataset.file;
                  return (
                    <div
                      key={dataset.id}
                      draggable={draggablePcaps}
                      onDragStart={(e) => handleDatasetDragStart(e, dataset)}
                      className={cn(
                        "w-full p-2 bg-background border rounded-md transition-all",
                        draggablePcaps && "cursor-grab active:cursor-grabbing",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "hover:bg-muted/50 hover:border-muted-foreground/50",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {draggablePcaps && (
                          <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                              <GripVertical className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => onDatasetSelect(dataset.file)}
                          className="flex-1 text-left"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-xs truncate">
                                  {dataset.name}
                                </span>
                                <span
                                  className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0",
                                    dataset.criticality === "high"
                                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                      : dataset.criticality === "medium"
                                        ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                                  )}
                                >
                                  {dataset.criticality}
                                </span>
                                {isSelected && (
                                  <span className="text-[10px] text-primary font-medium shrink-0">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground line-clamp-1">
                                {dataset.description}
                              </p>
                              {dataset.command && (
                                <p className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit break-all">
                                  {dataset.command}
                                </p>
                              )}
                              <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                                <span className="px-1.5 py-0.5 bg-secondary rounded shrink-0">
                                  {dataset.scope.protocol.toUpperCase()}
                                </span>
                                {dataset.scope.ports && (
                                  <span className="text-muted-foreground shrink-0">
                                    {dataset.scope.ports.join(", ")}
                                  </span>
                                )}
                                <span className="text-muted-foreground font-mono truncate max-w-[120px]">
                                  {dataset.file.split("/").pop()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground border rounded-md bg-muted/30">
                  Aucun dataset ne correspond aux filtres sélectionnés.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      ) : null}

      {/* Legacy files list */}
      {pcapData?.files && pcapData.files.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-sm font-medium">Available PCAP Files:</p>
          <div className="space-y-2">
            {pcapData.files
              .filter(
                (file: string) =>
                  file.endsWith(".pcap") || file.endsWith(".pcapng"),
              )
              .map((file: string) => {
                const isSelected = selectFile === file;
                return (
                  <div
                    key={file}
                    draggable={draggablePcaps}
                    onDragStart={(e) => handleFileDragStart(e, file)}
                    className={cn(
                      "w-full p-3 bg-background border rounded-md transition-all text-left",
                      draggablePcaps && "cursor-grab active:cursor-grabbing",
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "hover:bg-muted/50 hover:border-muted-foreground/50",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onDatasetSelect(file)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{file}</span>
                        {isSelected && (
                          <span className="text-xs text-primary font-medium">
                            ✓ Selected
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {technique.variants &&
        technique.variants.length > 0 &&
        !technique.datasets && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm font-medium">Available Variants:</p>
            <div className="flex flex-wrap gap-2">
              {technique.variants.map((variant, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                >
                  {variant}
                </span>
              ))}
            </div>
          </div>
        )}

      {technique.pcaps_path && !technique.datasets && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">PCAP Path:</span>{" "}
            {technique.pcaps_path}
          </p>
        </div>
      )}
    </div>
  );
}
