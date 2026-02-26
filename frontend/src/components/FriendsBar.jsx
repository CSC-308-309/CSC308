import { useEffect, useMemo, useState } from "react";
import { Heart, ChevronDown } from "lucide-react";
import { api } from "../client";
import defaultProfilePhoto from "../assets/DefaultProfilePhoto.png";
// import CustomDropdown from './CustomDropdown';

function getColorForCategory(category) {
  const normalized = String(category || "").trim().toLowerCase();

  if (normalized.includes("vocal")) {
    return { border: "#f43f5e", text: "#be123c", dot: "bg-rose-500" };
  }
  if (normalized.includes("instrument")) {
    return { border: "#0ea5e9", text: "#0369a1", dot: "bg-sky-500" };
  }
  if (normalized.includes("producer")) {
    return { border: "#f59e0b", text: "#b45309", dot: "bg-amber-500" };
  }
  if (normalized.includes("listener")) {
    return { border: "#10b981", text: "#047857", dot: "bg-emerald-500" };
  }
  if (normalized.includes("live music lover")) {
    return { border: "#f97316", text: "#c2410c", dot: "bg-orange-500" };
  }

  return { border: "#a376a2", text: "#7e5179", dot: "bg-purple-500" };
}

export default function FriendsBar() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allPeople, setAllPeople] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadPeople = async () => {
      const shouldPresign = (rawUrl) => {
        const value = String(rawUrl || "").trim();
        if (!value) return false;
        if (value.startsWith("data:") || value.startsWith("blob:")) return false;
        if (value.startsWith("/")) return false;

        try {
          const parsed = new URL(value);
          if (parsed.searchParams.has("X-Amz-Signature")) return false;
          const host = parsed.hostname.toLowerCase();
          return host.endsWith("amazonaws.com");
        } catch {
          // Non-URL values are treated as object keys that need signing.
          return true;
        }
      };

      const resolveImage = async (rawUrl) => {
        const value = String(rawUrl || "").trim();
        if (!value) return defaultProfilePhoto;
        if (!shouldPresign(value)) return value;
        try {
          const { viewUrl } = await api.presignViewUrl(value);
          return viewUrl || value;
        } catch {
          return value;
        }
      };

      try {
        const matches = await api.listMatches();
        const people = await Promise.all(
          (matches || []).map(async (user) => ({
            id: user.id,
            name: user.name || user.username || "Unknown",
            category: user.role || "Unspecified",
            profilePhoto: await resolveImage(user.main_image),
            isFavorite: false,
          })),
        );
        if (!cancelled) setAllPeople(people);
      } catch (error) {
        console.error("Failed to load matches for FriendsBar:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadPeople();
    const onMatchCreated = () => {
      loadPeople();
    };
    window.addEventListener("match:created", onMatchCreated);

    return () => {
      cancelled = true;
      window.removeEventListener("match:created", onMatchCreated);
    };
  }, []);

  const categories = useMemo(
    () => [...new Set(allPeople.map((person) => person.category))],
    [allPeople],
  );

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

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

  if (isLoading) {
    return <div className="w-[280px] h-screen bg-gray-100 p-4">Loading...</div>;
  }

  if (!allPeople.length) {
    return (
      <div className="w-[280px] h-screen bg-gray-100 p-4">
        <p className="text-sm text-gray-600 text-center mt-4">
          No matches yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-[280px] h-screen bg-gray-100 p-4">
      {/* Custom Dropdown */}
      <div className="mb-6 flex justify-center">
        <CustomDropdown
          options={categories}
          value={selectedCategory}
          onChange={setSelectedCategory}
          getColor={getColorForCategory}  // pass color getter
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

function CustomDropdown({ options, value, onChange, getColor, placeholder = "Select an option" }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentColor = getColor(value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ borderColor: currentColor.border }}  // dynamic border color
        className="flex w-[255px] h-8 items-center justify-between px-[15px] py-1.5 bg-white rounded-[20px] border"
      >
        <ChevronDown className={`w-[15px] h-[15px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          style={{ color: currentColor.border }} />
        <span className="font-medium text-sm" style={{ color: currentColor.text, fontFamily: "Nunito, sans-serif" }}>
          {value || placeholder}
        </span>
        <div className="w-[15px]"></div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border-2 border-purple-200 overflow-hidden z-50">
          {options.map((option, index) => {
            const color = getColor(option);
            return (
              <button
                key={option}
                onClick={() => { onChange(option); setIsOpen(false); }}
                className={`w-full px-6 py-4 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors duration-150 ${
                  index !== options.length - 1 ? "border-b border-gray-100" : ""
                }`}
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {/* Color dot per category */}
                <div className={`w-3 h-3 rounded-full ${color.dot}`} />
                <span style={{ color: option === value ? color.text : "#374151" }}
                  className={option === value ? "font-semibold" : ""}>
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FriendCard({ friend, onToggleFavorite }) {
  return (
    <div className="flex flex-col items-center">
      {/* Box with heart positioned relative to it */}
      <div className="relative w-[83px] h-[83px] mb-2">
        <div className="w-full h-full bg-[#d9d9d9] rounded-[15px] overflow-hidden">
          <img
            src={friend.profilePhoto || defaultProfilePhoto}
            alt={friend.name}
            className="w-full h-full object-cover"
            draggable={false}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = defaultProfilePhoto;
            }}
          />
        </div>
        <button
          onClick={() => onToggleFavorite(friend.id)}
          className="absolute bottom-1 right-1 z-10 w-6 h-6 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center"
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
      <p
        className="w-[83px] text-center text-sm font-medium text-gray-800 truncate"
        title={friend.name}
      >
        {friend.name}
      </p>
    </div>
  );
}
