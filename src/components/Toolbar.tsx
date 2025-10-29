"use client";
import { exportReport } from "@/lib/pdf";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function Toolbar({ targetId }: { targetId: string }) {
  return (
    <div className="flex items-center gap-2">
      <Button onClick={() => exportReport(targetId)} size="sm">
        <Download className="mr-2 h-4 w-4" /> Export report (PDF)
      </Button>
    </div>
  );
}

