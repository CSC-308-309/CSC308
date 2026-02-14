// src/components/musicclips/NewMusicClip.jsx
import React, { useState } from "react";
import ConcertIcon from "../../assets/concert.svg";
import { uploadViaPresign } from "../../utils/s3Upload";

export default function NewMusicClip({ isOpen, onClose, onSave, username }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const generateVideoThumbnailBlob = (videoFile) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const objectUrl = URL.createObjectURL(videoFile);
      video.src = objectUrl;
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        const target = Math.min(1, video.duration ? video.duration / 2 : 1);
        video.currentTime = target;
      };

      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to load video for thumbnail"));
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob)
              return reject(new Error("Failed to create thumbnail blob"));
            resolve(blob);
          },
          "image/jpeg",
          0.8,
        );
      };
    });
  };

  const resetAndClose = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !file) return;

    try {
      if (!username) throw new Error("Missing username (used as userId)");
      setIsUploading(true);

      const main = await uploadViaPresign({
        kind: "video",
        file,
        userId: username,
      });

      let thumb = { fileUrl: "", viewUrl: "" };

      if (file.type.includes("video")) {
        const thumbBlob = await generateVideoThumbnailBlob(file);
        const thumbFile = new File([thumbBlob], "thumb.jpg", {
          type: "image/jpeg",
        });

        thumb = await uploadViaPresign({
          kind: "videoThumb",
          file: thumbFile,
          userId: username,
        });
      } else if (file.type.includes("audio")) {
        thumb = { fileUrl: "", viewUrl: ConcertIcon };
      }

      onSave({
        title: title.trim(),
        description: description.trim(),
        type: file.type.includes("audio") ? "audio" : "video",
        mediaUrl: main.fileUrl,
        mediaViewUrl: main.viewUrl, // best-effort presigned
        thumbnailUrl: thumb.fileUrl || "",
        thumbnailViewUrl: thumb.viewUrl || ConcertIcon,
      });

      resetAndClose();
    } catch (e) {
      console.error(e);
      alert(e.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[420px] shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Upload Music Clip
        </h3>

        {/* Title */}
        <input
          type="text"
          placeholder="Clip title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-md p-2 text-sm mb-3"
          disabled={isUploading}
        />

        {/* Optional Description */}
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded-md p-2 text-sm mb-4 resize-none"
          rows={3}
          disabled={isUploading}
        />

        {/* File Upload */}
        <label className="text-sm text-gray-600 mb-1 block">
          Audio or Video File <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          accept="audio/*, video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm mb-4"
          disabled={isUploading}
        />

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            onClick={resetAndClose}
            disabled={isUploading}
            type="button"
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600"
            onClick={handleSubmit}
            disabled={isUploading}
            type="button"
          >
            {isUploading ? "Uploading..." : "Save Clip"}
          </button>
        </div>
      </div>
    </div>
  );
}
