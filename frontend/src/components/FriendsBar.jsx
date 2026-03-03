import { useEffect, useMemo, useState } from "react";
import { Heart, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../client";
import defaultProfilePhoto from "../assets/DefaultProfilePhoto.png";
import { resolveViewUrl } from "../utils/s3Upload";

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
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allPeople, setAllPeople] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const resolveImage = async (rawUrl) => {
      const value = String(rawUrl || "").trim();
      if (!value) return defaultProfilePhoto;
      try {
        const viewUrl = await resolveViewUrl(value);
        return viewUrl || value;
      } catch {
        return value;
      }
    };

    const loadPeople = async () => {
      try {
        const matches = await api.listMatches();

        const people = await Promise.all(
          (matches || []).map(async (user) => ({
            id: user.id,
            username: user.username, 
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

    const onMatchCreated = () => loadPeople();
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

  const toggleFavorite = (personId) => {
    setAllPeople((prevPeople) =>
      prevPeople.map((person) =>
        person.id === personId
          ? { ...person, isFavorite: !person.isFavorite }
          : person,
      ),
    );
  };

  const displayedPeople = allPeople.filter(
    (person) => person.category === selectedCategory,
  );

  if (isLoading) {
    return <div className="w-[280px] h-screen bg-gray-100 p-4">Loading...</div>;
  }

  if (!allPeople.length) {
    return (
      <div className="w-[280px] h-screen bg-gray-100 p-4">
        <p className="text-sm text-gray-600 text-center mt-4">No matches yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-[280px] h-screen bg-gray-100 p-4">
      <div className="mb-6 flex justify-center">
        <CustomDropdown
          options={categories}
          value={selectedCategory}
          onChange={setSelectedCategory}
          getColor={getColorForCategory}
        />
      </div>

      <div className="grid grid-cols-2 gap-6 p-[20px]">
        {displayedPeople.map((friend) => (
          <FriendCard
            key={friend.id}
            friend={friend}
            onToggleFavorite={toggleFavorite}
            onOpenProfile={() => {
              if (friend.username) navigate(`/profile/${friend.username}`);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function CustomDropdown({
  options,
  value,
  onChange,
  getColor,
  placeholder = "Select an option",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const currentColor = getColor(value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ borderColor: currentColor.border }}
        className="flex w-[255px] h-8 items-center justify-between px-[15px] py-1.5 bg-white rounded-[20px] border"
      >
        <ChevronDown
          className={`w-[15px] h-[15px] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          style={{ color: currentColor.border }}
        />
        <span
          className="font-medium text-sm"
          style={{ color: currentColor.text, fontFamily: "Nunito, sans-serif" }}
        >
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
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full px-6 py-4 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors duration-150 ${
                  index !== options.length - 1 ? "border-b border-gray-100" : ""
                }`}
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                <div className={`w-3 h-3 rounded-full ${color.dot}`} />
                <span
                  style={{ color: option === value ? color.text : "#374151" }}
                  className={option === value ? "font-semibold" : ""}
                >
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

function FriendCard({ friend, onToggleFavorite, onOpenProfile }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[83px] h-[83px] mb-2">
        <button
          type="button"
          onClick={onOpenProfile}
          className="w-full h-full bg-[#d9d9d9] rounded-[15px] overflow-hidden"
          aria-label={`Open ${friend.name}'s profile`}
        >
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
        </button>

        <button
          onClick={() => onToggleFavorite(friend.id)}
          className="absolute bottom-1 right-1 z-10 w-6 h-6 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center"
          aria-label="Toggle favorite"
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

      <button
        type="button"
        onClick={onOpenProfile}
        className="w-[83px] text-center text-sm font-medium text-gray-800 truncate"
        title={friend.name}
      >
        {friend.name}
      </button>
    </div>
  );
}