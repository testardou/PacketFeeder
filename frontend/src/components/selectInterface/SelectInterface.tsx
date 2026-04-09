import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ISelectInterfaceProps {
  ifaces?: string[];
  selectedInterface: string | null;
  setSelectedInterface: (iface: string) => void;
}

export const SelectInterface = ({
  ifaces,
  selectedInterface,
  setSelectedInterface,
}: ISelectInterfaceProps) => {
  // Auto-select first interface when interfaces are loaded and none is selected
  useEffect(() => {
    if (ifaces && ifaces.length > 0 && !selectedInterface) {
      setSelectedInterface(ifaces[0]);
    }
  }, [ifaces, selectedInterface, setSelectedInterface]);

  return (
    <div className="flex flex-col gap-2 text-sm font-medium">
      <span>Interface</span>
      <Select
        onValueChange={(value: string) => setSelectedInterface(value)}
        value={selectedInterface ?? ""}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select an interface" />
        </SelectTrigger>
        <SelectContent>
          {ifaces?.map((iface: string) => (
            <SelectItem value={iface} key={iface}>
              {iface}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
