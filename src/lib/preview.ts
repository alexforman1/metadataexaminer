export async function getPreviewUrl(file: File, fallbackUrl?: string): Promise<string> {
  const isHeic = file.type === "image/heic" || file.type === "image/heif" || 
                  file.name.toLowerCase().endsWith(".heic") || 
                  file.name.toLowerCase().endsWith(".heif");
  
  if (!isHeic) {
    return fallbackUrl || URL.createObjectURL(file);
  }

  // Dynamic import to avoid SSR issues
  if (typeof window === "undefined") {
    return fallbackUrl || URL.createObjectURL(file);
  }

  try {
    const heic2any = (await import("heic2any")).default;
    const convertedBlobs = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.92,
    });
    const blob = Array.isArray(convertedBlobs) ? convertedBlobs[0] : convertedBlobs;
    return URL.createObjectURL(blob);
  } catch (error) {
    console.warn("HEIC conversion failed:", error);
    return fallbackUrl || URL.createObjectURL(file);
  }
}

