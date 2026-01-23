import { useState } from 'react';
import { Heart, ChevronDown } from 'lucide-react';

// Add this color theme object at the top
const categoryThemes = {
  'Concert Buddies': {
    dropdown: {
      border: 'border-[#a376a2]',
      text: 'text-[#7e5179]',
      chevron: 'text-[#a376a2]',
      menuBorder: 'border-purple-200',
      hover: 'hover:bg-purple-50',
      selected: 'bg-purple-100 text-purple-700'
    }
  },
  'Musicians': {
    dropdown: {
      border: 'border-blue-400',
      text: 'text-blue-700',
      chevron: 'text-blue-600',
      menuBorder: 'border-blue-200',
      hover: 'hover:bg-blue-50',
      selected: 'bg-blue-100 text-blue-700'
    }
  }
};

export default function FriendsBar({ selectedCategory, setSelectedCategory, allPeople, onToggleFavorite }) {
  const categories = ['Concert Buddies', 'Musicians'];

  // allPeople and toggleFavorite now come from props (passed from parent)
  // Parent component will fetch from database

  // Filter people based on selected category
  const displayedPeople = allPeople.filter(
    (person) => person.category === selectedCategory
  );

  // Get current theme
  const currentTheme = categoryThemes[selectedCategory].dropdown;

  return (
    <div className="flex flex-col w-[280px] h-screen bg-gray-100 p-4">
      {/* Custom Dropdown */}
      <div className="mb-6 flex justify-center">
        <CustomDropdown
          options={categories}
          value={selectedCategory}
          onChange={setSelectedCategory}
          theme={currentTheme}
        />
      </div>

      {/* Friends Grid */}
      <div className="grid grid-cols-2 gap-6 p-[20px]">
        {displayedPeople.map((friend) => (
          <FriendCard
            key={friend.id}
            friend={friend}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}

// CustomDropdown component - now accepts theme prop
function CustomDropdown({
  options,
  value,
  onChange,
  theme,
  placeholder = 'Select an option',
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
        className={`flex w-[255px] h-8 items-center justify-between px-[15px] py-1.5 bg-white rounded-[20px] border ${theme.border}`}
      >
        <ChevronDown
          className={`w-[15px] h-[15px] ${theme.chevron} transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
        <span
          className={`${theme.text} font-medium text-sm`}
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          {value || placeholder}
        </span>
        <div className="w-[15px]"></div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border-2 ${theme.menuBorder} overflow-hidden z-10`}>
          {options.map((option, index) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`w-full px-6 py-4 text-left ${theme.hover} transition-colors duration-150 ${
                option === value
                  ? `${theme.selected} font-semibold`
                  : 'text-gray-700'
              } ${index !== options.length - 1 ? 'border-b border-gray-100' : ''}`}
              style={{ fontFamily: 'Nunito, sans-serif' }}
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
                ? 'text-red-500 fill-red-500'
                : 'text-gray-400 fill-none hover:text-gray-500'
            }`}
          />
        </button>
      </div>

      {/* Name below box */}
      <p className="text-sm font-medium text-gray-800">{friend.name}</p>
    </div>
  );
}

// Export the theme so ProfileCard can use it
export { categoryThemes };