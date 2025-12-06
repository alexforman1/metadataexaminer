// Reverse geocoding using OpenStreetMap Nominatim (free, no API key required)
export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "MetadataExaminer/1.0", // Required by Nominatim
        },
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.address) {
      const parts = [];
      if (data.address.road) parts.push(data.address.road);
      if (data.address.house_number) parts.push(data.address.house_number);
      if (data.address.city || data.address.town || data.address.village) {
        parts.push(data.address.city || data.address.town || data.address.village);
      }
      if (data.address.state) parts.push(data.address.state);
      if (data.address.country) parts.push(data.address.country);
      return parts.length > 0 ? parts.join(", ") : data.display_name || null;
    }
    return data.display_name || null;
  } catch (error) {
    console.warn("Reverse geocoding failed:", error);
    return null;
  }
}

