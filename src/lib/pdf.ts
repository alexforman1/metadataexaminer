// Helper to convert oklch/lab colors to RGB via computed styles
function convertColorsToRGB(element: HTMLElement) {
  const allElements = element.querySelectorAll("*");
  const elementsArray = [element, ...Array.from(allElements)];
  
  elementsArray.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computedStyle = window.getComputedStyle(htmlEl);
    
    // Get all color properties and convert them
    const colorProps = [
      "backgroundColor",
      "color",
      "borderColor",
      "borderTopColor",
      "borderRightColor",
      "borderBottomColor",
      "borderLeftColor",
    ];
    
    colorProps.forEach((prop) => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && !value.includes("oklch") && !value.includes("lab")) {
        // Only set if it's already RGB/rgba/hex
        try {
          htmlEl.style.setProperty(prop, value, "important");
        } catch (e) {
          // Ignore errors
        }
      }
    });
    
    // Force RGB conversion by reading computed style and setting it
    try {
      const bg = computedStyle.backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        htmlEl.style.backgroundColor = bg;
      }
      const color = computedStyle.color;
      if (color) {
        htmlEl.style.color = color;
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

    // Convert colors to RGB before PDF generation
    convertColorsToRGB(el);

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
          // Convert all colors in the cloned document to RGB
          // The browser should have already computed oklch to RGB, so we just need to
          // ensure html2canvas reads the computed values
          const clonedElement = clonedDoc.getElementById(elementId);
          if (!clonedElement) return;
          
          // Get the original element to read computed styles
          const originalElement = document.getElementById(elementId);
          if (!originalElement) return;
          
          // Traverse both trees in parallel and copy computed styles
          const walkAndConvert = (original: Element, cloned: Element) => {
            const originalEl = original as HTMLElement;
            const clonedEl = cloned as HTMLElement;
            
            if (originalEl && clonedEl) {
              const computed = window.getComputedStyle(originalEl);
              
              // Copy computed RGB values to inline styles
              try {
                const bg = computed.backgroundColor;
                if (bg && !bg.includes("oklch") && !bg.includes("lab")) {
                  clonedEl.style.backgroundColor = bg;
                }
                
                const color = computed.color;
                if (color && !color.includes("oklch") && !color.includes("lab")) {
                  clonedEl.style.color = color;
                }
                
                const borderColor = computed.borderColor;
                if (borderColor && !borderColor.includes("oklch") && !borderColor.includes("lab")) {
                  clonedEl.style.borderColor = borderColor;
                }
              } catch (e) {
                // Ignore errors
              }
            }
            
            // Recursively process children
            const originalChildren = Array.from(original.children);
            const clonedChildren = Array.from(cloned.children);
            
            for (let i = 0; i < Math.min(originalChildren.length, clonedChildren.length); i++) {
              walkAndConvert(originalChildren[i], clonedChildren[i]);
            }
          };
          
          walkAndConvert(originalElement, clonedElement);
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

