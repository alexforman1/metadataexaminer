export async function exportReport(elementId: string, filename = "metadata-report.pdf") {
  if (typeof window === "undefined") return;
  
  try {
    const html2pdf = (await import("html2pdf.js")).default;
    const el = document.getElementById(elementId);
    
    if (!el) {
      console.error("Report element not found:", elementId);
      return;
    }

    // Wait for images to load
    const images = el.querySelectorAll("img");
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) {
              resolve();
            } else {
              img.onload = () => resolve();
              img.onerror = () => resolve(); // Continue even if image fails
            }
          })
      )
    );

    // Configure html2pdf with better settings
    const opt = {
      margin: 10,
      filename: filename,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
      },
      jsPDF: {
        unit: "mm" as const,
        format: "a4" as const,
        orientation: "portrait" as const,
      },
    };

    await html2pdf().set(opt).from(el).save();
  } catch (error) {
    console.error("PDF export failed:", error);
    alert("Failed to generate PDF. Please try again or check the browser console.");
  }
}

