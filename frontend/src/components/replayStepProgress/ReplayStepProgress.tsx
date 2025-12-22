import type { ReplayStepType } from "../../types/types";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { UseMutationResult } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PacketDetails } from "@/components/packetDetails/PacketDetails";

dayjs.extend(utc);

interface IReplayStepProgressProps {
  mutation: UseMutationResult<unknown, Error, string, unknown>;
  selectFile: string | null;
}

export const ReplayStepProgress = ({
  mutation,
  selectFile,
}: IReplayStepProgressProps) => {
  const [data, setData] = useState<ReplayStepType | null>(null);

  useEffect(() => {
    if (mutation.data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(mutation.data as ReplayStepType);
    }
  }, [mutation.data]);

  return (
    <div className="flex flex-col w-full">
      <div className="w-full flex flex-row gap-4 mb-4 items-stretch">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>{Number((data?.progress ?? 0).toFixed(2))} %</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={Math.floor(data?.progress ?? 0)} />
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Packet Index</CardTitle>
          </CardHeader>
          <CardContent>{data?.index ?? "-"}</CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Timestamp</CardTitle>
          </CardHeader>
          <CardContent>{data?.timestamp ?? "-"}</CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Size</CardTitle>
          </CardHeader>
          <CardContent>{data?.size ? `${data?.size} bytes` : "-"}</CardContent>
        </Card>
      </div>
      <PacketDetails data={data?.parsed_packet} selectedFile={selectFile} />
    </div>
  );
};
