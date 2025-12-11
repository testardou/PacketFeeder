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
  return (
    <Select
      onValueChange={(value: string) => setSelectedInterface(value)}
      value={selectedInterface ?? ""}
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
  );
};
