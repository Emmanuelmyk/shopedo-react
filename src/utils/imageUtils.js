// import { supabase } from "./supabaseClient";

// export const getPublicUrlFromPath = (imgPath) => {
//   if (!imgPath) return "";
//   try {
//     const { data } = supabase.storage.from("products").getPublicUrl(imgPath);
//     return data?.publicUrl || "";
//   } catch (e) {
//     console.warn("getPublicUrl error", e);
//     return "";
//   }
// };

// export const getAdPublicUrl = (imgPath) => {
//   if (!imgPath) return "";
//   try {
//     const { data } = supabase.storage.from("ads").getPublicUrl(imgPath);
//     return data?.publicUrl || "";
//   } catch (e) {
//     console.warn("getAdPublicUrl error", e);
//     return "";
//   }
// };

// export const getSellerProfileUrl = (imgPath) => {
//   if (!imgPath) return "/assets/profilepics.png";
//   try {
//     const { data } = supabase.storage.from("profiles").getPublicUrl(imgPath);
//     return data?.publicUrl || "/assets/profilepics.png";
//   } catch (e) {
//     console.warn("getSellerProfileUrl error", e);
//     return "/assets/profilepics.png";
//   }
// };

// export const loadAndCompressImage = async (
//   src,
//   maxWidth = 400,
//   maxHeight = 220
//   // quality = 0.8
// ) => {
//   try {
//     const response = await fetch(src);
//     if (!response.ok) throw new Error("Failed to fetch image");

//     const blob = await response.blob();
//     const img = new Image();
//     img.src = URL.createObjectURL(blob);

//     await new Promise((resolve, reject) => {
//       img.onload = resolve;
//       img.onerror = reject;
//     });

//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");

//     let { width: naturalWidth, height: naturalHeight } = img;
//     let width = naturalWidth;
//     let height = naturalHeight;

//     if (naturalWidth > maxWidth || naturalHeight > maxHeight) {
//       const ratio = Math.min(
//         maxWidth / naturalWidth,
//         maxHeight / naturalHeight
//       );
//       width = naturalWidth * ratio;
//       height = naturalHeight * ratio;
//     }

//     canvas.width = width;
//     canvas.height = height;
//     ctx.drawImage(img, 0, 0, width, height);

//     const compressedBlob = await new Promise((resolve) => {
//       canvas.toBlob(resolve, "image/jpeg", quality);
//     });

//     URL.revokeObjectURL(img.src);
//     return compressedBlob;
//   } catch (e) {
//     console.error("Image compression error:", e);
//     const response = await fetch(src);
//     return await response.blob();
//   }
// };

// test image format
import { supabase } from "./supabaseClient";

/* ---------------------------------------------------
   Helper: Build a fast CDN URL with Resize + WebP
---------------------------------------------------- */
const buildOptimizedUrl = (url, width, quality) => {
  if (!url) return "";

  return `${url}?width=${width}&quality=${quality}&format=webp`;
};

/* ---------------------------------------------------
   Helper: Cache URLs locally (loads instantly next time)
---------------------------------------------------- */
const getCachedUrl = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setCachedUrl = (key, url) => {
  try {
    localStorage.setItem(key, url);
  } catch {}
};

/* ---------------------------------------------------
   PRODUCTS
---------------------------------------------------- */
export const getPublicUrlFromPath = (imgPath, width = 800, quality = 90) => {
  if (!imgPath) return "";

  // Check cache
  const cached = getCachedUrl(`products-${imgPath}-${width}-${quality}`);
  if (cached) return cached;

  try {
    const { data } = supabase.storage.from("products").getPublicUrl(imgPath);

    if (!data?.publicUrl) return "";

    const finalUrl = buildOptimizedUrl(data.publicUrl, width, quality);

    setCachedUrl(`products-${imgPath}-${width}-${quality}`, finalUrl);

    return finalUrl;
  } catch (e) {
    console.warn("getPublicUrl error", e);
    return "";
  }
};

/* ---------------------------------------------------
   ADS
---------------------------------------------------- */
export const getAdPublicUrl = (imgPath, width = 1000, quality = 90) => {
  if (!imgPath) return "";

  const cached = getCachedUrl(`ads-${imgPath}-${width}-${quality}`);
  if (cached) return cached;

  try {
    const { data } = supabase.storage.from("ads").getPublicUrl(imgPath);

    const finalUrl = buildOptimizedUrl(data?.publicUrl, width, quality);

    setCachedUrl(`ads-${imgPath}-${width}-${quality}`, finalUrl);

    return finalUrl;
  } catch (e) {
    console.warn("getAdPublicUrl error", e);
    return "";
  }
};

/* ---------------------------------------------------
   PROFILE IMAGES
---------------------------------------------------- */
export const getSellerProfileUrl = (imgPath, width = 300, quality = 90) => {
  if (!imgPath) return "/assets/profilepics.png";

  const cached = getCachedUrl(`profiles-${imgPath}-${width}-${quality}`);
  if (cached) return cached;

  try {
    const { data } = supabase.storage.from("profiles").getPublicUrl(imgPath);

    if (!data?.publicUrl) return "/assets/profilepics.png";

    const finalUrl = buildOptimizedUrl(data.publicUrl, width, quality);

    setCachedUrl(`profiles-${imgPath}-${width}-${quality}`, finalUrl);

    return finalUrl;
  } catch (e) {
    console.warn("getSellerProfileUrl error", e);
    return "/assets/profilepics.png";
  }
};

/* ---------------------------------------------------
   COMPRESS AN IMAGE (before uploading)
---------------------------------------------------- */
export const loadAndCompressImage = async (
  src,
  maxWidth = 400,
  maxHeight = 220,
  quality = 0.8
) => {
  try {
    const response = await fetch(src);
    if (!response.ok) throw new Error("Failed to fetch image");

    const blob = await response.blob();
    const img = new Image();
    img.src = URL.createObjectURL(blob);

    // Wait for image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    let { width: naturalWidth, height: naturalHeight } = img;
    let width = naturalWidth;
    let height = naturalHeight;

    if (naturalWidth > maxWidth || naturalHeight > maxHeight) {
      const ratio = Math.min(
        maxWidth / naturalWidth,
        maxHeight / naturalHeight
      );
      width = naturalWidth * ratio;
      height = naturalHeight * ratio;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    const compressedBlob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    });

    URL.revokeObjectURL(img.src);

    return compressedBlob;
  } catch (e) {
    console.error("Image compression error:", e);
    const response = await fetch(src);
    return await response.blob();
  }
};
