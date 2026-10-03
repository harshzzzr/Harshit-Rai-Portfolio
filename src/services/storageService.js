import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage, isFirebaseConfigured } from '../firebase/config';

/**
 * Standard Storage Path Prefixes
 */
export const STORAGE_PATHS = {
  PROFILE: 'profile',
  PROJECTS: 'projects',
  SCREENSHOTS: 'screenshots',
  CERTIFICATES: 'certificates',
  RESUME: 'resume',
};

/**
 * Client-side image optimization utility
 * Resizes images exceeding max dimensions and compresses via Canvas to WebP/JPEG
 * @param {File} file - Original image file
 * @param {Object} options - Max width, height, and target quality
 * @returns {Promise<Blob|File>} Optimized image blob or original file
 */
export async function optimizeImage(file, { maxWidth = 1600, maxHeight = 1600, quality = 0.82 } = {}) {
  // If not an image or running in SSR, return original
  if (!file || !file.type.startsWith('image/') || typeof window === 'undefined') {
    return file;
  }

  // SVG images do not need raster compression
  if (file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      let { width, height } = img;

      // Calculate constrained dimensions preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          maxHeight = height;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Determine output format (prefer WebP if supported, fallback to JPEG)
      const outputType = 'image/webp';

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // Keep original if compressed version is not smaller
            resolve(file);
          } else {
            resolve(blob);
          }
        },
        outputType,
        quality
      );
    };

    img.onerror = () => resolve(file);
    reader.onerror = () => resolve(file);

    reader.readAsDataURL(file);
  });
}

/**
 * Upload an asset to Firebase Storage with optional pre-upload optimization
 * @param {File|Blob} file - File to upload
 * @param {string} destinationPath - Path within storage bucket (e.g. 'projects/image-1.webp')
 * @param {Object} options - Optimization and metadata options
 */
export async function uploadAsset(file, destinationPath, options = { optimize: true }) {
  if (!isFirebaseConfigured || !storage) {
    throw new Error('Firebase Storage is not configured. Please set environment variables.');
  }

  try {
    let fileToUpload = file;
    let finalPath = destinationPath;
    let contentType = (file && file.type) || 'application/octet-stream';

    if (options.optimize && file instanceof File && file.type.startsWith('image/')) {
      const optimized = await optimizeImage(file, options);
      if (optimized !== file) {
        fileToUpload = optimized;
        contentType = 'image/webp';
        // Ensure destination ends with .webp
        finalPath = finalPath.replace(/\.[a-zA-Z0-9]+$/, '') + '.webp';
      }
    }

    const storageRef = ref(storage, finalPath);
    const metadata = {
      contentType,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
      }
    };

    const snapshot = await uploadBytes(storageRef, fileToUpload, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      success: true,
      url: downloadURL,
      path: finalPath,
      size: snapshot.metadata.size,
    };
  } catch (error) {
    console.error(`[Firebase Storage] Upload error for ${destinationPath}:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get public download URL for a storage path
 */
export async function getAssetUrl(storagePath) {
  if (!isFirebaseConfigured || !storage) {
    return null;
  }

  try {
    const storageRef = ref(storage, storagePath);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.warn(`[Firebase Storage] Could not resolve URL for ${storagePath}:`, error.message);
    return null;
  }
}

/**
 * Delete an asset from Firebase Storage
 */
export async function deleteAsset(storagePath) {
  if (!isFirebaseConfigured || !storage) {
    return { success: false, error: 'Firebase Storage not configured' };
  }

  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    console.error(`[Firebase Storage] Delete error for ${storagePath}:`, error);
    return { success: false, error: error.message };
  }
}
