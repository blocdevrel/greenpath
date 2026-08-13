import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export type PickedPhoto = {
  uri: string;
  base64: string;
};

type PickOptions = {
  /** Square crop UI on native; web uses our crop modal afterward. */
  square?: boolean;
  quality?: number;
};

async function launchPicker(
  source: 'camera' | 'gallery',
  options: ImagePicker.ImagePickerOptions,
) {
  if (source === 'camera') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return null;
    return ImagePicker.launchCameraAsync(options);
  }
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  return ImagePicker.launchImageLibraryAsync(options);
}

export async function pickEvidencePhoto(
  source: 'camera' | 'gallery',
): Promise<PickedPhoto | null> {
  const result = await launchPicker(source, {
    mediaTypes: ['images'],
    quality: 0.55,
    allowsEditing: true,
    base64: true,
    selectionLimit: 1,
  });
  if (!result || result.canceled) return null;
  const asset = result.assets[0];
  if (!asset?.uri || !asset.base64) return null;
  const mime = asset.mimeType || 'image/jpeg';
  return {
    uri: asset.uri,
    base64: `data:${mime};base64,${asset.base64}`,
  };
}

/** Profile avatar picker — prefers a square crop when the platform supports it. */
export async function pickProfilePhoto(
  source: 'camera' | 'gallery',
  opts: PickOptions = {},
): Promise<PickedPhoto | null> {
  const square = opts.square !== false;
  // Native editors honor aspect; web often ignores allowsEditing — crop modal handles that.
  const result = await launchPicker(source, {
    mediaTypes: ['images'],
    quality: opts.quality ?? 0.85,
    allowsEditing: square && Platform.OS !== 'web',
    aspect: square ? [1, 1] : undefined,
    base64: true,
    selectionLimit: 1,
  });
  if (!result || result.canceled) return null;
  const asset = result.assets[0];
  if (!asset?.uri) return null;

  if (asset.base64) {
    const mime = asset.mimeType || 'image/jpeg';
    return {
      uri: asset.uri,
      base64: `data:${mime};base64,${asset.base64}`,
    };
  }

  // Some web pickers omit base64 — read the blob ourselves.
  if (Platform.OS === 'web' && asset.uri) {
    try {
      const res = await fetch(asset.uri);
      const blob = await res.blob();
      const dataUrl = await blobToDataUrl(blob);
      return { uri: asset.uri, base64: dataUrl };
    } catch {
      return null;
    }
  }

  return null;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Could not read image'));
    };
    reader.onerror = () => reject(new Error('Could not read image'));
    reader.readAsDataURL(blob);
  });
}

/** Clerk web expects Blob/File; native Expo accepts a data URL string. */
export async function toClerkProfileFile(dataUrl: string): Promise<Blob | string> {
  if (Platform.OS === 'web') {
    const res = await fetch(dataUrl);
    return res.blob();
  }
  return dataUrl;
}

/**
 * Crop a data-URL image to a centered (or offset) square and resize for upload.
 * Works on web via canvas; on native returns the original when canvas is unavailable.
 */
export async function cropSquareDataUrl(
  dataUrl: string,
  options: {
    /** 0–1 normalized pan of crop center within image */
    offsetX?: number;
    offsetY?: number;
    /** Zoom: 1 = fit shortest side, >1 zooms in */
    zoom?: number;
    outputSize?: number;
    quality?: number;
  } = {},
): Promise<string> {
  const outputSize = options.outputSize ?? 512;
  const quality = options.quality ?? 0.9;
  const zoom = Math.max(1, options.zoom ?? 1);
  const offsetX = options.offsetX ?? 0.5;
  const offsetY = options.offsetY ?? 0.5;

  if (typeof document === 'undefined') {
    return dataUrl;
  }

  const img = await loadHtmlImage(dataUrl);
  const short = Math.min(img.width, img.height);
  const crop = short / zoom;
  const maxX = img.width - crop;
  const maxY = img.height - crop;
  const sx = Math.max(0, Math.min(maxX, offsetX * img.width - crop / 2));
  const sy = Math.max(0, Math.min(maxY, offsetY * img.height - crop / 2));

  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(img, sx, sy, crop, crop, 0, 0, outputSize, outputSize);
  return canvas.toDataURL('image/jpeg', quality);
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image for cropping'));
    img.src = src;
  });
}
