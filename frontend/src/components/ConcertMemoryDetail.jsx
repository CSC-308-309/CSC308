// src/components/ConcertMemoryDetail.jsx
import React, { useEffect, useState } from "react";
import { X, Heart, ArrowLeft, Star } from "lucide-react";
import { usePresignedUrl } from "../hooks/usePresignedUrl";

export default function ConcertMemoryDetail({
  memory,
  isOpen,
  onClose,
  allMemories,
  onToggleStar,
}) {
  const [selectedMemory, setSelectedMemory] = useState(memory);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      user: "eliska",
      text: "what an amazing concert!",
      time: "2h ago",
      avatar: "👤",
    },
  ]);

  const mediaKey = selectedMemory?.mediaUrl || selectedMemory?.videoUrl || "";
  
  const playUrl = usePresignedUrl(mediaKey, showComments && !!mediaKey);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedMemory(memory);
    setShowComments(false);
  }, [isOpen, memory]);

  if (!isOpen) return null;

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    setComments((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        user: "You",
        text: newComment,
        time: "Just now",
        avatar: "👤",
      },
    ]);
    setNewComment("");
  };

  const handleMemoryClick = (mem) => {
    setSelectedMemory(mem);
    setShowComments(true);
  };

  const handleToggleStar = (memoryId, e) => {
    e.stopPropagation();
    onToggleStar(memoryId);

    if (selectedMemory && selectedMemory.id === memoryId) {
      setSelectedMemory({
        ...selectedMemory,
        starred: !selectedMemory.starred,
      });
    }
  };

  const renderThumbSrc = (mem) => {
    return mem.thumbnailViewUrl || mem.thumbnailUrl || mem.thumbnail || "";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      {!showComments ? (
        <div className="bg-white rounded-xl w-[90%] max-w-5xl h-[85vh] overflow-hidden flex flex-col p-6">
          <div className="relative mb-6">
            <button
              onClick={onClose}
              className="absolute top-0 right-0 text-gray-500 hover:text-gray-700"
              type="button"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 pr-10">
              Concert Memories
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Start adding your favorite concert moments!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto">
            {allMemories
              .filter((m) => !m.isPlaceholder)
              .map((mem) => (
                <div
                  key={mem.id}
                  className="cursor-pointer transition-all hover:brightness-75"
                  onClick={() => handleMemoryClick(mem)}
                >
                  <div className="bg-purple-100 rounded-xl w-full aspect-square overflow-hidden relative">
                    <button
                      onClick={(e) => handleToggleStar(mem.id, e)}
                      className="absolute top-3 right-3 z-10"
                      type="button"
                    >
                      <Star
                        size={20}
                        className={`${
                          mem.starred
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-gray-400"
                        } hover:text-yellow-500 transition-colors`}
                      />
                    </button>

                    <img
                      src={renderThumbSrc(mem)}
                      alt={mem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm mt-2">
                    {mem.title}
                  </h3>
                  <p className="text-xs text-gray-500">Updated today</p>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl w-[90%] max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <button
              onClick={() => setShowComments(false)}
              className="text-gray-500 hover:text-gray-700"
              type="button"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => handleToggleStar(selectedMemory.id, e)}
                className="text-gray-500 hover:text-yellow-500"
                type="button"
              >
                <Star
                  size={24}
                  className={`${
                    selectedMemory.starred
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-400"
                  } transition-colors`}
                />
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
                type="button"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Video Section */}
            <div className="flex-1 bg-black flex items-center justify-center p-4">
              {mediaKey ? (
                playUrl ? (
                  <video controls className="max-w-full max-h-full" src={playUrl}>
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="text-white/80 text-sm">Loading...</div>
                )
              ) : (
                <img
                  src={renderThumbSrc(selectedMemory)}
                  alt={selectedMemory.title}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            {/* Comments Section */}
            <div className="w-96 border-l flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
                    👤
                  </div>
                  <div>
                    <p className="font-semibold text-sm">eliska</p>
                    <p className="text-xs text-gray-500">Online</p>
                  </div>
                  <Heart size={20} className="ml-auto text-red-500 fill-red-500" />
                </div>
                <p className="mt-3 text-sm">{selectedMemory.title}</p>
                {selectedMemory.description && (
                  <p className="mt-2 text-xs text-gray-600">
                    {selectedMemory.description}
                  </p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-sm flex-shrink-0">
                      {comment.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm">
                          {comment.user}
                        </span>
                        <span className="text-xs text-gray-500">
                          {comment.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-purple-500 text-white rounded-full text-sm hover:bg-purple-600"
                    type="button"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}