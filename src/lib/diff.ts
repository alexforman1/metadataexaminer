export type Row = { key: string; left: unknown; right: unknown; changed: boolean };

export function diffMetadata(a: Record<string, unknown> = {}, b: Record<string, unknown> = {}): Row[] {
  const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).sort();
  return keys.map((k) => ({
    key: k,
    left: (a as any)[k],
    right: (b as any)[k],
    changed: JSON.stringify((a as any)[k]) !== JSON.stringify((b as any)[k]),
  }));
}

