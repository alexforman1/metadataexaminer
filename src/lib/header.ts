export type HeaderInfo = {
  bytes: Uint8Array;
  soi: string;     // expect FFD8
  marker: string;  // FFE0 (JFIF) or FFE1 (Exif)
  label: string;   // convenience byte often referenced in figures (offset 6)
};

const hex = (v?: number) => (v === undefined ? "" : v.toString(16).padStart(2, "0").toUpperCase());

export async function readHeader(file: File): Promise<HeaderInfo> {
  const slice = file.slice(0, 16);
  const buf = new Uint8Array(await slice.arrayBuffer());
  const soi = `${hex(buf[0])}${hex(buf[1])}`; // FFD8
  const marker = `${hex(buf[2])}${hex(buf[3])}`; // FFE0 vs FFE1
  const label = `${hex(buf[6])}`;
  return { bytes: buf, soi, marker, label };
}

