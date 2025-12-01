import React, { useState } from 'react';
import { Star, Plus } from 'lucide-react';

export default function ConcertMemories() {
  const [memories, setMemories] = useState([
    { id: 1, title: 'Concert Memories', updatedToday: true, starred: false },
    { id: 2, title: 'Concert Memories', updatedToday: true, starred: false },
    { id: 3, title: 'Concert Memories', updatedToday: true, starred: false },
  ]);

  const toggleStar = (id) => {
    setMemories(memories.map(memory => 
      memory.id === id ? { ...memory, starred: !memory.starred } : memory
    ));
  };

  const addNewMemory = () => {
    const newId = Math.max(...memories.map(m => m.id), 0) + 1;
    setMemories([...memories, {
      id: newId,
      title: 'Concert Memories',
      updatedToday: true,
      starred: false
    }]);
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Concert Memories</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {memories.map((memory) => (
          <div
            key={memory.id}
            className="bg-purple-100 rounded-xl p-4 relative hover:shadow-md transition-shadow cursor-pointer"
          >
            {/* Star button */}
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
                    ? 'fill-purple-500 text-purple-500'
                    : 'text-gray-400'
                } hover:text-purple-500 transition-colors`}
              />
            </button>

            {/* Placeholder icons */}
            <div className="space-y-3 mt-6">
              <div className="w-12 h-12 bg-purple-200 rounded-full opacity-60" />
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-purple-200 rounded opacity-60" />
                <div className="w-8 h-8 bg-purple-200 rounded opacity-60" />
              </div>
            </div>

            {/* Title and date */}
            <div className="mt-8">
              <h3 className="font-semibold text-gray-800 text-sm">
                {memory.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Updated today
              </p>
            </div>
          </div>
        ))}

        {/* Add new card */}
        <button
          onClick={addNewMemory}
          className="bg-purple-100 rounded-xl p-4 hover:bg-purple-200 transition-colors flex items-center justify-center min-h-[180px] group"
        >
          <div className="text-center">
            <Plus size={32} className="mx-auto text-purple-400 group-hover:text-purple-600 transition-colors" />
            <p className="text-sm font-medium text-gray-600 mt-2">New</p>
          </div>
        </button>
      </div>
    </div>
  );
}