// src/components/NewConcertMemory.jsx
import React, { useState } from "react";
import ConcertIcon from "../assets/concert.svg";
import { useMediaUpload } from "../hooks/useMediaUpload";

export default function NewConcertMemory({ isOpen, onClose, onSave, username }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  
  const { uploadMedia, isUploading } = useMediaUpload(username, ConcertIcon);

  if (!isOpen) return null;

  const resetAndClose = () => {
    setTitle("");
    setDescription("");
    setVideo(null);
    setSubmitted(false);
    onClose();
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!title.trim() || !video) return;

    try {
      const uploadResult = await uploadMedia({ file: video, kind: "video" });

      onSave({
        title: title.trim(),
        description: description.trim(),
        ...uploadResult,
      });

      resetAndClose();
    } catch (e) {
      console.error(e);
      alert(e.message || "Upload failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Add New Concert Memory
        </h3>

        {/* Title */}
        <label className="text-sm text-gray-700 mb-1 block">
          Concert Memory Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Ex: Taylor Swift Eras Tour"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isUploading}
          className={`w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-purple-200 focus:outline-none ${
            submitted && !title.trim() ? "border-red-500" : "border-gray-300"
          }`}
        />
        {submitted && !title.trim() && (
          <p className="text-xs text-red-500 mt-1">Title is required.</p>
        )}

        {/* Video Upload */}
        <label className="text-sm text-gray-700 mb-1 block mt-4">
          Upload Video <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideo(e.target.files?.[0] || null)}
          disabled={isUploading}
          className={`w-full text-sm ${
            submitted && !video ? "border rounded-md border-red-500" : ""
          }`}
        />
        {submitted && !video && (
          <p className="text-xs text-red-500 mt-1">Please upload a video.</p>
        )}

        {/* Description */}
        <label className="text-sm text-gray-700 mb-1 block mt-4">
          Description
        </label>
        <textarea
          placeholder="Write something about this concert..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isUploading}
          className={`w-full border rounded-md p-2 text-sm h-20 transition-colors focus:ring-2 focus:ring-purple-200 focus:outline-none
            ${description ? "border-purple-500" : "border-gray-300"}
          `}
        />

        <div className="flex justify-end gap-3 mt-6">
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
            {isUploading ? "Uploading..." : "Create New Concert Memory"}
          </button>
        </div>
      </div>
    </div>
  );
}