import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";

interface ISelectInterfaceProps {
  ifaces?: string[];
  selectedInterface: string;
  setSelectedInterface: (iface: string) => void;
}

export const SelectInterface = ({
  ifaces,
  selectedInterface,
  setSelectedInterface,
}: ISelectInterfaceProps) => {
  return (
    <div className="grid items-center gap-3">
      <Label htmlFor="interface-select">Interfaces</Label>
      <Select
        onValueChange={(value: string) => setSelectedInterface(value)}
        value={selectedInterface}
      >
        <SelectTrigger className="w-[180px]">
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
