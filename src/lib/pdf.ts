export async function exportReport(elementId: string, filename = "metadata-report.pdf") {
  if (typeof window === "undefined") return;
  const html2pdf = (await import("html2pdf.js")).default;
  const el = document.getElementById(elementId);
  if (!el) return;
  await html2pdf().from(el).set({ margin: 10, filename }).save();
}

