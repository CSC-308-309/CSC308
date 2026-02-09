import React, { useState } from "react";
import ConcertIcon from "../../assets/concert.svg";

export default function NewMusicClip({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  if (!isOpen) return null;

  const generateVideoThumbnail = (videoFile) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      video.src = URL.createObjectURL(videoFile);
      video.muted = true;

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1, video.duration / 2);
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            const url = URL.createObjectURL(blob);
            resolve(url);
            URL.revokeObjectURL(video.src);
          },
          "image/jpeg",
          0.8,
        );
      };
    });
  };

  const handleSubmit = async () => {
    if (!title.trim() || !file) return;

    let fileThumbnail = null;

    if (file.type.includes("video")) {
      fileThumbnail = await generateVideoThumbnail(file);
    } else if (file.type.includes("audio")) {
      fileThumbnail = ConcertIcon;
    }

    onSave({ title, file, fileThumbnail });

    setTitle("");
    setFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Upload Music Clip
        </h3>

        {/* Title */}
        <input
          type="text"
          placeholder="Clip title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-md p-2 text-sm mb-4"
        />

        {/* File Upload */}
        <label className="text-sm text-gray-600 mb-1 block">
          Audio or Video File <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          accept="audio/*, video/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full text-sm mb-4"
        />

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600"
            onClick={handleSubmit}
          >
            Save Clip
          </button>
        </div>
      </div>
    </div>
  );
}
