"use client";
import { useState } from "react";
import { exportReport } from "@/lib/pdf";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

export function Toolbar({ targetId }: { targetId: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportReport(targetId);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleExport} size="sm" disabled={isExporting}>
        {isExporting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating PDF...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" /> Export report (PDF)
          </>
        )}
      </Button>
    </div>
  );
}

