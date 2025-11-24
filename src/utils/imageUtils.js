import { supabase } from "./supabaseClient";

export const getPublicUrlFromPath = (imgPath) => {
  if (!imgPath) return "";
  try {
    const { data } = supabase.storage.from("products").getPublicUrl(imgPath);
    return data?.publicUrl || "";
  } catch (e) {
    console.warn("getPublicUrl error", e);
    return "";
  }
};

export const getAdPublicUrl = (imgPath) => {
  if (!imgPath) return "";
  try {
    const { data } = supabase.storage.from("ads").getPublicUrl(imgPath);
    return data?.publicUrl || "";
  } catch (e) {
    console.warn("getAdPublicUrl error", e);
    return "";
  }
};

export const getSellerProfileUrl = (imgPath) => {
  if (!imgPath) return "/assets/profilepics.png";
  try {
    const { data } = supabase.storage.from("profiles").getPublicUrl(imgPath);
    return data?.publicUrl || "/assets/profilepics.png";
  } catch (e) {
    console.warn("getSellerProfileUrl error", e);
    return "/assets/profilepics.png";
  }
};

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
