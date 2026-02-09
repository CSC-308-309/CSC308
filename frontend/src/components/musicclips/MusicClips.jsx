import React, { useState } from "react";
import { Star, Plus } from "lucide-react";
import NewMusicClip from "./NewMusicClip";
import MusicClipDetail from "./MusicClipDetail";

export default function MusicClips() {
  const [clips, setClips] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClip, setSelectedClip] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const toggleStar = (id) => {
    setClips(
      clips.map((clip) =>
        clip.id === id ? { ...clip, starred: !clip.starred } : clip,
      ),
    );
  };

  const handleSaveClip = (clipData) => {
    const newClip = {
      id: Date.now(),
      title: clipData.title,
      description: clipData.description,
      audio: clipData.file.type.includes("audio") ? clipData.file : null,
      video: clipData.file.type.includes("video") ? clipData.file : null,
      type: clipData.file.type.includes("audio") ? "audio" : "video",
      starred: false,
      thumbnail: clipData.fileThumbnail,
    };

    setClips([newClip, ...clips]);
    setIsModalOpen(false);
  };

  const handleClipClick = (clip) => {
    setSelectedClip(clip);
    setIsDetailOpen(true);
  };

  const getDisplayClips = () => {
    // If no clips, show empty
    if (clips.length === 0) {
      return [];
    }

    // Prioritize starred clips
    const starred = clips.filter((c) => c.starred);

    if (starred.length > 0) {
      return starred.slice(0, 3);
    }

    // Show the most recent 3 clips
    return clips.slice(0, 3);
  };

  const displayClips = getDisplayClips();

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Music Clips</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Display Clips */}
        {displayClips.map((clip) => (
          <div key={clip.id} className="flex flex-col items-start">
            <div
              className="bg-purple-100 rounded-xl relative cursor-pointer hover:brightness-90 transition-all w-[180px] h-[180px] flex items-center justify-center overflow-hidden"
              onClick={() => handleClipClick(clip)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStar(clip.id);
                }}
                className="absolute top-3 right-3 z-10"
              >
                <Star
                  size={20}
                  className={`${
                    clip.starred
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-400"
                  } hover:text-yellow-500 transition-colors`}
                />
              </button>

              {/* Preview */}
              {clip.type === "audio" ? (
                <div className="text-gray-700 font-semibold">🎵 Audio</div>
              ) : (
                <img
                  src={clip.thumbnail}
                  alt={clip.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <h3 className="font-semibold text-gray-800 text-sm mt-2">
              {clip.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Updated today</p>
          </div>
        ))}

        {/* Add New Button */}
        <div className="flex flex-col items-start">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#CCC2DC] rounded-xl p-4 hover:bg-[#A488D1] transition-colors flex items-center justify-center min-h-[180px] w-[180px] group"
          >
            <Plus
              size={32}
              className="text-[#1D1B20] group-hover:text-[#1D1B20]"
            />
          </button>
          <p className="text-sm font-semibold text-gray-800 mt-2 text-left">
            New
          </p>
        </div>
      </div>

      <NewMusicClip
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClip}
      />

      <MusicClipDetail
        clip={selectedClip}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        allClips={clips}
        onToggleStar={toggleStar}
      />
    </div>
  );
}
