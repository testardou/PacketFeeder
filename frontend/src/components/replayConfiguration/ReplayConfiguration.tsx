import type { UseMutationResult } from "@tanstack/react-query";

interface IReplayConfigurationProps {
  ifaces?: string[];
  selectedInterface: string;
  setSelectectedInterface: (iface: string) => void;
  setFile: (file: File | null) => void;
  uploadMutation: UseMutationResult<unknown, Error, File | null, unknown>;
  file: File | null;
}

export const ReplayConfiguration = ({
  ifaces,
  selectedInterface,
  setSelectectedInterface,
  setFile,
  uploadMutation,
  file,
}: IReplayConfigurationProps) => {
  return (
    <div>
      <div>
        <h2>Interfaces :</h2>
        <select
          id="interfaces"
          value={selectedInterface}
          onChange={(e) => setSelectectedInterface(e.target.value)}
          name="interfaces"
          className="mt-2 block"
        >
          {ifaces?.map((iface: string) => (
            <option key={iface} value={iface}>
              {iface}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-row gap-1">
        <input
          className="border rounded p-1"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <button
          onClick={() => uploadMutation.mutate(file)}
          type="button"
          className={`${
            file
              ? "bg-blue-500 hover:bg-blue-700 text-white"
              : "bg-gray-400 hover:bg-gray-400 text-gray-600"
          } font-bold py-2 px-4 rounded`}
          disabled={!file}
        >
          Envoyer le PCAP
        </button>
      </div>
    </div>
  );
};
