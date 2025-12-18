import { Card, CardContent } from "@/components/ui/card";
import type { PacketPayloadType } from "@/types/types";
import type { UseMutationResult } from "@tanstack/react-query";

interface IPacketPayloadProps {
  payload: UseMutationResult<PacketPayloadType, Error, string, unknown>;
}

const hexToBytes = (hex: string): Uint8Array => {
  const clean = hex.replace(/\s+/g, "");
  const bytes = new Uint8Array(clean.length / 2);

  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  }

  return bytes;
};

const formatWireshark = (hex: string) => {
  const bytes = hexToBytes(hex);

  return Array.from({ length: Math.ceil(bytes.length / 16) }, (_, row) => {
    const offset = row * 16;
    const slice = bytes.slice(offset, offset + 16);

    const hexPart = Array.from(slice)
      .map((b) => b.toString(16).padStart(2, "0"))
      .map((b, i) => (i === 8 ? ` ${b}` : b))
      .join(" ")
      .padEnd(48, " ");

    const asciiPart = Array.from(slice)
      .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : "."))
      .join("");

    return {
      offset: offset.toString(16).padStart(4, "0"),
      hex: hexPart,
      ascii: asciiPart,
    };
  });
};

export const PacketPayload = ({ payload }: IPacketPayloadProps) => {
  if (!payload) return null;

  return (
    <>
      {payload?.isPending && <h2>Packet payload is loading....</h2>}
      {payload?.data?.payload && (
        <Card className="w-fit">
          <CardContent>
            <pre className="text-sm font-mono overflow-x-auto">
              {formatWireshark(payload?.data?.payload)?.map((row) => (
                <div key={row.offset} className="flex gap-4">
                  <span className="text-muted-foreground">{row.offset}</span>
                  <span>{row.hex}</span>
                  <span className="text-primary">{row.ascii}</span>
                </div>
              ))}
            </pre>
          </CardContent>
        </Card>
      )}
    </>
  );
};
