// src/components/ProfilePhoto.jsx
import { useRef, useEffect, useState } from "react";
import defaultPhoto from "../assets/DefaultProfilePhoto.png";
import { api } from "../client";
import { uploadViaPresign } from "../utils/s3Upload";

// crop + resize
async function processImageToBlobSquare(file, size) {
  const reader = new FileReader();
  const fileData = await new Promise((resolve) => {
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

  const img = new Image();
  img.src = fileData;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error("Image load failed"));
  });

  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

  const blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92);
  });

  if (!blob) throw new Error("Image processing failed");
  return blob;
}

export default function EditableProfilePhoto({
  storageKey = "profilePhotoUrl",
  fallbackSrc = defaultPhoto,
  size = 136,
  username,
  initialSrc = "",
}) {
  const uploadSize = Math.max(size * 2, 512);
  const inputRef = useRef(null);
  const [src, setSrc] = useState(fallbackSrc);
  const [isUploading, setIsUploading] = useState(false);


  useEffect(() => {
    const hydrateSignedSrc = async () => {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;
      try {
        const { viewUrl } = await api.presignView({ fileUrl: saved });
        if (viewUrl) setSrc(viewUrl);
      } catch {
        setSrc(saved);
      }
    };
    hydrateSignedSrc();
  }, [storageKey]);

  useEffect(() => {
    const hydrateInitialSrc = async () => {
      if (!initialSrc) return;
      try {
        const { viewUrl } = await api.presignView({ fileUrl: initialSrc });
        if (viewUrl) {
          setSrc(viewUrl);
          return;
        }
      } catch {
        // Fallback to raw URL below.
      }
      setSrc(initialSrc);
    };
    hydrateInitialSrc();
  }, [initialSrc]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file?.type?.startsWith("image/")) return;

    let previewUrl = null;

    try {
      if (!username) throw new Error("Missing username (used as userId)");
      setIsUploading(true);

      const blob = await processImageToBlobSquare(file, uploadSize);

      previewUrl = URL.createObjectURL(blob);
      setSrc(previewUrl);

      // Use teammate's upload helper
      const blobFile = new File([blob], "profile.jpg", { type: "image/jpeg" });
      const { fileUrl, viewUrl } = await uploadViaPresign({
        kind: "profile",
        file: blobFile,
        userId: username,
        contentTypeOverride: "image/jpeg",
      });

      // Save URL to database
      await api.update({ main_image: fileUrl });

      const renderedUrl = viewUrl || fileUrl;

      setSrc(renderedUrl);
      localStorage.setItem(storageKey, fileUrl);
    } catch (err) {
      console.error("Upload failed:", err);
      alert(`Upload failed: ${err.message}`);
      setSrc(localStorage.getItem(storageKey) || fallbackSrc);
    } finally {
      setIsUploading(false);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      e.target.value = "";
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-full overflow-hidden shadow-md shadow-black/50 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7E3AF2]/40 relative"
        style={{ width: size, height: size, opacity: isUploading ? 0.7 : 1 }}
        disabled={isUploading}
      >
        <img
          src={src}
          alt="Profile"
          className="h-full w-full object-cover"
          draggable={false}
          onError={(e) => {
            e.currentTarget.onerror = null;
            setSrc(fallbackSrc);
            localStorage.removeItem(storageKey);
          }}
        />

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="bg-black/60 text-white text-sm px-3 py-1 rounded">
              Uploading...
            </span>
          </div>
        )}
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
