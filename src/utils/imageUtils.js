// ==========================================
// FILE: src/utils/imageUtils.js (ENHANCED)
// Optimized image loading with WebP support
// ==========================================
import { supabase } from "./supabaseClient";

// Cache for image URLs to avoid repeated Supabase calls
const urlCache = new Map();

export const getPublicUrlFromPath = (imgPath) => {
  if (!imgPath) return "";

  // Check cache first
  if (urlCache.has(imgPath)) {
    return urlCache.get(imgPath);
  }

  try {
    const { data } = supabase.storage.from("products").getPublicUrl(imgPath);
    const url = data?.publicUrl || "";

    // Cache the URL
    if (url) {
      urlCache.set(imgPath, url);
    }

    return url;
  } catch (e) {
    console.warn("getPublicUrl error", e);
    return "";
  }
};

export const getAdPublicUrl = (imgPath) => {
  if (!imgPath) return "";

  if (urlCache.has(`ad_${imgPath}`)) {
    return urlCache.get(`ad_${imgPath}`);
  }

  try {
    const { data } = supabase.storage.from("ads").getPublicUrl(imgPath);
    const url = data?.publicUrl || "";

    if (url) {
      urlCache.set(`ad_${imgPath}`, url);
    }

    return url;
  } catch (e) {
    console.warn("getAdPublicUrl error", e);
    return "";
  }
};

export const getSellerProfileUrl = (imgPath) => {
  if (!imgPath) return "/assets/profilepics.png";

  if (urlCache.has(`profile_${imgPath}`)) {
    return urlCache.get(`profile_${imgPath}`);
  }

  try {
    const { data } = supabase.storage.from("profiles").getPublicUrl(imgPath);
    const url = data?.publicUrl || "/assets/profilepics.png";

    if (url) {
      urlCache.set(`profile_${imgPath}`, url);
    }

    return url;
  } catch (e) {
    console.warn("getSellerProfileUrl error", e);
    return "/assets/profilepics.png";
  }
};

// Enhanced compression with WebP support and better quality
export const loadAndCompressImage = async (
  src,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.85
) => {
  try {
    // Try to fetch with cache first
    const response = await fetch(src, {
      cache: "force-cache",
      headers: {
        "Cache-Control": "max-age=31536000",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch image");

    const blob = await response.blob();

    // If image is already small enough and is WebP, return as-is
    if (blob.size < 50000 && blob.type === "image/webp") {
      return blob;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);
    img.src = objectUrl;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    let { width: naturalWidth, height: naturalHeight } = img;
    let width = naturalWidth;
    let height = naturalHeight;

    // Calculate new dimensions maintaining aspect ratio
    if (naturalWidth > maxWidth || naturalHeight > maxHeight) {
      const ratio = Math.min(
        maxWidth / naturalWidth,
        maxHeight / naturalHeight
      );
      width = Math.round(naturalWidth * ratio);
      height = Math.round(naturalHeight * ratio);
    }

    canvas.width = width;
    canvas.height = height;

    // Use better image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);

    // Try WebP first (better compression), fallback to JPEG
    let compressedBlob;
    try {
      compressedBlob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/webp", quality);
      });

      // If WebP fails or isn't supported, use JPEG
      if (!compressedBlob) {
        throw new Error("WebP not supported");
      }
    } catch (e) {
      compressedBlob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", quality);
      });
    }

    URL.revokeObjectURL(objectUrl);
    return compressedBlob;
  } catch (e) {
    console.error("Image compression error:", e);
    try {
      const response = await fetch(src, { cache: "force-cache" });
      return await response.blob();
    } catch (fetchError) {
      console.error("Failed to fetch original image:", fetchError);
      throw fetchError;
    }
  }
};

// Preload critical images
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = reject;
    img.src = url;
  });
};

// Batch preload multiple images
export const preloadImages = async (urls) => {
  const promises = urls.map((url) => preloadImage(url).catch(() => null));
  return Promise.all(promises);
};

// Clear URL cache (useful for testing or memory management)
export const clearUrlCache = () => {
  urlCache.clear();
};
