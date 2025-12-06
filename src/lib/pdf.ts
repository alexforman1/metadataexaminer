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

    // Create a completely isolated clone with only RGB colors
    const isolatedClone = el.cloneNode(true) as HTMLElement;
    isolatedClone.id = `${elementId}-pdf-clone`;
    
    // Apply computed RGB styles to the clone
    const applyRGBStyles = (original: Element, clone: Element) => {
      const origEl = original as HTMLElement;
      const cloneEl = clone as HTMLElement;
      
      if (origEl && cloneEl) {
        const computed = window.getComputedStyle(origEl);
        
        // Apply all computed RGB colors as inline styles
        try {
          const bg = computed.backgroundColor;
          if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
            cloneEl.style.backgroundColor = bg;
          }
          
          const color = computed.color;
          if (color) {
            cloneEl.style.color = color;
          }
          
          const border = computed.borderColor;
          if (border && border !== "rgba(0, 0, 0, 0)") {
            cloneEl.style.borderColor = border;
            cloneEl.style.borderStyle = computed.borderStyle;
            cloneEl.style.borderWidth = computed.borderWidth;
          }
          
          // Copy other important styles
          cloneEl.style.padding = computed.padding;
          cloneEl.style.margin = computed.margin;
          cloneEl.style.fontSize = computed.fontSize;
          cloneEl.style.fontFamily = computed.fontFamily;
          cloneEl.style.fontWeight = computed.fontWeight;
        } catch (e) {
          // Ignore
        }
      }
      
      // Process children
      const origChildren = Array.from(original.children);
      const cloneChildren = Array.from(clone.children);
      for (let i = 0; i < Math.min(origChildren.length, cloneChildren.length); i++) {
        applyRGBStyles(origChildren[i], cloneChildren[i]);
      }
    };
    
    applyRGBStyles(el, isolatedClone);
    
    // Temporarily append to body (hidden) for html2canvas
    isolatedClone.style.position = "absolute";
    isolatedClone.style.left = "-9999px";
    isolatedClone.style.top = "0";
    document.body.appendChild(isolatedClone);

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
          const styleTags = clonedDoc.querySelectorAll("style");
          styleTags.forEach((style) => style.remove());
          
          const linkTags = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
          linkTags.forEach((link) => link.remove());
          
          // All styles should already be inline from our isolated clone
        },
      },
      jsPDF: {
        unit: "mm" as const,
        format: "a4" as const,
        orientation: "portrait" as const,
      },
    };

    await html2pdf().set(opt).from(isolatedClone).save();
    
    // Clean up
    document.body.removeChild(isolatedClone);
  } catch (error) {
    console.error("PDF export failed:", error);
    // Clean up on error
    const clone = document.getElementById(`${elementId}-pdf-clone`);
    if (clone) {
      document.body.removeChild(clone);
    }
    alert("Failed to generate PDF. Please try again or check the browser console.");
  }
}

