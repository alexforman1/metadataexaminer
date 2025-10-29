export function toHexPairs(bytes: Uint8Array, max = 16): string[] {
  const arr = Array.from(bytes.slice(0, max));
  return arr.map((b) => b.toString(16).padStart(2, "0").toUpperCase());
}

