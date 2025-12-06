"use client";
import { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { getPreviewUrl } from "@/lib/preview";

export type UploadItem = { file: File; url: string; previewUrl: string; id: string };

export function Uploader({ onFiles }: { onFiles: (files: UploadItem[]) => void }) {
  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList) return;
      const items: UploadItem[] = await Promise.all(
        Array.from(fileList).map(async (file, i) => {
          const url = URL.createObjectURL(file);
          const previewUrl = await getPreviewUrl(file, url);
          return {
            file,
            url,
            previewUrl,
            id: `${file.name}-${file.size}-${i}-${Date.now()}`,
          };
        })
      );
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
          <div className="text-sm">Drag & drop images or click to choose (JPG/PNG/HEIC)</div>
          <input
            type="file"
            accept="image/*,.heic,.HEIC"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </CardContent>
    </Card>
  );
}

