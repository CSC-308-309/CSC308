// src/components/ConcertMemories.jsx
import React, { useMemo, useState } from "react";
import { Star, Plus } from "lucide-react";
import ConcertIcon from "../assets/concert.svg";
import NewConcertMemory from "./NewConcertMemory";
import ConcertMemoryDetail from "./ConcertMemoryDetail";

export default function ConcertMemories({ username }) {
  const [memories, setMemories] = useState([
    {
      id: 1,
      title: "Concert Memories",
      updatedToday: true,
      starred: false,
      thumbnailViewUrl: ConcertIcon,
      isPlaceholder: true,
    },
    {
      id: 2,
      title: "Concert Memories",
      updatedToday: true,
      starred: false,
      thumbnailViewUrl: ConcertIcon,
      isPlaceholder: true,
    },
    {
      id: 3,
      title: "Concert Memories",
      updatedToday: true,
      starred: false,
      thumbnailViewUrl: ConcertIcon,
      isPlaceholder: true,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const toggleStar = (id) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m)),
    );
  };

  const handleNewClick = () => {
    if (!username) {
      alert("You must be logged in to upload a concert memory.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveMemory = (memoryData) => {
    const firstPlaceholderIndex = memories.findIndex((m) => m.isPlaceholder);

    const newMemory = {
      id: firstPlaceholderIndex !== -1 ? memories[firstPlaceholderIndex].id : Date.now(),
      title: memoryData.title,
      description: memoryData.description || "",
      type: "video",
      updatedToday: true,
      starred: false,
      isPlaceholder: false,

      mediaUrl: memoryData.mediaUrl,
      mediaViewUrl: memoryData.mediaViewUrl,

      thumbnailUrl: memoryData.thumbnailUrl || "",
      thumbnailViewUrl: memoryData.thumbnailViewUrl || ConcertIcon,
    };

    setMemories((prev) => {
      if (firstPlaceholderIndex !== -1) {
        const copy = [...prev];
        copy[firstPlaceholderIndex] = newMemory;
        return copy;
      }
      return [newMemory, ...prev];
    });

    setIsModalOpen(false);
  };

  const handleMemoryClick = (memory) => {
    setSelectedMemory(memory);
    setShowDetail(true);
  };

  const displayMemories = useMemo(() => {
    const real = memories.filter((m) => !m.isPlaceholder);

    if (real.length === 0) {
      return memories.filter((m) => m.isPlaceholder).slice(0, 3);
    }

    const starred = real.filter((m) => m.starred);
    if (starred.length > 0) return starred.slice(0, 3);

    return real.slice(-3);
  }, [memories]);

  return (
    <div className="max-w-4xl mx-auto bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Concert Memories</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {displayMemories.map((memory) => (
          <div key={memory.id} className="flex flex-col items-start">
            <div
              className="bg-purple-100 rounded-xl relative hover:shadow-md transition-shadow cursor-pointer w-[180px] h-[180px] flex items-center justify-center overflow-hidden"
              onClick={() => handleMemoryClick(memory)}
            >
              {!memory.isPlaceholder && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(memory.id);
                  }}
                  className="absolute top-3 right-3 z-10"
                  type="button"
                >
                  <Star
                    size={20}
                    className={`${
                      memory.starred
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-gray-400"
                    } hover:text-yellow-500 transition-colors`}
                  />
                </button>
              )}

              <img
                src={
                  memory.thumbnailViewUrl ||
                  memory.thumbnailUrl ||
                  ConcertIcon
                }
                alt="Memory"
                className="w-full h-full object-cover opacity-90"
              />
            </div>

            <h3 className="font-semibold text-gray-800 text-sm mt-2">
              {memory.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Updated today</p>
          </div>
        ))}

        <div className="flex flex-col items-start">
          <button
            onClick={handleNewClick}
            className="bg-[#CCC2DC] rounded-xl p-4 hover:bg-[#A488D1] transition-colors flex items-center justify-center min-h-[180px] w-[180px] group"
            type="button"
          >
            <Plus
              size={32}
              className="text-[#1D1B20] group-hover:text-[#1D1B20] transition-colors"
            />
          </button>
          <p className="text-sm font-semibold text-gray-800 mt-2 text-left">
            New
          </p>
        </div>

        <NewConcertMemory
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveMemory}
          username={username}
        />

        <ConcertMemoryDetail
          memory={selectedMemory}
          isOpen={showDetail}
          onClose={() => setShowDetail(false)}
          allMemories={memories}
          onToggleStar={toggleStar}
        />
      </div>
    </div>
  );
}
