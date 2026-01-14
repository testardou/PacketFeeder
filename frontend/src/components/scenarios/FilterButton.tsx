import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterButtonProps {
  filter: string;
  isSelected: boolean;
  onClick: () => void;
}

export function FilterButton({
  filter,
  isSelected,
  onClick,
}: FilterButtonProps) {
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={cn(
        "h-7 text-xs",
        isSelected && "bg-primary text-primary-foreground"
      )}
    >
      {filter}
    </Button>
  );
}
