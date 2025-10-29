"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Row } from "@/lib/diff";

export function CompareTable({ rows }: { rows: Row[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tag</TableHead>
          <TableHead>Left</TableHead>
          <TableHead>Right</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.key} className={r.changed ? "bg-muted/40" : undefined}>
            <TableCell className="font-mono text-xs">{r.key}</TableCell>
            <TableCell className="break-all text-sm">{fmt(r.left)}</TableCell>
            <TableCell className="break-all text-sm">{fmt(r.right)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function fmt(v: unknown) {
  return typeof v === "object" ? JSON.stringify(v) : String(v ?? "");
}

