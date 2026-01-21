import { useState, useMemo } from "react";
import { ExternalLink, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Technique, PcapDataset } from "@/types/scenarios";
import { DatasetFilters } from "./DatasetFilters";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface TechniqueCardProps {
  technique: Technique;
  selectFile: string | null;
  pcapData?: { datasets?: PcapDataset[]; files?: string[] };
  pcapFilesLoading?: boolean;
  onDatasetSelect: (fileName: string) => void;
}

export function TechniqueCard({
  technique,
  selectFile,
  pcapData,
  pcapFilesLoading,
  onDatasetSelect,
}: TechniqueCardProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

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
          dataset.filter?.includes(filter)
        );
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((dataset) => {
        return (
          dataset.name.toLowerCase().includes(query) ||
          dataset.description.toLowerCase().includes(query) ||
          dataset.file.toLowerCase().includes(query) ||
          dataset.id.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [pcapData, selectedFilters, searchQuery]);

  // Determine which category a filter belongs to (same logic as DatasetFilters)
  const getFilterCategory = (filter: string): string => {
    // Numbers only = ports
    if (/^\d+$/.test(filter)) {
      return "ports";
    }
    // Short words (2-4 characters) in uppercase = protocols/acronyms
    else if (
      filter.length >= 2 &&
      filter.length <= 4 &&
      filter === filter.toUpperCase()
    ) {
      return "protocols";
    }
    // Very short words (3-5 characters) in lowercase = services/acronyms
    else if (
      filter.length >= 3 &&
      filter.length <= 5 &&
      /^[a-z]+$/.test(filter)
    ) {
      return "services";
    }
    // Short words (4-6 characters) = attributes/criticality
    else if (
      filter.length >= 4 &&
      filter.length <= 6 &&
      /^[a-z]+$/.test(filter)
    ) {
      return "attributes";
    }
    // Medium words (7-10 characters) = types/actions
    else if (
      filter.length >= 7 &&
      filter.length <= 10 &&
      /^[a-z]+$/.test(filter)
    ) {
      return "scanType";
    }
    // Long words (>10 characters) or with hyphens = tools/compounds
    else if (filter.length > 10 || /-/.test(filter)) {
      return "tools";
    }
    // Words with numbers = ports/versions
    else if (/\d/.test(filter)) {
      return "ports";
    }
    return "other";
  };

  // Get all filters in the same category as the given filter
  const getFiltersInSameCategory = (filter: string): string[] => {
    if (!pcapData?.datasets) return [];
    const category = getFilterCategory(filter);
    const filterSet = new Set<string>();

    pcapData.datasets.forEach((dataset) => {
      if (dataset.filter) {
        dataset.filter.forEach((f) => {
          if (getFilterCategory(f) === category) {
            filterSet.add(f);
          }
        });
      }
    });

    return Array.from(filterSet);
  };

  const handleFilterToggle = (filter: string) => {
    setSelectedFilters((prev) => {
      // If filter is already selected, deselect it
      if (prev.includes(filter)) {
        return prev.filter((f) => f !== filter);
      }

      // Get all filters in the same category
      const filtersInSameCategory = getFiltersInSameCategory(filter);

      // Remove all filters from the same category
      const withoutSameCategory = prev.filter(
        (f) => !filtersInSameCategory.includes(f)
      );

      // Add the new filter
      return [...withoutSameCategory, filter];
    });
  };

  const handleClearFilters = () => {
    setSelectedFilters([]);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

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

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8 h-8 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Filter component */}
          {pcapData.datasets.length > 0 && (
            <DatasetFilters
              datasets={pcapData.datasets}
              selectedFilters={selectedFilters}
              onFilterToggle={handleFilterToggle}
              onClearFilters={handleClearFilters}
            />
          )}

          {/* Scrollable dataset list */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-1.5 pr-4">
              {filteredDatasets.length > 0 ? (
                filteredDatasets.map((dataset) => {
                  const isSelected = selectFile === dataset.file;
                  return (
                    <button
                      key={dataset.id}
                      type="button"
                      onClick={() => onDatasetSelect(dataset.file)}
                      className={cn(
                        "w-full p-2 bg-background border rounded-md transition-all text-left",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "hover:bg-muted/50 hover:border-muted-foreground/50"
                      )}
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
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
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
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground border rounded-md bg-muted/30">
                  No datasets match the selected filters or search query.
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
                  file.endsWith(".pcap") || file.endsWith(".pcapng")
              )
              .map((file: string) => {
                const isSelected = selectFile === file;
                return (
                  <button
                    key={file}
                    type="button"
                    onClick={() => onDatasetSelect(file)}
                    className={cn(
                      "w-full p-3 bg-background border rounded-md transition-all text-left",
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "hover:bg-muted/50 hover:border-muted-foreground/50"
                    )}
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
