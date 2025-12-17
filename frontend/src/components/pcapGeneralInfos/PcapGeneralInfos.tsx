import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PcapInfoType } from "@/types/types";
import type { UseMutationResult } from "@tanstack/react-query";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

interface IPcapInfosProps {
  pcapInfos?: UseMutationResult<PcapInfoType, Error, string, unknown>;
}

export const PcapGeneralInfos = ({ pcapInfos }: IPcapInfosProps) => {
  const pcapInfosData = pcapInfos?.data;

  return (
    <div className="w-full flex flex-row gap-4 items-center mb-4">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Total packets</CardTitle>
        </CardHeader>
        <CardContent>
          <h3>{pcapInfosData?.packet_count}</h3>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Total bytes</CardTitle>
        </CardHeader>
        <CardContent>
          <h3>{pcapInfosData?.total_bytes}B</h3>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Total Duration</CardTitle>
        </CardHeader>
        <CardContent>
          <h3>
            {dayjs((pcapInfosData?.duration_seconds ?? 0) * 1000)
              .utc()
              .format("HH:mm:ss.SSS")}
          </h3>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Min Packet Size</CardTitle>
        </CardHeader>
        <CardContent>
          <h3>{pcapInfosData?.min_packet_size}</h3>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Max Packet Size</CardTitle>
        </CardHeader>
        <CardContent>
          <h3>{pcapInfosData?.max_packet_size}</h3>
        </CardContent>
      </Card>
    </div>
  );
};
