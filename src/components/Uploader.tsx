"use client";
import { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";

export type UploadItem = { file: File; url: string; id: string };

export function Uploader({ onFiles }: { onFiles: (files: UploadItem[]) => void }) {
  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const items: UploadItem[] = Array.from(fileList).map((file, i) => ({
        file,
        url: URL.createObjectURL(file),
        id: `${file.name}-${file.size}-${i}-${Date.now()}`,
      }));
      onFiles(items);
    },
    [onFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <Card className="border-dashed">
      <CardContent className="p-6">
        <label
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center hover:bg-muted/50"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="h-6 w-6" />
          <div className="text-sm">Drag & drop images or click to choose (JPG/PNG)</div>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </CardContent>
    </Card>
  );
}

