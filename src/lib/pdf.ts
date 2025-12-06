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

    // Get the parent wrapper and the PDFPreview element
    const parent = el.parentElement;
    if (!parent) {
      console.error("PDFPreview parent not found");
      return;
    }
    
    // Store original styles of both parent and element
    const originalParentStyles = {
      position: parent.style.position,
      left: parent.style.left,
      top: parent.style.top,
      zIndex: parent.style.zIndex,
      visibility: parent.style.visibility,
    };
    
    const originalElementStyles = {
      visibility: el.style.visibility,
      position: el.style.position,
      width: el.style.width,
      height: el.style.height,
    };
    
    // Make parent and element visible and properly positioned
    parent.style.position = "fixed";
    parent.style.left = "0";
    parent.style.top = "0";
    parent.style.zIndex = "99999";
    parent.style.visibility = "visible";
    parent.style.width = "210mm";
    parent.style.backgroundColor = "#ffffff";
    
    el.style.visibility = "visible";
    el.style.position = "relative";
    el.style.width = "100%";
    
    // Small delay to ensure rendering
    await new Promise(resolve => setTimeout(resolve, 100));

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
    if (parent) {
      parent.style.position = originalParentStyles.position;
      parent.style.left = originalParentStyles.left;
      parent.style.top = originalParentStyles.top;
      parent.style.zIndex = originalParentStyles.zIndex;
      parent.style.visibility = originalParentStyles.visibility;
      parent.style.width = "";
      parent.style.backgroundColor = "";
    }
    
    el.style.visibility = originalElementStyles.visibility;
    el.style.position = originalElementStyles.position;
    el.style.width = originalElementStyles.width;
    el.style.height = originalElementStyles.height;
  } catch (error) {
    console.error("PDF export failed:", error);
    // Restore styles on error
    const errorEl = document.getElementById(elementId);
    if (errorEl && errorEl.parentElement) {
      const errorParent = errorEl.parentElement;
      errorParent.style.position = "fixed";
      errorParent.style.left = "-9999px";
      errorParent.style.top = "0";
      errorParent.style.zIndex = "-1";
      errorParent.style.visibility = "hidden";
      errorEl.style.visibility = "visible";
    }
    alert("Failed to generate PDF. Please try again or check the browser console.");
  }
}

