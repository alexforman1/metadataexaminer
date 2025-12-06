"use client";

export type ReportData = {
  files: { name: string; size: number; hash: string }[];
  notes: string[];
  meta?: Record<string, unknown>;
  header?: { soi: string; marker: string };
  gps?: { latitude: number; longitude: number };
};

// PDF-friendly version with explicit RGB colors (no oklch/lab)
export default function PDFPreview({ data }: { data: ReportData }) {
  return (
    <div
      id="report-root-pdf"
      style={{
        padding: "16px",
        backgroundColor: "#ffffff",
        color: "#1a1a1a",
        minWidth: "210mm",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px", color: "#1a1a1a" }}>
        Image Metadata Report
      </h2>
      <div
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: "8px",
          padding: "16px",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ fontWeight: "500", marginBottom: "8px", color: "#1a1a1a" }}>Files & SHA-256</h3>
          <ul style={{ listStyle: "disc", paddingLeft: "24px", fontSize: "14px", margin: 0 }}>
            {data.files.length === 0 ? (
              <li style={{ color: "#666666" }}>No files uploaded</li>
            ) : (
              data.files.map((f, i) => (
                <li key={i} style={{ marginBottom: "4px", wordBreak: "break-word" }}>
                  <span style={{ fontFamily: "monospace" }}>{f.name}</span> ({(f.size / 1024).toFixed(1)} KB) —
                  <span style={{ fontFamily: "monospace", wordBreak: "break-all" }}> {f.hash}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {data.header && (
          <div style={{ fontSize: "12px", borderTop: "1px solid #e5e5e5", paddingTop: "8px", marginTop: "8px", color: "#666666" }}>
            <strong>Header:</strong> SOI {data.header.soi}; Marker {data.header.marker}{" "}
            ({data.header.marker === "FFE0" ? "JFIF" : data.header.marker === "FFE1" ? "Exif" : "Unknown"}).
          </div>
        )}

        {data.gps && (
          <div style={{ fontSize: "12px", borderTop: "1px solid #e5e5e5", paddingTop: "8px", marginTop: "8px", color: "#666666" }}>
            <strong>Location:</strong> <span style={{ fontFamily: "monospace" }}>{data.gps.latitude.toFixed(6)}, {data.gps.longitude.toFixed(6)}</span>
            {" "}(<a
              href={`https://maps.google.com/?q=${data.gps.latitude},${data.gps.longitude}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#2563eb", textDecoration: "underline" }}
            >
              Open in Maps
            </a>)
          </div>
        )}

        {data.meta && Object.keys(data.meta).length > 0 && (
          <div style={{ fontSize: "14px", borderTop: "1px solid #e5e5e5", paddingTop: "8px", marginTop: "8px" }}>
            <h4 style={{ fontWeight: "500", marginBottom: "8px", color: "#1a1a1a" }}>Metadata Snapshot</h4>
            <pre
              style={{
                overflow: "auto",
                borderRadius: "4px",
                backgroundColor: "#f5f5f5",
                padding: "12px",
                fontSize: "12px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                margin: 0,
                color: "#1a1a1a",
              }}
            >
              {JSON.stringify(data.meta, null, 2)}
            </pre>
          </div>
        )}

        <div style={{ fontSize: "12px", color: "#666666", borderTop: "1px solid #e5e5e5", paddingTop: "8px", marginTop: "8px" }}>
          <p style={{ fontWeight: "500", marginBottom: "4px", color: "#1a1a1a" }}>Notes:</p>
          <ul style={{ listStyle: "disc", paddingLeft: "24px", margin: 0 }}>
            {data.notes.map((n, i) => (
              <li key={i} style={{ marginBottom: "4px" }}>{n}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

