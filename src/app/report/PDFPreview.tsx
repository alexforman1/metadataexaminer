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
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      id="report-root-pdf"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "20mm",
        backgroundColor: "#ffffff",
        color: "#000000",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "11pt",
        lineHeight: "1.6",
      }}
    >
      {/* Header */}
      <div style={{ borderBottom: "2px solid #000000", paddingBottom: "12px", marginBottom: "24px" }}>
        <h1
          style={{
            fontSize: "24pt",
            fontWeight: "bold",
            margin: "0 0 8px 0",
            color: "#000000",
            letterSpacing: "0.5px",
          }}
        >
          IMAGE METADATA ANALYSIS REPORT
        </h1>
        <div style={{ fontSize: "10pt", color: "#333333" }}>
          Generated: {reportDate}
        </div>
      </div>

      {/* Executive Summary */}
      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            fontSize: "14pt",
            fontWeight: "bold",
            marginBottom: "12px",
            color: "#000000",
            borderBottom: "1px solid #cccccc",
            paddingBottom: "4px",
          }}
        >
          1. FILE INFORMATION
        </h2>
        {data.files.length === 0 ? (
          <p style={{ color: "#666666", fontStyle: "italic" }}>No files analyzed.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "16px",
              fontSize: "10pt",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #000000" }}>
                <th style={{ textAlign: "left", padding: "8px", fontWeight: "bold" }}>Filename</th>
                <th style={{ textAlign: "right", padding: "8px", fontWeight: "bold" }}>Size</th>
                <th style={{ textAlign: "left", padding: "8px", fontWeight: "bold" }}>SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody>
              {data.files.map((f, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #e0e0e0" }}>
                  <td style={{ padding: "8px", fontFamily: "monospace", fontSize: "9pt" }}>{f.name}</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>{(f.size / 1024).toFixed(1)} KB</td>
                  <td style={{ padding: "8px", fontFamily: "monospace", fontSize: "9pt", wordBreak: "break-all" }}>
                    {f.hash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Technical Details */}
      {(data.header || data.gps) && (
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "14pt",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#000000",
              borderBottom: "1px solid #cccccc",
              paddingBottom: "4px",
            }}
          >
            2. TECHNICAL DETAILS
          </h2>
          <div style={{ paddingLeft: "12px" }}>
            {data.header && (
              <div style={{ marginBottom: "12px" }}>
                <strong>JPEG Header:</strong> SOI marker: <code style={{ fontFamily: "monospace" }}>{data.header.soi}</code>; 
                Segment marker: <code style={{ fontFamily: "monospace" }}>{data.header.marker}</code>{" "}
                ({data.header.marker === "FFE0" ? "JFIF" : data.header.marker === "FFE1" ? "Exif" : "Unknown"})
              </div>
            )}
            {data.gps && (
              <div style={{ marginBottom: "12px" }}>
                <strong>Geographic Coordinates:</strong>{" "}
                <code style={{ fontFamily: "monospace" }}>
                  {data.gps.latitude.toFixed(6)}°N, {data.gps.longitude.toFixed(6)}°E
                </code>
                {" "}(<a
                  href={`https://maps.google.com/?q=${data.gps.latitude},${data.gps.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#0000ee", textDecoration: "underline" }}
                >
                  View on Map
                </a>)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metadata */}
      {data.meta && Object.keys(data.meta).length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "14pt",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#000000",
              borderBottom: "1px solid #cccccc",
              paddingBottom: "4px",
            }}
          >
            3. EXIF METADATA
          </h2>
          <div
            style={{
              backgroundColor: "#f9f9f9",
              border: "1px solid #e0e0e0",
              padding: "12px",
              fontSize: "9pt",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: "1.4",
            }}
          >
            {JSON.stringify(data.meta, null, 2)}
          </div>
        </div>
      )}

      {/* Disclaimers */}
      <div
        style={{
          marginTop: "32px",
          paddingTop: "16px",
          borderTop: "2px solid #000000",
          fontSize: "9pt",
          color: "#666666",
        }}
      >
        <h3
          style={{
            fontSize: "11pt",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#000000",
          }}
        >
          IMPORTANT DISCLAIMERS
        </h3>
        <ul style={{ margin: "0", paddingLeft: "20px", lineHeight: "1.5" }}>
          {data.notes.map((n, i) => (
            <li key={i} style={{ marginBottom: "6px" }}>{n}</li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: "15mm",
          left: "20mm",
          right: "20mm",
          fontSize: "8pt",
          color: "#999999",
          textAlign: "center",
          borderTop: "1px solid #cccccc",
          paddingTop: "8px",
        }}
      >
        This report was generated by a client-side analysis tool. All processing occurred locally in your browser.
        No files were uploaded to any server.
      </div>
    </div>
  );
}

