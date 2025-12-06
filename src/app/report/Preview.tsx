"use client";
import { Card, CardContent } from "@/components/ui/card";

export type ReportData = {
  files: { name: string; size: number; hash: string }[];
  notes: string[];
  meta?: Record<string, unknown>;
  header?: { soi: string; marker: string };
  gps?: { latitude: number; longitude: number; address?: string };
};

export default function Preview({ data }: { data: ReportData }) {
  return (
    <div id="report-root" className="space-y-4 p-4 bg-white" style={{ minWidth: "210mm" }}>
      <h2 className="text-xl font-semibold mb-4">Image Metadata Report</h2>
      <div className="space-y-4 border rounded-lg p-4">
        <div>
          <h3 className="font-medium mb-2">Files & SHA-256</h3>
          <ul className="list-disc pl-6 text-sm space-y-1">
            {data.files.length === 0 ? (
              <li className="text-muted-foreground">No files uploaded</li>
            ) : (
              data.files.map((f, i) => (
                <li key={i} className="break-words">
                  <span className="font-mono">{f.name}</span> ({(f.size / 1024).toFixed(1)} KB) —
                  <span className="font-mono break-all"> {f.hash}</span>
                </li>
              ))
            )}
          </ul>
        </div>
        
        {data.header && (
          <div className="text-sm border-t pt-2">
            <p className="text-muted-foreground">
              <strong>Header:</strong> SOI {data.header.soi}; Marker {data.header.marker} ({data.header.marker === "FFE0" ? "JFIF" : data.header.marker === "FFE1" ? "Exif" : "Unknown"}).
            </p>
          </div>
        )}
        
        {data.gps && (
          <div className="text-sm border-t pt-2 space-y-1">
            <p className="text-muted-foreground">
              <strong>Coordinates:</strong> <span className="font-mono">{data.gps.latitude.toFixed(6)}, {data.gps.longitude.toFixed(6)}</span>
            </p>
            {data.gps.address && (
              <p className="text-muted-foreground">
                <strong>Address:</strong> {data.gps.address}
              </p>
            )}
            <p className="text-muted-foreground">
              <a
                href={`https://maps.google.com/?q=${data.gps.latitude},${data.gps.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="underline text-blue-600"
              >
                Open in Maps
              </a>
            </p>
          </div>
        )}
        
        {data.meta && Object.keys(data.meta).length > 0 && (
          <div className="text-sm border-t pt-2">
            <h4 className="font-medium mb-2">Metadata Snapshot</h4>
            <pre className="overflow-auto rounded bg-gray-100 p-3 text-xs whitespace-pre-wrap break-words">
              {JSON.stringify(data.meta, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground border-t pt-2">
          <p className="font-medium mb-1">Notes:</p>
          <ul className="list-disc pl-6 space-y-1">
            {data.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

