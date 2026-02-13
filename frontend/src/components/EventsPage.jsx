import React, { useState, useEffect } from "react";
import { api } from "../client";
import { Search, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

// EventCard Component
const EventCard = ({ date, title, location }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gray-400 aspect-[6/3] w-full rounded-t-lg"></div>
      <div className="p-2">
        <p className="text-xs text-gray-600 mb-1">{date}</p>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
        <div className="flex items-center text-gray-600 text-xs">
          <MapPin className="w-3 h-3 mr-1" />
          <span>{location}</span>
        </div>
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center gap-2 m-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-full bg-purple-400 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-500 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Show first page */}
      {currentPage > 3 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-purple-200 text-purple-700 hover:bg-purple-300"
          >
            1
          </button>
          <span className="text-gray-500 px-2">...</span>
        </>
      )}

      {/* Show previous page if exists */}
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-purple-200 text-purple-700 hover:bg-purple-300"
        >
          {currentPage - 1}
        </button>
      )}

      {/* Current page */}
      <button className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-purple-400 text-white">
        {currentPage}
      </button>

      {/* Show next page if exists */}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-purple-200 text-purple-700 hover:bg-purple-300"
        >
          {currentPage + 1}
        </button>
      )}

      {/* Show last page */}
      {currentPage < totalPages - 2 && (
        <>
          <span className="text-gray-500 px-2">...</span>
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-purple-200 text-purple-700 hover:bg-purple-300"
          >
            {totalPages}
          </button>
        </>
      )}

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
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [events, setEvents] = useState([]);

  // Fetch events from backend
  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await api.listEvents();
        setEvents(data || []);
      } catch (err) {
        console.error("Failed to load events:", err);
      }
    }

    loadEvents();
  }, []);

  /* const events = [
    {
      id: 1,
      date: "October 29, 2025 - 8:00 PM",
      title: "Taylor Swift Concert",
      location: "Sunset Park, Los Angeles, CA",
    },
    {
      id: 2,
      date: "October 29, 2025 - 8:00 PM",
      title: "Taylor Swift Concert",
      location: "Sunset Park, Los Angeles, CA",
    },
    {
      id: 3,
      date: "October 29, 2025 - 8:00 PM",
      title: "Taylor Swift Concert",
      location: "Sunset Park, Los Angeles, CA",
    },
    {
      id: 4,
      date: "October 29, 2025 - 8:00 PM",
      title: "Taylor Swift Concert",
      location: "Sunset Park, Los Angeles, CA",
    },
    {
      id: 5,
      date: "October 29, 2025 - 8:00 PM",
      title: "Taylor Swift Concert",
      location: "Sunset Park, Los Angeles, CA",
    },
    {
      id: 6,
      date: 'October 29, 2025 - 8:00 PM',
      title: 'Taylor Swift Concert',
      location: 'Sunset Park, Los Angeles, CA'
    }
  ]; */

  return (
    <div className="max-w-[1200px] bg-[#ECE6F0] mx-auto rounded-lg p-2 mb-4 m-4 sm: p-6 md:p-8 flex flex-col">
      <div className="flex-shrink-0">
        {/* Header with Tabs and Search */}
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-4 mb-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                activeTab === "active"
                  ? "bg-purple-400 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Active (6)
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                activeTab === "past"
                  ? "bg-purple-400 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
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
              className="pl-3 pr-10 py-1.5 rounded-full border-none bg-white shadow-sm w-80 focus:outline-none focus:ring-2 focus:ring-purple-300"
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
