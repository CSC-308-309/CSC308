import React, { useState } from "react";
import { Star, Plus } from "lucide-react";
import ConcertIcon from "../assets/concert.svg";
import NewConcertMemory from "./NewConcertMemory";
import ConcertMemoryDetail from "./ConcertMemoryDetail";

export default function ConcertMemories() {
  const [memories, setMemories] = useState([
    {
      id: 1,
      title: "Concert Memories",
      updatedToday: true,
      starred: false,
      thumbnail: ConcertIcon,
      isPlaceholder: true,
    },
    {
      id: 2,
      title: "Concert Memories",
      updatedToday: true,
      starred: false,
      thumbnail: ConcertIcon,
      isPlaceholder: true,
    },
    {
      id: 3,
      title: "Concert Memories",
      updatedToday: true,
      starred: false,
      thumbnail: ConcertIcon,
      isPlaceholder: true,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const toggleStar = (id) => {
    setMemories(
      memories.map((memory) =>
        memory.id === id ? { ...memory, starred: !memory.starred } : memory,
      ),
    );
  };

  const handleNewClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveMemory = (memoryData) => {
    const firstPlaceholderIndex = memories.findIndex((m) => m.isPlaceholder);

    if (firstPlaceholderIndex !== -1) {
      const updatedMemories = [...memories];
      updatedMemories[firstPlaceholderIndex] = {
        id: memories[firstPlaceholderIndex].id,
        title: memoryData.title,
        description: memoryData.description, // Add description
        video: memoryData.video, // Store the video file
        updatedToday: true,
        starred: false,
        thumbnail: memoryData.thumbnail,
        isPlaceholder: false,
      };
      setMemories(updatedMemories);
    }

    setIsModalOpen(false);
  };

  const handleMemoryClick = (memory) => {
    setSelectedMemory(memory);
    setShowDetail(true);
  };

  const getDisplayMemories = () => {
    const realMemories = memories.filter((m) => !m.isPlaceholder);

    // If no real memories -> show placeholders
    if (realMemories.length === 0) {
      return memories.filter((m) => m.isPlaceholder).slice(0, 3);
    }

    // If real memories exist -> prioritize starred
    const starred = realMemories.filter((m) => m.starred);

    if (starred.length > 0) {
      return starred.slice(0, 3);
    }

    // Show the most recent 3 real memories (if more than 3 exist)
    return realMemories.slice(-3);
  };

  const displayMemories = getDisplayMemories();

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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStar(memory.id);
                }}
                className="absolute top-3 right-3 z-10"
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

              <img
                src={memory.thumbnail}
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
