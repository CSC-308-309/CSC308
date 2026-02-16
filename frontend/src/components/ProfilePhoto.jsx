// src/components/ProfilePhoto.jsx
import { useRef, useState } from "react";
import defaultPhoto from "../assets/DefaultProfilePhoto.png";
import { api } from "../client";
import { uploadViaPresign } from "../utils/s3Upload";
import { processImageToSquare, isImageFile } from "../utils/imageProcessing";
import { usePresignedImage } from "../hooks/usePresignedImage";

export default function EditableProfilePhoto({
  storageKey = "profilePhotoUrl",
  fallbackSrc = defaultPhoto,
  size = 136,
  username,
  initialSrc = "",
}) {
  const uploadSize = Math.max(size * 2, 512);
  const inputRef = useRef(null);
  const { src, setSrc, handleError } = usePresignedImage(
    storageKey,
    initialSrc,
    fallbackSrc
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!isImageFile(file)) return;

    let previewUrl = null;

    try {
      if (!username) throw new Error("Missing username (used as userId)");
      setIsUploading(true);

      const blob = await processImageToSquare(file, uploadSize);

      previewUrl = URL.createObjectURL(blob);
      setSrc(previewUrl);

      const { fileUrl, viewUrl } = await uploadViaPresign({
        kind: "profile",
        contentType: "image/jpeg",
        file: blob,
        userId: username,
      });

      await api.update(username, { main_image: fileUrl });

      setSrc(viewUrl);
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
          onError={handleError}
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