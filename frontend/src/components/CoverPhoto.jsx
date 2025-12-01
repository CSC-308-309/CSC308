// src/components/CoverPhoto.jsx

import { useEffect, useState } from 'react';
import EditCoverPhotoButton from './EditCoverPhotoButton';
import defaultCover from '../assets/DefaultBanner.jpg';

async function processImage(file, maxWidth) {
  const reader = new FileReader();
  const fileData = await new Promise((resolve) => {
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

  const img = new Image();
  img.src = fileData;
  await new Promise((resolve) => (img.onload = resolve));

  if (img.width <= maxWidth) return fileData;

  const scale = maxWidth / img.width;
  const canvas = document.createElement('canvas');
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg', 1);
}

export default function CoverPhoto({
  storageKey = 'coverPhoto',
  fallbackSrc = defaultCover,
  className = 'mt-10',
  objectPosition = 'center',
}) {
  const [src, setSrc] = useState(fallbackSrc);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setSrc(saved);
  }, [storageKey]);

  const handleFileSelect = async (file) => {
    if (!file?.type?.startsWith('image/')) return;

    const dataUrl = await processImage(file, 1100);
    setSrc(dataUrl);
    localStorage.setItem(storageKey, dataUrl);
  };

  return (
    <div className={`relative mx-auto max-w-[1100px] ${className}`}>
      <div className="relative w-full h-[240px] overflow-hidden rounded-[5px] bg-purple-200">
        <img
          src={src}
          alt="Cover"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition }}
        />
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        <div className="absolute right-4 bottom-4">
          <EditCoverPhotoButton onSelect={handleFileSelect} />
        </div>
      </div>
    </div>
  );
}
