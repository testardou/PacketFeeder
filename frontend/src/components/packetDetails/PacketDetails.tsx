import type { PacketDetailsType, ReplayStepType } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Search, X } from "lucide-react";
import { API_CONFIG } from "@/config/api";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type FilterFn,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  highlightedIndex?: number | null;
  hidePagination?: boolean;
}

// Custom filter function for IPs and ports
const ipPortFilterFn: FilterFn<any> = (row, _columnId, filterValue) => {
  if (!filterValue) return true;

  const searchTerm = filterValue.toLowerCase().trim();
  const rowData = row.original as PacketDetailsType;

  // Search in source IP
  const src = String(rowData.src || "").toLowerCase();
  // Search in destination IP
  const dst = String(rowData.dst || "").toLowerCase();
  // Search in source port
  const sport = rowData.sport != null ? String(rowData.sport) : "";
  // Search in destination port
  const dport = rowData.dport != null ? String(rowData.dport) : "";

  // Check if search term matches any IP or port
  return (
    src.includes(searchTerm) ||
    dst.includes(searchTerm) ||
    sport.includes(searchTerm) ||
    dport.includes(searchTerm)
  );
};

export const PacketDetails = ({
  data,
  selectedFile,
  isPending,
  highlightedIndex,
  hidePagination = false,
}: IPacketDetailsProps) => {
  const [shownPayloadId, setShownPayloadId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>("");

  const packetPayloadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${API_CONFIG.API_BASE}/packet-payload?id=${id}&file=${selectedFile}`
      );

      if (!res.ok) throw new Error("Erreur API");

      return res.json();
    },
    onSuccess: (_data, variables) => {
      setShownPayloadId(variables);
    },
  });

  // Reset shown payload and search when file changes
  useEffect(() => {
    setShownPayloadId(null);
    setSearchFilter("");
    packetPayloadMutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile]);

  type TableRow = PacketDetailsType | { [key: string]: unknown };

  const normalizedData: TableRow[] = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data]
  );

  const getProtocolColor = (proto: string) => {
    const protocol = String(proto).toLowerCase();
    switch (protocol) {
      case "tcp":
        return "text-blue-600 dark:text-blue-400";
      case "udp":
        return "text-green-600 dark:text-green-400";
      case "icmp":
        return "text-orange-600 dark:text-orange-400";
      case "arp":
        return "text-purple-600 dark:text-purple-400";
      case "dns":
        return "text-cyan-600 dark:text-cyan-400";
      default:
        return "text-foreground";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  const columns: ColumnDef<TableRow>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "#",
        enableSorting: false,
        size: 60,
        cell: ({ row }) => (
          <div className="font-mono text-sm text-muted-foreground">
            {row.getValue("id")}
          </div>
        ),
      },
      {
        accessorKey: "timestamp",
        header: "Time",
        enableSorting: false,
        size: 120,
        cell: ({ row }) => (
          <div className="font-mono text-sm">
            {formatTimestamp(row.getValue("timestamp") as number)}
          </div>
        ),
      },
      {
        accessorKey: "proto",
        header: "Protocol",
        size: 80,
        cell: ({ row }) => {
          const proto = String(row.getValue("proto"));
          return (
            <div
              className={`font-semibold text-sm uppercase ${getProtocolColor(
                proto
              )}`}
            >
              {proto}
            </div>
          );
        },
      },
      {
        accessorKey: "src",
        header: "Source",
        size: 140,
        cell: ({ row }) => (
          <div className="font-mono text-sm">{row.getValue("src")}</div>
        ),
      },
      {
        accessorKey: "sport",
        header: "Sport",
        size: 70,
        cell: ({ row }) => {
          const sport = row.getValue("sport");
          return (
            <div className="font-mono text-sm text-muted-foreground">
              {sport != null ? String(sport) : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "dst",
        header: "Destination",
        size: 140,
        cell: ({ row }) => (
          <div className="font-mono text-sm">{row.getValue("dst")}</div>
        ),
      },
      {
        accessorKey: "dport",
        header: "Dport",
        size: 70,
        cell: ({ row }) => {
          const dport = row.getValue("dport");
          return (
            <div className="font-mono text-sm text-muted-foreground">
              {dport != null ? String(dport) : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "length",
        header: "Length",
        size: 70,
        cell: ({ row }) => (
          <div className="font-mono text-sm text-right">
            {row.getValue("length")}
          </div>
        ),
      },
      {
        accessorKey: "payload",
        header: "Payload",
        size: 110,
        cell: ({ row }) => {
          const original = row.original as PacketDetailsType;
          const hasPayload = original?.has_payload ?? false;
          const packetId = String(original?.id ?? row.id);
          const isPayloadLoading =
            packetPayloadMutation.isPending &&
            packetPayloadMutation.variables === packetId;
          const isPayloadShown = shownPayloadId === packetId;

          if (!hasPayload) {
            return <div className="text-muted-foreground text-sm px-3">-</div>;
          }

          const handleClick = () => {
            if (isPayloadShown) {
              // Hide payload
              setShownPayloadId(null);
              packetPayloadMutation.reset();
            } else {
              // Show payload
              packetPayloadMutation.mutate(packetId);
            }
          };

          return (
            <Button
              variant={isPayloadShown ? "default" : "outline"}
              size="sm"
              className="h-7 text-sm gap-1.5 min-w-[105px] justify-center"
              onClick={handleClick}
              disabled={isPayloadLoading}
            >
              {isPayloadLoading ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Loading...</span>
                </>
              ) : isPayloadShown ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  <span>View</span>
                </>
              )}
            </Button>
          );
        },
      },
    ],
    [packetPayloadMutation, shownPayloadId]
  );

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchFilter.trim()) return normalizedData;

    return normalizedData.filter((row) => {
      const rowData = row as PacketDetailsType;
      const searchTerm = searchFilter.toLowerCase().trim();

      const src = String(rowData.src || "").toLowerCase();
      const dst = String(rowData.dst || "").toLowerCase();
      const sport = rowData.sport != null ? String(rowData.sport) : "";
      const dport = rowData.dport != null ? String(rowData.dport) : "";

      return (
        src.includes(searchTerm) ||
        dst.includes(searchTerm) ||
        sport.includes(searchTerm) ||
        dport.includes(searchTerm)
      );
    });
  }, [normalizedData, searchFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: ipPortFilterFn,
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
    state: {
      globalFilter: searchFilter,
    },
    onGlobalFilterChange: setSearchFilter,
  });

  return (
    <>
      {isPending && (
        <p className="text-gray-500">Getting packets in progress...</p>
      )}

      {data && (
        <div className="w-fit flex flex-row gap-6">
          <div className="flex-1 min-w-0 space-y-3">
            {/* Search Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by IP address or port (e.g., 192.168.1.1, 80, 443)"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-9 pr-9"
                />
                {searchFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setSearchFilter("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {searchFilter && (
                <span className="text-sm text-muted-foreground">
                  {table.getFilteredRowModel().rows.length} result
                  {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="overflow-x-auto rounded-lg border bg-card">
              <Table className="w-full">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="bg-muted/50 hover:bg-muted/50"
                    >
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead
                            key={header.id}
                            className="font-semibold text-sm h-9 px-3 whitespace-nowrap"
                          >
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
                    table.getRowModel().rows.map((row, index) => {
                      const rowData = row.original as PacketDetailsType;
                      const rowIndex = rowData?.id ?? index;
                      const isHighlighted =
                        highlightedIndex != null &&
                        rowIndex === highlightedIndex;

                      return (
                        <TableRow
                          key={row.id}
                          className={`h-8 hover:bg-muted/50 ${
                            isHighlighted
                              ? "bg-yellow-200 dark:bg-yellow-900/30 border-l-4 border-yellow-500"
                              : index % 2 === 0
                              ? "bg-background"
                              : "bg-muted/20"
                          }`}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className="px-3 py-1.5 text-sm"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })
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
            {!hidePagination && (
              <div className="flex items-center justify-between space-x-2 py-3 px-1">
                <div className="text-muted-foreground text-sm">
                  Showing {table.getState().pagination.pageIndex * 25 + 1} to{" "}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * 25,
                    table.getFilteredRowModel().rows.length
                  )}{" "}
                  of {table.getFilteredRowModel().rows.length} packets
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="h-7 text-sm"
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="h-7 text-sm"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="h-7 text-sm"
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="h-7 text-sm"
                  >
                    Last
                  </Button>
                </div>
              </div>
            )}
          </div>

          {shownPayloadId && <PacketPayload payload={packetPayloadMutation} />}
        </div>
      )}
    </>
  );
};
