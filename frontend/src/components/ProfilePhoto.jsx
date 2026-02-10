// src/components/ProfilePhoto.jsx
import { useRef, useEffect, useState } from "react";
import defaultPhoto from "../assets/DefaultProfilePhoto.png";
import { api } from "../client";

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
  const inputRef = useRef(null);
  const [src, setSrc] = useState(fallbackSrc);
  const [isUploading, setIsUploading] = useState(false);

  const resolveViewUrl = async (rawUrl) => {
    if (!rawUrl) return "";
    try {
      const result = await api.presignViewUrl(rawUrl);
      return result?.viewUrl || rawUrl;
    } catch (err) {
      console.error("Failed to resolve image view URL:", err);
      return rawUrl;
    }
  };

  useEffect(() => {
    let cancelled = false;

    const hydratePhoto = async () => {
      const savedRaw = localStorage.getItem(storageKey);
      if (savedRaw) {
        const savedView = await resolveViewUrl(savedRaw);
        if (!cancelled) setSrc(savedView || fallbackSrc);
      }

      if (!username) return;

      try {
        const user = await api.getByUsername(username);
        const dbPhotoRaw = (user?.main_image || "").trim();
        if (dbPhotoRaw && !cancelled) {
          const dbPhotoView = await resolveViewUrl(dbPhotoRaw);
          if (!cancelled) setSrc(dbPhotoView || fallbackSrc);
          localStorage.setItem(storageKey, dbPhotoRaw);
        }
      } catch (err) {
        console.error("Failed to load profile photo:", err);
      }
    };

    hydratePhoto();
    return () => {
      cancelled = true;
    };
  }, [storageKey, username]);

  useEffect(() => {
    if (initialSrc) setSrc(initialSrc);
  }, [initialSrc]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file?.type?.startsWith("image/")) return;

    let previewUrl = null;

    try {
      if (!username) throw new Error("Missing username (used as userId)");
      setIsUploading(true);

      const blob = await processImageToBlobSquare(file, size);

      previewUrl = URL.createObjectURL(blob);
      setSrc(previewUrl);

      const contentType = "image/jpeg";

      const { uploadUrl, fileUrl } = await api.presignUpload({
        kind: "profile",
        contentType,
        fileSize: blob.size,
        userId: username,
      });

      if (!uploadUrl) throw new Error("Backend did not return uploadUrl");

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);

        xhr.setRequestHeader("Content-Type", contentType);
        xhr.withCredentials = false;

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 204) resolve();
          else {
            console.error("S3 response:", xhr.responseText);
            reject(new Error(`S3 upload failed: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(blob);
      });

      await api.update(username, { main_image: fileUrl });

      const viewUrl = await resolveViewUrl(fileUrl);
      setSrc(viewUrl || fileUrl);
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
