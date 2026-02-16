// src/components/CoverPhoto.jsx
import { useState } from "react";
import EditCoverPhotoButton from "./EditCoverPhotoButton";
import defaultCover from "../assets/DefaultBanner.jpg";
import { api } from "../client";
import { uploadViaPresign } from "../utils/s3Upload";
import { processImageToMaxWidth, isImageFile } from "../utils/imageProcessing";
import { usePresignedImage } from "../hooks/usePresignedImage";

export default function CoverPhoto({
  storageKey = "coverBannerUrl",
  fallbackSrc = defaultCover,
  className = "mt-10",
  objectPosition = "center",
  username,
  initialSrc = "",
}) {
  const { src, setSrc, handleError } = usePresignedImage(
    storageKey,
    initialSrc,
    fallbackSrc
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (file) => {
    if (!isImageFile(file)) return;

    let previewUrl = null;

    try {
      if (!username) throw new Error("Missing username (used as userId)");
      setIsUploading(true);

      const blob = await processImageToMaxWidth(file, 1100);

      previewUrl = URL.createObjectURL(blob);
      setSrc(previewUrl);

      const { fileUrl, viewUrl } = await uploadViaPresign({
        kind: "cover",
        contentType: "image/jpeg",
        file: blob,
        userId: username,
      });

      await api.update(username, { concert_image: fileUrl });

      setSrc(viewUrl);
      localStorage.setItem(storageKey, fileUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      alert(`Upload failed: ${error.message}`);
      setSrc(localStorage.getItem(storageKey) || fallbackSrc);
    } finally {
      setIsUploading(false);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
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
          onError={handleError}
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
          <EditCoverPhotoButton
            onSelect={handleFileSelect}
            disabled={isUploading}
          />
        </div>
      </div>
    </div>
  );
}