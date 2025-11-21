// ==========================================
// FILE: src/utils/uploadUtils.js
// ==========================================
import { supabase } from "./supabaseClient";

/**
 * Upload an image to Supabase storage
 * @param {File} file - The image file to upload
 * @param {string} bucket - The storage bucket name (default: 'products')
 * @param {string} folder - Optional folder path within the bucket
 * @returns {Promise<{success: boolean, path?: string, url?: string, error?: string}>}
 */
export const uploadImage = async (file, bucket = "products", folder = "") => {
  try {
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return { 
        success: false, 
        error: "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image." 
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return { 
        success: false, 
        error: "File size too large. Maximum size is 5MB." 
      };
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      path: filePath,
      url: publicUrl,
    };
  } catch (err) {
    console.error("Upload error:", err);
    return { success: false, error: err.message || "Upload failed" };
  }
};

/**
 * Delete an image from Supabase storage
 * @param {string} path - The file path in storage
 * @param {string} bucket - The storage bucket name (default: 'products')
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteImage = async (path, bucket = "products") => {
  try {
    if (!path) {
      return { success: false, error: "No path provided" };
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error("Delete error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Delete error:", err);
    return { success: false, error: err.message || "Delete failed" };
  }
};

/**
 * Compress and resize an image before upload
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width (default: 1200)
 * @param {number} maxHeight - Maximum height (default: 1200)
 * @param {number} quality - Image quality 0-1 (default: 0.8)
 * @returns {Promise<File>}
 */
export const compressImage = async (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = reject;
    };

    reader.onerror = reject;
  });
};

