import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { PcapDataset } from "@/types/mitre";
import { X } from "lucide-react";
import { FilterButton } from "./FilterButton";

interface DatasetFiltersProps {
  datasets: PcapDataset[];
  selectedFilters: string[];
  onFilterToggle: (filter: string) => void;
  onClearFilters: () => void;
}

interface FilterGroup {
  category: string;
  filters: string[];
}

export function DatasetFilters({
  datasets,
  selectedFilters,
  onFilterToggle,
  onClearFilters,
}: DatasetFiltersProps) {
  // Extract all unique filters from all datasets
  const availableFilters = useMemo(() => {
    const filterSet = new Set<string>();
    datasets.forEach((dataset) => {
      if (dataset.filter) {
        dataset.filter.forEach((filter) => filterSet.add(filter));
      }
    });
    return Array.from(filterSet).sort();
  }, [datasets]);

  // Analyze datasets to automatically detect categories
  // Based only on structural characteristics of filters
  const filterGroups = useMemo(() => {
    const groupsMap = new Map<string, string[]>();

    availableFilters.forEach((filter) => {
      let category = "other";

      // Detection based only on structural characteristics
      // No hardcoded values, only generic patterns

      // Numbers only = ports
      if (/^\d+$/.test(filter)) {
        category = "ports";
      }
      // Short words (2-4 characters) in uppercase = protocols/acronyms
      else if (
        filter.length >= 2 &&
        filter.length <= 4 &&
        filter === filter.toUpperCase()
      ) {
        category = "protocols";
      }
      // Very short words (3-5 characters) in lowercase = services/acronyms
      else if (
        filter.length >= 3 &&
        filter.length <= 5 &&
        /^[a-z]+$/.test(filter)
      ) {
        category = "services";
      }
      // Short words (4-6 characters) = attributes/criticality
      else if (
        filter.length >= 4 &&
        filter.length <= 6 &&
        /^[a-z]+$/.test(filter)
      ) {
        category = "attributes";
      }
      // Medium words (7-10 characters) = types/actions
      else if (
        filter.length >= 7 &&
        filter.length <= 10 &&
        /^[a-z]+$/.test(filter)
      ) {
        category = "scanType";
      }
      // Long words (>10 characters) or with hyphens = tools/compounds
      else if (filter.length > 10 || /-/.test(filter)) {
        category = "tools";
      }
      // Words with numbers = ports/versions
      else if (/\d/.test(filter)) {
        category = "ports";
      }

      if (!groupsMap.has(category)) {
        groupsMap.set(category, []);
      }
      groupsMap.get(category)!.push(filter);
    });

    // Generic labels based on detected categories
    const categoryLabels: Record<string, string> = {
      ports: "Ports",
      protocols: "Protocols",
      services: "Services",
      attributes: "Attributes",
      scanType: "Scan Types",
      tools: "Tools",
      other: "Other",
    };

    const groups: FilterGroup[] = [];
    groupsMap.forEach((filters, category) => {
      groups.push({
        category: categoryLabels[category] || category,
        filters: filters.sort(),
      });
    });

    // Sort by number of filters (more filters = more important)
    groups.sort((a, b) => {
      if (a.filters.length !== b.filters.length) {
        return b.filters.length - a.filters.length;
      }
      return a.category.localeCompare(b.category);
    });

    return groups;
  }, [availableFilters]);

  if (availableFilters.length === 0) {
    return null;
  }

  const hasActiveFilters = selectedFilters.length > 0;

  return (
    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {filterGroups.map((group) => (
          <div key={group.category}>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {group.category}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.filters.map((filter) => (
                <FilterButton
                  key={filter}
                  filter={filter}
                  isSelected={selectedFilters.includes(filter)}
                  onClick={() => onFilterToggle(filter)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {hasActiveFilters && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            {selectedFilters.length} active filter
            {selectedFilters.length > 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
