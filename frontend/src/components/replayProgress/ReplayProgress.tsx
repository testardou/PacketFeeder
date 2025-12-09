import type { ReplayProgressType } from "../../types/types";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

interface IReplayProgressProps {
  socketData: ReplayProgressType | null;
}

export const ReplayProgress = ({ socketData }: IReplayProgressProps) => {
  return (
    <>
      <div>
        <p>Percent: {Number(socketData?.progress.toFixed(2))} %</p>
        <p>Packet Index: {socketData?.index}</p>
        <p>
          Timestamp:
          {dayjs.unix(socketData?.timestamp ?? 0).format("HH:mm:ss.SSS")}
        </p>
        <p>
          Size:
          {socketData?.size} bytes
        </p>
        <p>
          Remaining Time:
          {dayjs((socketData?.remaining_time ?? 0) * 1000)
            .utc()
            .format("HH:mm:ss.SSS")}
        </p>
        <p>
          Next Packet In:
          {dayjs((socketData?.next_packet ?? 0) * 1000)
            .utc()
            .format("HH:mm:ss.SSS")}
        </p>
      </div>
      <p>
        <progress value={Math.floor(socketData?.progress ?? 0) / 100} />
      </p>
    </>
  );
};
