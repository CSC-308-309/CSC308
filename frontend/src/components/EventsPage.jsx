import React, { useState } from 'react';
import { Search, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

// EventCard Component
const EventCard = ({ image, date, title, location }) => {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="bg-gray-400 h-48 w-full"></div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-2">{date}</p>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{location}</span>
          </div>
        </div>
      </div>
    );
  };

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-full bg-purple-400 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-500 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <button
        onClick={() => onPageChange(1)}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          currentPage === 1 ? 'bg-purple-400 text-white' : 'bg-purple-200 text-purple-700 hover:bg-purple-300'
        }`}
      >
        1
      </button>
      
      <button
        onClick={() => onPageChange(2)}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          currentPage === 2 ? 'bg-purple-400 text-white' : 'bg-purple-200 text-purple-700 hover:bg-purple-300'
        }`}
      >
        2
      </button>
      
      <span className="text-gray-500 px-2">...</span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-full bg-purple-400 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-500 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

// EventsPage Component (without EventsTitle - that's handled by parent)
export default function EventsPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const events = [
    {
      id: 1,
      date: 'October 29, 2025 - 8:00 PM',
      title: 'Taylor Swift Concert',
      location: 'Sunset Park, Los Angeles, CA'
    },
    {
      id: 2,
      date: 'October 29, 2025 - 8:00 PM',
      title: 'Taylor Swift Concert',
      location: 'Sunset Park, Los Angeles, CA'
    },
    {
      id: 3,
      date: 'October 29, 2025 - 8:00 PM',
      title: 'Taylor Swift Concert',
      location: 'Sunset Park, Los Angeles, CA'
    },
    {
      id: 4,
      date: 'October 29, 2025 - 8:00 PM',
      title: 'Taylor Swift Concert',
      location: 'Sunset Park, Los Angeles, CA'
    },
    {
      id: 5,
      date: 'October 29, 2025 - 8:00 PM',
      title: 'Taylor Swift Concert',
      location: 'Sunset Park, Los Angeles, CA'
    },
    {
      id: 6,
      date: 'October 29, 2025 - 8:00 PM',
      title: 'Taylor Swift Concert',
      location: 'Sunset Park, Los Angeles, CA'
    }
  ];

  return (
    <div className="max-w-[1200px] w-full h-full bg-[#ECE6F0] mx-auto rounded-lg p-6">
      <div className="max-w-7xl mx-auto items-center">
        {/* Header with Tabs and Search */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                activeTab === 'active'
                  ? 'bg-purple-400 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Active (6)
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                activeTab === 'past'
                  ? 'bg-purple-400 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Past (30)
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search event, location, etc"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-10 py-2 rounded-full border-none bg-white shadow-sm w-80 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Event Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={5}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}