import React, { useState } from "react";

export default function NewConcertMemory({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const generateThumbnail = (videoFile) => {
    return new Promise((resolve) => {
      const videoElement = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      videoElement.preload = 'metadata';
      videoElement.src = URL.createObjectURL(videoFile);
      
      videoElement.onloadedmetadata = () => {
        // Seek to 1 second into the video (or 0 if video is shorter)
        videoElement.currentTime = Math.min(1, videoElement.duration / 2);
      };
      
      videoElement.onseeked = () => {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(videoElement.src);
          resolve(URL.createObjectURL(blob));
        }, 'image/jpeg', 0.8);
      };
    });
  };

  const handleSubmit = async () => {
    setSubmitted(true);

    if (!title.trim() || !video) return;

    // Generate thumbnail from video
    const thumbnail = await generateThumbnail(video);

    onSave({ title, description, video, thumbnail });
    setTitle("");
    setDescription("");
    setVideo(null);
    setSubmitted(false);
    onClose();
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
          className={`w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-purple-200 focus:outline-none ${
            submitted && !title.trim()
              ? "border-red-500"
              : "border-gray-300"
          }`}
        />
        {submitted && !title.trim() && (
          <p className="text-xs text-red-500 mt-1">
            Title is required.
          </p>
        )}

        {/* Video Upload */}
        <label className="text-sm text-gray-700 mb-1 block mt-4">
          Upload Video <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideo(e.target.files[0])}
          className={`w-full text-sm ${
            submitted && !video ? "border rounded-md border-red-500" : ""
          }`}
        />
        {submitted && !video && (
          <p className="text-xs text-red-500 mt-1">
            Please upload a video.
          </p>
        )}

        {/* Description */}
        <label className="text-sm text-gray-700 mb-1 block mt-4">
          Description
        </label>
        <textarea
          placeholder="Write something about this concert..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`w-full border rounded-md p-2 text-sm h-20 transition-colors focus:ring-2 focus:ring-purple-200 focus:outline-none
            ${description ? "border-purple-500" : "border-gray-300"}
          `}
        />

        <div className="flex justify-end gap-3 mt-6">
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
            Create New Concert Memory
          </button>
        </div>
      </div>
    </div>
  );
}