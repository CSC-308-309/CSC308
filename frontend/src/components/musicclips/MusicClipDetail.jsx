import React, { useState } from 'react';
import { X, ArrowLeft, Star } from 'lucide-react';

export default function MusicClipDetail({ clip, isOpen, onClose, allClips, onToggleStar }) {
  const [selectedClip, setSelectedClip] = useState(clip);
  const [showDetail, setShowDetail] = useState(false);

  if (!isOpen) return null;

  const handleClipClick = (clipItem) => {
    setSelectedClip(clipItem);
    setShowDetail(true);
  };

  const handleToggleStar = (clipId, e) => {
    e.stopPropagation();
    onToggleStar(clipId);

    if (selectedClip && selectedClip.id === clipId) {
      setSelectedClip({
        ...selectedClip,
        starred: !selectedClip.starred
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      {!showDetail ? (
        // Grid view of all clips
        <div className="bg-white rounded-xl w-[90%] max-w-5xl h-[85vh] overflow-hidden flex flex-col p-6">
          <div className="relative mb-6">
            <button
              onClick={onClose}
              className="absolute top-0 right-0 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 pr-10">Music Clips</h2>
            <p className="text-sm text-gray-500 mt-1">
              Add or explore your favorite music clips!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto">
            {allClips.filter(c => !c.isPlaceholder).map((clipItem) => (
              <div
                key={clipItem.id}
                className="cursor-pointer transition-all hover:brightness-75"
                onClick={() => handleClipClick(clipItem)}
              >
                <div className="bg-purple-100 rounded-xl w-full aspect-square overflow-hidden relative">
                  {/* Star Button */}
                  <button
                    onClick={(e) => handleToggleStar(clipItem.id, e)}
                    className="absolute top-3 right-3 z-10"
                  >
                    <Star
                      size={20}
                      className={`${
                        clipItem.starred
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-400'
                      } hover:text-yellow-500 transition-colors`}
                    />
                  </button>
                  
                  {clipItem.type === 'audio' ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 font-semibold">
                      🎵 Audio
                    </div>
                  ) : (
                    <img
                      src={clipItem.thumbnail}
                      alt={clipItem.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <h3 className="font-semibold text-gray-800 text-sm mt-2">{clipItem.title}</h3>
                <p className="text-xs text-gray-500">Updated today</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Detail view with media player
        <div className="bg-white rounded-xl w-[90%] max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <button
              onClick={() => setShowDetail(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-3">
              {/* Star Button in Detail View */}
              <button
                onClick={(e) => handleToggleStar(selectedClip.id, e)}
                className="text-gray-500 hover:text-yellow-500"
              >
                <Star
                  size={24}
                  className={`${
                    selectedClip.starred
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-gray-400'
                  } transition-colors`}
                />
              </button>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Media Section */}
            <div className="flex-1 bg-black flex flex-col items-center justify-center p-8">
              {selectedClip.video ? (
                <video
                  controls
                  className="max-w-full max-h-full"
                  src={URL.createObjectURL(selectedClip.video)}
                >
                  Your browser does not support the video tag.
                </video>
              ) : selectedClip.audio ? (
                <div className="w-full max-w-2xl">
                  <div className="bg-gray-900 rounded-lg p-8 mb-6">
                    <div className="text-center mb-6">
                      <div className="text-6xl mb-4">🎵</div>
                      <h3 className="text-white text-xl font-semibold">{selectedClip.title}</h3>
                      {selectedClip.description && (
                        <p className="text-gray-400 text-sm mt-2">{selectedClip.description}</p>
                      )}
                    </div>
                  </div>
                  <audio
                    controls
                    className="w-full"
                    src={URL.createObjectURL(selectedClip.audio)}
                  >
                    Your browser does not support the audio tag.
                  </audio>
                </div>
              ) : (
                <img
                  src={selectedClip.thumbnail}
                  alt={selectedClip.title}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}