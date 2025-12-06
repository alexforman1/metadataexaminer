// Helper to force all colors to RGB by removing CSS variables and using computed styles
function forceRGBColors(element: HTMLElement) {
  // Remove all style tags that might contain oklch/lab
  const styleTags = element.ownerDocument.querySelectorAll("style");
  styleTags.forEach((style) => {
    if (style.textContent?.includes("oklch") || style.textContent?.includes("lab")) {
      style.remove();
    }
  });
  
  // Force inline RGB colors on all elements
  const allElements = element.querySelectorAll("*");
  const elementsArray = [element, ...Array.from(allElements)];
  
  elementsArray.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computed = window.getComputedStyle(htmlEl);
    
    // Remove CSS custom properties
    htmlEl.style.removeProperty("--background");
    htmlEl.style.removeProperty("--foreground");
    htmlEl.style.removeProperty("--card");
    htmlEl.style.removeProperty("--muted");
    htmlEl.style.removeProperty("--border");
    
    // Force RGB colors from computed styles
    try {
      const bg = computed.backgroundColor;
      if (bg && !bg.includes("oklch") && !bg.includes("lab")) {
        htmlEl.style.setProperty("background-color", bg, "important");
      }
      
      const color = computed.color;
      if (color && !color.includes("oklch") && !color.includes("lab")) {
        htmlEl.style.setProperty("color", color, "important");
      }
      
      const border = computed.borderColor;
      if (border && !border.includes("oklch") && !border.includes("lab")) {
        htmlEl.style.setProperty("border-color", border, "important");
      }
    } catch (e) {
      // Ignore errors
    }
  });
}

export async function exportReport(elementId: string = "report-root-pdf", filename = "metadata-report.pdf") {
  if (typeof window === "undefined") return;
  
  try {
    const html2pdf = (await import("html2pdf.js")).default;
    // Use the PDF-specific version which has explicit RGB colors (no oklch/lab)
    const el = document.getElementById(elementId);
    
    if (!el) {
      console.error("Report element not found:", elementId);
      return;
    }
    
    // PDFPreview uses only inline RGB styles, no CSS variables or oklch/lab

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

    // PDFPreview already has explicit RGB colors, so we can use it directly
    // But we need to make it visible temporarily for html2canvas
    const originalVisibility = el.style.visibility;
    const originalPosition = el.style.position;
    const originalLeft = el.style.left;
    const originalTop = el.style.top;
    
    // Make it visible for html2canvas
    el.style.visibility = "visible";
    el.style.position = "absolute";
    el.style.left = "0";
    el.style.top = "0";
    el.style.zIndex = "9999";

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
        onclone: (clonedDoc: Document) => {
          // Remove ALL stylesheets and style tags from cloned document
          // PDFPreview uses only inline styles, so this is just extra safety
          const styleTags = clonedDoc.querySelectorAll("style");
          styleTags.forEach((style) => style.remove());
          
          const linkTags = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
          linkTags.forEach((link) => link.remove());
        },
      },
      jsPDF: {
        unit: "mm" as const,
        format: "a4" as const,
        orientation: "portrait" as const,
      },
    };

    await html2pdf().set(opt).from(el).save();
    
    // Restore original styles
    el.style.visibility = originalVisibility;
    el.style.position = originalPosition;
    el.style.left = originalLeft;
    el.style.top = originalTop;
    el.style.zIndex = "";
  } catch (error) {
    console.error("PDF export failed:", error);
    // Restore styles on error
    const el = document.getElementById(elementId);
    if (el) {
      el.style.visibility = "hidden";
      el.style.position = "absolute";
      el.style.left = "-9999px";
      el.style.top = "-9999px";
    }
    alert("Failed to generate PDF. Please try again or check the browser console.");
  }
}

