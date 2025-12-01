// src/components/ProfilePhoto.jsx

import { useRef, useEffect, useState } from 'react';
import defaultPhoto from '../assets/DefaultProfilePhoto.png';

async function processImage(file, size) {
  const reader = new FileReader();
  const fileData = await new Promise((resolve) => {
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

  const img = new Image();
  img.src = fileData;
  await new Promise((resolve) => (img.onload = resolve));

  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

  return canvas.toDataURL('image/jpeg', 1);
}

export default function EditableProfilePhoto({
  storageKey = 'profilePhoto',
  fallbackSrc = defaultPhoto,
  size = 136,
}) {
  const inputRef = useRef(null);
  const [src, setSrc] = useState(fallbackSrc);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setSrc(saved);
  }, [storageKey]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file?.type?.startsWith('image/')) return;

    const dataUrl = await processImage(file, size);
    setSrc(dataUrl);
    localStorage.setItem(storageKey, dataUrl);
    e.target.value = '';
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-full overflow-hidden shadow-md shadow-black/50 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7E3AF2]/40"
        style={{ width: size, height: size }}
      >
        <img
          src={src}
          alt="Profile"
          className="h-full w-full object-cover"
          draggable={false}
        />
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
}
