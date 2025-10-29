"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toHexPairs } from "@/lib/bytes";

export function HeaderPeek({ soi, marker, bytes }: { soi: string; marker: string; bytes: Uint8Array }) {
  const pairs = toHexPairs(bytes, 16);
  const markerLabel = marker === "FFE0" ? "JFIF (FFE0)" : marker === "FFE1" ? "Exif (FFE1)" : marker;
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">SOI {soi || "?"}</Badge>
          <Badge variant="outline">Marker {markerLabel}</Badge>
        </div>
        <div className="font-mono text-xs">
          {pairs.map((p, i) => (
            <span key={i} className="mr-2 inline-block">{p}</span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          SOI = <code>FFD8</code>. JFIF uses marker <code>FFE0</code> at offset 2, Exif uses <code>FFE1</code>. EOI is <code>FFD9</code>.
        </p>
      </CardContent>
    </Card>
  );
}

