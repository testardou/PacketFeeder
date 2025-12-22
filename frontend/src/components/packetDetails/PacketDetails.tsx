import type { PacketDetailsType, ReplayStepType } from "@/types/types";
import { useMutation } from "@tanstack/react-query";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PacketPayload } from "@/packetPayload/PacketPayload";

interface IPacketDetailsProps {
  data?: PacketDetailsType[] | ReplayStepType["parsed_packet"];
  selectedFile: string | null;
  isPending?: boolean;
}

export const PacketDetails = ({
  data,
  selectedFile,
  isPending,
}: IPacketDetailsProps) => {
  const packetPayloadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `http://localhost:5000/api/packet-payload?id=${id}&file=${selectedFile}`
      );

      if (!res.ok) throw new Error("Erreur API");

      return res.json();
    },
  });

  const columns: ColumnDef<
    PacketDetailsType | ReplayStepType["parsed_packet"]
  >[] = [
    {
      accessorKey: "id",
      header: "Index",
      enableSorting: false,
      cell: ({ row }) => <div>{`${row.getValue("id")}`}</div>,
    },
    {
      accessorKey: "timestamp",
      header: "Timstamp",
      enableSorting: false,
      cell: ({ row }) => <div>{`${row.getValue("timestamp")}`}</div>,
    },
    {
      accessorKey: "proto",
      header: "Protocol",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("proto")}</div>
      ),
    },
    {
      accessorKey: "src",
      header: "Ip Source",
      cell: ({ row }) => <div className="lowercase">{row.getValue("src")}</div>,
    },
    {
      accessorKey: "dst",
      header: "Ip Destination",
      cell: ({ row }) => <div className="lowercase">{row.getValue("dst")}</div>,
    },
    {
      accessorKey: "sport",
      header: "Port Source",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("sport")}</div>
      ),
    },
    {
      accessorKey: "dport",
      header: "Port Destination",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("dport")}</div>
      ),
    },
    {
      accessorKey: "length",
      header: "Length",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("length")}</div>
      ),
    },
    {
      accessorKey: "payload",
      header: "Payload",
      cell: ({ row }) => (
        <Button onClick={() => packetPayloadMutation.mutate(row.id)}>
          Show Payload
        </Button>
      ),
    },
  ];
  // console.log("DATA SNAPSHOT", JSON.stringify(detailsMutation.data));
  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      {isPending && (
        <p className="text-gray-500">Getting packets in progress...</p>
      )}

      {data && (
        <div className="w-full flex flex-row gap-6">
          <div>
            <div className="overflow-hidden rounded-md border w-fit">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4 ">
              <div className="text-muted-foreground flex-1 text-sm">
                {table.getFilteredRowModel().rows.length} row(s).
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>

          <PacketPayload payload={packetPayloadMutation} />
        </div>
      )}
    </>
  );
};
