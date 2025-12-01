// ==========================================
// FILE: src/hooks/useImageObserver.js (ENHANCED)
// Optimized lazy loading with progressive enhancement
// ==========================================
import { useEffect, useRef, useCallback } from "react";
import { loadAndCompressImage } from "../utils/imageUtils";

export const useImageObserver = (enabled = true) => {
  const observerRef = useRef(null);
  const loadingImagesRef = useRef(new Set());
  const loadedImagesRef = useRef(new Set());

  useEffect(() => {
    if (!enabled) return;

    // More aggressive intersection observer settings for faster loading
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute("data-src");

            // Skip if already loading or loaded
            if (
              !src ||
              loadingImagesRef.current.has(src) ||
              loadedImagesRef.current.has(src)
            ) {
              return;
            }

            loadingImagesRef.current.add(src);
            const container = img.closest(".product-image-container");

            try {
              // Load image with compression
              const blob = await loadAndCompressImage(src, 400, 400, 0.85);

              // Only proceed if the image is still in the DOM
              if (!img.isConnected) {
                loadingImagesRef.current.delete(src);
                return;
              }

              const objectUrl = URL.createObjectURL(blob);

              // Use decode() for smoother rendering
              img.src = objectUrl;
              await img.decode().catch(() => {});

              // Mark as loaded
              if (container) container.classList.remove("skeleton");
              img.classList.add("visible");
              loadedImagesRef.current.add(src);
              loadingImagesRef.current.delete(src);
              img.removeAttribute("data-src");

              // Clean up object URL after a delay
              setTimeout(() => {
                if (img.src === objectUrl) {
                  URL.revokeObjectURL(objectUrl);
                }
              }, 1000);
            } catch (e) {
              console.error("Image loading error:", e);
              loadingImagesRef.current.delete(src);

              // Fallback to original URL
              try {
                img.src = src;
                await img.decode().catch(() => {});
                if (container) container.classList.remove("skeleton");
                img.classList.add("visible");
                img.removeAttribute("data-src");
              } catch (fallbackError) {
                console.error("Fallback loading failed:", fallbackError);
                if (container) container.classList.remove("skeleton");
              }
            }

            // Stop observing this image
            observerRef.current.unobserve(img);
          }
        });
      },
      {
        root: null,
        // Increased rootMargin for earlier loading (start loading before visible)
        rootMargin: "400px 0px",
        threshold: 0.01,
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Clean up loading state
      loadingImagesRef.current.clear();
    };
  }, [enabled]);

  const observe = useCallback((element) => {
    if (observerRef.current && element) {
      observerRef.current.observe(element);
    }
  }, []);

  const unobserve = useCallback((element) => {
    if (observerRef.current && element) {
      observerRef.current.unobserve(element);
    }
  }, []);

  return { observe, unobserve };
};
