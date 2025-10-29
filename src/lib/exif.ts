import exifr from "exifr";

export type AnyMeta = Record<string, unknown>;

export async function parseExif(file: File): Promise<AnyMeta> {
  const data = await exifr.parse(file, {
    tiff: true,
    ifd1: true,
    exif: true,
    gps: true,
    xmp: true,
    iptc: true,
  });
  return (data ?? {}) as AnyMeta;
}

