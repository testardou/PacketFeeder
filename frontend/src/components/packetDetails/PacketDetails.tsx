import type { PacketDetailsType } from "@/types/types";
import type { UseMutationResult } from "@tanstack/react-query";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
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

interface IPacketDetailsProps {
  detailsMutation: UseMutationResult<
    PacketDetailsType[],
    Error,
    string,
    unknown
  >;
}

const columns: ColumnDef<PacketDetailsType>[] = [
  {
    id: "id",
    enableSorting: false,
    cell: ({ row }) => <div className="capitalize">{row.getValue("id")}</div>,
  },
  {
    id: "time",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("timestamp")}</div>
    ),
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
    cell: ({ row }) => <div className="lowercase">{row.getValue("sport")}</div>,
  },
  {
    accessorKey: "dport",
    header: "Port Destination",
    cell: ({ row }) => <div className="lowercase">{row.getValue("dport")}</div>,
  },
  {
    accessorKey: "length",
    header: "Length",
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("length")}</div>
    ),
  },
];

export const PacketDetails = ({ detailsMutation }: IPacketDetailsProps) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  console.log("DATA SNAPSHOT", JSON.stringify(detailsMutation.data));
  const table = useReactTable({
    data: detailsMutation?.data ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <>
      {detailsMutation?.isPending && (
        <p className="text-gray-500">Getting packets in progress...</p>
      )}

      {detailsMutation?.data && (
        <div className="w-full">
          <div className="overflow-hidden rounded-md border">
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
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
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
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-muted-foreground flex-1 text-sm">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
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
      )}
    </>
  );
};
