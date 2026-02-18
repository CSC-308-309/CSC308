import { useState } from "react";
import { Heart, ChevronDown } from "lucide-react";
// import CustomDropdown from './CustomDropdown';

export default function FriendsBar() {
  const [selectedCategory, setSelectedCategory] = useState("Concert Buddies");

  const categories = ["Concert Buddies", "Musicians"];

  // Define all people organized by categories
  const [allPeople, setAllPeople] = useState([
    { id: 1, name: "Marco", isFavorite: true, category: "Concert Buddies" },
    { id: 2, name: "Jacob", isFavorite: false, category: "Concert Buddies" },
    { id: 3, name: "Jennifer", isFavorite: false, category: "Concert Buddies" },
    { id: 4, name: "Jazzy", isFavorite: true, category: "Concert Buddies" },
    { id: 5, name: "Abeyah", isFavorite: false, category: "Concert Buddies" },
    { id: 6, name: "Yaneli", isFavorite: false, category: "Concert Buddies" },

    { id: 7, name: "Sarah", isFavorite: true, category: "Musicians" },
    { id: 8, name: "Mike", isFavorite: true, category: "Musicians" },
    { id: 9, name: "Emma", isFavorite: false, category: "Musicians" },
    { id: 10, name: "Alex", isFavorite: true, category: "Musicians" },
  ]);

  // Toggle favorite status
  const toggleFavorite = (personId) => {
    setAllPeople((prevPeople) =>
      prevPeople.map((person) =>
        person.id === personId
          ? { ...person, isFavorite: !person.isFavorite }
          : person,
      ),
    );
  };

  // Filter people based on selected category
  const displayedPeople = allPeople.filter(
    (person) => person.category === selectedCategory,
  );

  return (
    <div className="flex flex-col w-[280px] h-screen bg-gray-100 p-4">
      {/* Custom Dropdown */}
      <div className="mb-6 flex justify-center">
        <CustomDropdown
          options={categories}
          value={selectedCategory}
          onChange={setSelectedCategory}
        />
      </div>

      {/* Friends Grid */}
      <div className="grid grid-cols-2 gap-6 p-[20px]">
        {displayedPeople.map((friend) => (
          <FriendCard
            key={friend.id}
            friend={friend}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}

// CustomDropdown component
function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-[255px] h-8 items-center justify-between px-[15px] py-1.5 bg-white rounded-[20px] border border-[#a376a2]"
      >
        <ChevronDown
          className={`w-[15px] h-[15px] text-[#a376a2] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
        <span
          className="text-[#7e5179] font-medium text-sm"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          {value || placeholder}
        </span>
        <div className="w-[15px]"></div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border-2 border-purple-200 overflow-hidden z-10">
          {options.map((option, index) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`w-full px-6 py-4 text-left hover:bg-purple-50 transition-colors duration-150 ${
                option === value
                  ? "bg-purple-100 text-purple-700 font-semibold"
                  : "text-gray-700"
              } ${index !== options.length - 1 ? "border-b border-gray-100" : ""}`}
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FriendCard({ friend, onToggleFavorite }) {
  return (
    <div className="flex flex-col items-center">
      {/* Box with heart positioned relative to it */}
      <div className="relative w-[83px] h-[83px] bg-[#d9d9d9] rounded-[15px] mb-2">
        <button
          onClick={() => onToggleFavorite(friend.id)}
          className="absolute -bottom-2 -right-2 w-6 h-6 hover:scale-110 transition-transform cursor-pointer"
        >
          <Heart
            className={`w-6 h-6 drop-shadow-md transition-all ${
              friend.isFavorite
                ? "text-red-500 fill-red-500"
                : "text-gray-400 fill-none hover:text-gray-500"
            }`}
          />
        </button>
      </div>

      {/* Name below box */}
      <p className="text-sm font-medium text-gray-800">{friend.name}</p>
    </div>
  );
}
