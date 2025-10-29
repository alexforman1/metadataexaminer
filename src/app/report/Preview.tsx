"use client";
import { Card, CardContent } from "@/components/ui/card";

export type ReportData = {
  files: { name: string; size: number; hash: string }[];
  notes: string[];
  meta?: Record<string, unknown>;
  header?: { soi: string; marker: string };
  gps?: { latitude: number; longitude: number };
};

export default function Preview({ data }: { data: ReportData }) {
  return (
    <div id="report-root" className="space-y-4">
      <h2 className="text-xl font-semibold">Image Metadata Report</h2>
      <Card>
        <CardContent className="space-y-2 p-4">
          <h3 className="font-medium">Files & SHA-256</h3>
          <ul className="list-disc pl-6 text-sm">
            {data.files.map((f, i) => (
              <li key={i}>
                <span className="font-mono">{f.name}</span> ({(f.size / 1024).toFixed(1)} KB) —
                <span className="font-mono"> {f.hash}</span>
              </li>
            ))}
          </ul>
          {data.header && (
            <p className="text-xs text-muted-foreground">
              Header: SOI {data.header.soi}; Marker {data.header.marker} ({data.header.marker === "FFE0" ? "JFIF" : data.header.marker === "FFE1" ? "Exif" : ""}).
            </p>
          )}
          {data.gps && (
            <p className="text-xs text-muted-foreground">
              Location: <span className="font-mono">{data.gps.latitude.toFixed(6)}, {data.gps.longitude.toFixed(6)}</span>{" "}
              <a
                href={`https://maps.google.com/?q=${data.gps.latitude},${data.gps.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Open in Maps
              </a>
            </p>
          )}
          {data.meta && (
            <details className="text-sm">
              <summary className="cursor-pointer">Metadata Snapshot</summary>
              <pre className="overflow-auto rounded bg-muted p-3 text-xs">{JSON.stringify(data.meta, null, 2)}</pre>
            </details>
          )}
          <div className="text-xs text-muted-foreground">
            <p>Notes:</p>
            <ul className="list-disc pl-6">
              {data.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

