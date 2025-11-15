// ==========================================
// FILE: src/hooks/useImageObserver.js
// ==========================================
import { useEffect, useRef } from "react";
import { loadAndCompressImage } from "../utils/imageUtils";

export const useImageObserver = (enabled = true) => {
  const observerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute("data-src");

            if (src) {
              const container = img.closest(".product-image-container");

              try {
                const blob = await loadAndCompressImage(src);
                const objectUrl = URL.createObjectURL(blob);

                img.onload = () => {
                  if (container) container.classList.remove("skeleton");
                  img.classList.add("visible");
                  if (img.src === objectUrl) {
                    URL.revokeObjectURL(objectUrl);
                  }
                };

                img.onerror = () => {
                  if (container) container.classList.remove("skeleton");
                  img.classList.add("visible");
                  URL.revokeObjectURL(objectUrl);
                };

                img.src = objectUrl;
                img.removeAttribute("data-src");
              } catch (e) {
                // Fallback to original URL
                img.onload = () => {
                  if (container) container.classList.remove("skeleton");
                  img.classList.add("visible");
                };

                img.onerror = () => {
                  if (container) container.classList.remove("skeleton");
                  img.classList.add("visible");
                };

                img.src = src;
                img.removeAttribute("data-src");
              }
            }

            observerRef.current.unobserve(img);
          }
        });
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.01,
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled]);

  const observe = (element) => {
    if (observerRef.current && element) {
      observerRef.current.observe(element);
    }
  };

  const unobserve = (element) => {
    if (observerRef.current && element) {
      observerRef.current.unobserve(element);
    }
  };

  return { observe, unobserve };
};
