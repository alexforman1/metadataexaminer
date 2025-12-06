"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Row } from "@/lib/diff";

export function CompareMatrix({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-medium whitespace-nowrap sticky left-0 bg-background z-10">Tag</TableHead>
            {rows.map((r) => (
              <TableHead key={r.key} className="font-mono text-xs whitespace-nowrap">
                {r.key}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium whitespace-nowrap sticky left-0 bg-background z-10">Left</TableCell>
            {rows.map((r) => (
              <TableCell
                key={r.key}
                className={`break-all text-sm ${r.changed ? "bg-muted/40" : ""}`}
              >
                {fmt(r.left)}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium whitespace-nowrap sticky left-0 bg-background z-10">Right</TableCell>
            {rows.map((r) => (
              <TableCell
                key={r.key}
                className={`break-all text-sm ${r.changed ? "bg-muted/40" : ""}`}
              >
                {fmt(r.right)}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function fmt(v: unknown) {
  return typeof v === "object" ? JSON.stringify(v) : String(v ?? "");
}

