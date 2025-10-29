"use client";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Uploader, UploadItem } from "@/components/Uploader";
import { MetaTable } from "@/components/MetaTable";
import { CompareTable } from "@/components/CompareTable";
import { HeaderPeek } from "@/components/HeaderPeek";
import { Toolbar } from "@/components/Toolbar";
import { parseExif } from "@/lib/exif";
import { sha256 } from "@/lib/hash";
import { readHeader } from "@/lib/header";
import { diffMetadata } from "@/lib/diff";
import Preview from "./report/Preview";

export default function Page() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedB, setSelectedB] = useState<string | null>(null);
  const [meta, setMeta] = useState<Record<string, unknown>>({});
  const [metaB, setMetaB] = useState<Record<string, unknown>>({});
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [headerMap, setHeaderMap] = useState<Record<string, { bytes: Uint8Array; soi: string; marker: string }>>({});

  async function onUpload(newItems: UploadItem[]) {
    setItems((prev) => [...prev, ...newItems]);
    for (const it of newItems) {
      const [m, h, head] = await Promise.all([parseExif(it.file), sha256(it.file), readHeader(it.file)]);
      setHashes((prev) => ({ ...prev, [it.id]: h }));
      setHeaderMap((prev) => ({ ...prev, [it.id]: head }));
      // pre-cache meta for quick switching
    }
  }

  const active = items.find((i) => i.id === selected) ?? null;
  const activeB = items.find((i) => i.id === selectedB) ?? null;

  // Lazy load meta when selected to avoid large memory if many files
  async function ensureMeta(id: string | null, which: "A" | "B") {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const data = await parseExif(item.file);
    which === "A" ? setMeta(data) : setMetaB(data);
  }

  const cmpRows = useMemo(() => diffMetadata(meta, metaB), [meta, metaB]);

  const reportData = useMemo(() => {
    return {
      files: items.map((i) => ({ name: i.file.name, size: i.file.size, hash: hashes[i.id] || "" })).filter((f) => f.hash),
      notes: [
        "Processing occurs locally in your browser; files are not uploaded or stored.",
        "EXIF timestamps may be inaccurate due to device clock changes or failures; seek corroboration (e.g., location, lighting/sun position, other artifacts).",
        "Hashes are provided to demonstrate integrity of the files as provided to this tool (educational use).",
      ],
      meta: meta,
      header: active ? { soi: headerMap[active.id]?.soi, marker: headerMap[active.id]?.marker } : undefined,
    };
  }, [items, hashes, meta, headerMap, active]);

  return (
    <main className="container mx-auto grid gap-6 p-6 lg:grid-cols-3">
      <section className="lg:col-span-1 space-y-4">
        <Uploader onFiles={onUpload} />
        <ScrollArea className="h-[60vh] rounded-md border p-2">
          <div className="grid grid-cols-2 gap-3">
            {items.map((it) => (
              <button
                key={it.id}
                onClick={() => {
                  setSelected(it.id);
                  ensureMeta(it.id, "A");
                }}
                className={`rounded-xl border p-2 text-left ${selected === it.id ? "ring-2 ring-primary" : ""}`}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.url} alt={it.file.name} className="h-full w-full object-cover" />
                </div>
                <div className="mt-2 truncate text-xs font-mono">{it.file.name}</div>
                <div className="text-[10px] text-muted-foreground">SHA-256: {hashes[it.id]?.slice(0, 10)}…</div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </section>

      <section className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Client‑Side EXIF / Hash Inspector</h1>
          <Toolbar targetId="report-root" />
        </div>

        <Card>
          <CardContent className="grid gap-6 p-6 md:grid-cols-2">
            <div className="space-y-3">
              <h2 className="text-sm font-medium">Selected</h2>
              {!active && <p className="text-sm text-muted-foreground">Choose an image to view metadata.</p>}
              {active && (
                <>
                  <div className="relative h-48 w-full overflow-hidden rounded-xl border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={active.url} alt={active.file.name} className="h-full w-full object-contain" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-mono">{active.file.name}</span> — {Math.round(active.file.size / 1024)} KB
                    <br />Hash: <span className="font-mono break-all">{hashes[active.id]}</span>
                  </div>
                  <Separator />
                  <HeaderPeek
                    soi={headerMap[active.id]?.soi}
                    marker={headerMap[active.id]?.marker}
                    bytes={headerMap[active.id]?.bytes || new Uint8Array()}
                  />
                  <MetaTable meta={meta} />
                </>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-medium">Compare</h2>
              <div className="flex gap-2">
                <select
                  className="w-full rounded-md border p-2 text-sm"
                  value={selected || ""}
                  onChange={(e) => {
                    setSelected(e.target.value);
                    ensureMeta(e.target.value, "A");
                  }}
                >
                  <option value="">(Left)</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>{i.file.name}</option>
                  ))}
                </select>
                <select
                  className="w-full rounded-md border p-2 text-sm"
                  value={selectedB || ""}
                  onChange={(e) => {
                    setSelectedB(e.target.value);
                    ensureMeta(e.target.value, "B");
                  }}
                >
                  <option value="">(Right)</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>{i.file.name}</option>
                  ))}
                </select>
              </div>
              <div className="rounded-xl border p-2">
                <CompareTable rows={cmpRows} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Preview data={reportData} />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
