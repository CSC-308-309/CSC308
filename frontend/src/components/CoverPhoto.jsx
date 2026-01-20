// src/components/CoverPhoto.jsx

import { useEffect, useState } from 'react';
import EditCoverPhotoButton from './EditCoverPhotoButton';
import defaultCover from '../assets/DefaultBanner.jpg';
import { api } from '../client';

  //shrinks image size for starage
async function processImageToBlob(file, maxWidth) {
  const reader = new FileReader();
  const fileData = await new Promise((resolve) => {
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

  const img = new Image();
  img.src = fileData;
  await new Promise((resolve) => (img.onload = resolve));

  const scale = img.width > maxWidth ? maxWidth / img.width : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);

  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
  });

  if (!blob) throw new Error('Image processing failed');

  return blob;
}

export default function CoverPhoto({
  storageKey = 'coverPhotoUrl',
  fallbackSrc = defaultCover,
  className = 'mt-10',
  objectPosition = 'center',
  username, 
}) {
  const [src, setSrc] = useState(fallbackSrc);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setSrc(saved);
  }, [storageKey]);

  const handleFileSelect = async (file) => {
    if (!file?.type?.startsWith('image/')) return;

    try {
      setIsUploading(true);

      const blob = await processImageToBlob(file, 1100);

      const previewUrl = URL.createObjectURL(blob);
      setSrc(previewUrl);

      //pre-signed upload URL from backend
      const { uploadUrl, fileUrl } = await api.presignUpload({
        kind: 'cover',
        contentType: 'image/jpeg',
        fileSize: blob.size,
        userId: username,
      });

      //upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        body: blob,
      });

      if (!uploadResponse.ok) {
        const errText = await uploadResponse.text();
        console.error("S3 error:", uploadResponse.status, errText);
        throw new Error(`S3 upload failed (${uploadResponse.status})`);
      }

      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed (${uploadResponse.status})`);
      }

      await api.update(username, { coverPhotoUrl: fileUrl });

      setSrc(fileUrl);
      localStorage.setItem(storageKey, fileUrl);

      URL.revokeObjectURL(previewUrl);

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
      setSrc(localStorage.getItem(storageKey) || fallbackSrc);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`relative mx-auto max-w-[1100px] ${className}`}>
      <div className="relative w-full h-[240px] overflow-hidden rounded-[5px] bg-purple-200">
        <img
          src={src}
          alt="Cover"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition, opacity: isUploading ? 0.6 : 1 }}
        />
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black/60 text-white px-4 py-2 rounded">
              Uploading...
            </span>
          </div>
        )}

        <div className="absolute right-4 bottom-4">
          <EditCoverPhotoButton onSelect={handleFileSelect} disabled={isUploading} />
        </div>
      </div>
    </div>
  );
}
