import { useState } from 'react';

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
const UPLOAD_PRESET  = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);

  async function uploadFrames(blobs: Blob[]): Promise<string[]> {
    setUploading(true);
    setProgress(0);
    const urls: string[] = [];

    for (let i = 0; i < blobs.length; i++) {
      const form = new FormData();
      form.append('file', blobs[i]);
      form.append('upload_preset', UPLOAD_PRESET);
      form.append('folder', 'heirs-claims');

      const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: form });
      if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.statusText}`);
      const data = await res.json();
      urls.push(data.secure_url as string);
      setProgress(Math.round(((i + 1) / blobs.length) * 100));
    }

    setUploading(false);
    return urls;
  }

  return { uploadFrames, uploading, progress };
}
