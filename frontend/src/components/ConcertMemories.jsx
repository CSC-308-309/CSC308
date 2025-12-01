import React, { useState } from 'react';
import { Star, Plus } from 'lucide-react';
import ConcertIcon from '../assets/concert.svg';

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
          <div key={memory.id} className="flex flex-col items-start">

      <div
        className="bg-purple-100 rounded-xl relative hover:shadow-md transition-shadow cursor-pointer w-[180px] h-[180px] flex items-center justify-center overflow-hidden"
        onClick={() => console.log("Open memory", memory.id)}
      >
        {/* Star Button */}
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
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-gray-400'
            } hover:text-yellow-500 transition-colors`}
          />
        </button>

        {/* FULL SIZE ICON */}
        <img
          src={ConcertIcon}
          alt="Memory"
          className="w-full h-full object-cover opacity-90"
        />
      </div>

            {/* Title + Date */}
            <h3 className="font-semibold text-gray-800 text-sm mt-2">
              {memory.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Updated today
            </p>
          </div>
        ))}

        {/* Add New */}
        <div className="flex flex-col items-start">
          <button
            onClick={addNewMemory}
            className="bg-[#CCC2DC] rounded-xl p-4 hover:bg-[#A488D1] transition-colors flex items-center justify-center min-h-[180px] w-[180px] group"
          >
            <Plus size={32} className="text-[#1D1B20] group-hover:text-[#1D1B20] transition-colors" />
          </button>
          <p className="text-sm font-medium text-gray-600 mt-2 text-left">New</p>
        </div>

      </div>
    </div>
  );
}
