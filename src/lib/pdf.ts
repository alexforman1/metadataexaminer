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

    // Force RGB colors before PDF generation
    forceRGBColors(el);

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
          // Remove all style tags with oklch/lab from cloned document
          const styleTags = clonedDoc.querySelectorAll("style");
          styleTags.forEach((style) => {
            if (style.textContent?.includes("oklch") || style.textContent?.includes("lab")) {
              style.remove();
            }
          });
          
          // Remove link tags to external stylesheets that might have oklch
          const linkTags = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
          linkTags.forEach((link) => link.remove());
          
          const clonedElement = clonedDoc.getElementById(elementId);
          if (!clonedElement) return;
          
          // Get original element for computed styles
          const originalElement = document.getElementById(elementId);
          if (!originalElement) return;
          
          // Copy computed RGB styles to cloned elements
          const copyStyles = (original: Element, cloned: Element) => {
            const originalEl = original as HTMLElement;
            const clonedEl = cloned as HTMLElement;
            
            if (originalEl && clonedEl) {
              const computed = window.getComputedStyle(originalEl);
              
              try {
                // Force RGB colors as inline styles
                const bg = computed.backgroundColor;
                if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
                  clonedEl.style.setProperty("background-color", bg, "important");
                }
                
                const color = computed.color;
                if (color) {
                  clonedEl.style.setProperty("color", color, "important");
                }
                
                const border = computed.borderColor;
                if (border && border !== "rgba(0, 0, 0, 0)") {
                  clonedEl.style.setProperty("border-color", border, "important");
                }
              } catch (e) {
                // Ignore
              }
            }
            
            // Process children
            const origChildren = Array.from(original.children);
            const clonedChildren = Array.from(cloned.children);
            for (let i = 0; i < Math.min(origChildren.length, clonedChildren.length); i++) {
              copyStyles(origChildren[i], clonedChildren[i]);
            }
          };
          
          copyStyles(originalElement, clonedElement);
        },
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

