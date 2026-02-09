import { useState, useEffect } from "react";
import { api } from "../client.js";
import ProfileCard from "./ProfileCard";
import SwipeButtons from "./SwipeButtons";

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser] = useState(null); // obtained from auth or local storage

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await api.listUsers();
        setProfiles(data);
      } catch (err) {
        console.error("Error fetching profiles:", err);
        setError("Failed to load profiles. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleSwipe = async (direction) => {
    const targetProfile = profiles[currentIndex];
    console.log(`Swiped ${direction} on ${targetProfile.name}`);

    // Send interaction to backend
    try {
      if (!currentUser) throw new Error("You must be logged in to interact");
      if (direction === "right") {
        await api.like(currentUser, targetProfile.username);
      } else if (direction === "left") {
        await api.dislike(currentUser, targetProfile.username);
      }
    } catch (err) {
      console.error(`Failed to record ${direction} swipe:`, err);
      // Continue anyway - don't block UX
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
  };

  const handleButtonSwipe = (direction) => {
    // This will trigger the swipe on the top card
    handleSwipe(direction);
  };

  if (isLoading) {
    return <div className="text-center mt-10">Loading profiles...</div>;
  }

  if (error) {
    return <div className="text-center mt-10">Error: {error}</div>;
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">No more profiles!</h2>
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-purple-500 text-white rounded-full font-semibold hover:bg-purple-600"
          >
            Restart
          </button>
        </div>
      </div>
    );
  }

  // Show up to 3 cards stacked
  const visibleCards = profiles.slice(currentIndex, currentIndex + 3);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4">
      {/* Card Stack Container with fixed height */}
      <div className="relative w-full max-w-3xl" style={{ height: "700px" }}>
        {visibleCards
          .map((profile, index) => {
            const isTopCard = index === 0;

            // Calculate z-index, scale, and position
            const zIndex = visibleCards.length - index;
            const scale = 1 - index * 0.05;
            const translateY = index * 20;
            const opacity = 1 - index * 0.2;

            return (
              <div
                key={profile.id}
                className="absolute top-0 left-0 right-0"
                style={{
                  zIndex: zIndex,
                  transform: `scale(${scale}) translateY(${translateY}px)`,
                  opacity: opacity,
                  pointerEvents: isTopCard ? "auto" : "none",
                }}
              >
                <ProfileCard
                  profile={profile}
                  onSwipe={isTopCard ? handleSwipe : null}
                  isActive={isTopCard}
                />
              </div>
            );
          })
          .reverse()}
      </div>

      {/* Swipe Buttons below the card stack */}
      <div className="mt-8">
        <SwipeButtons
          onUndo={() => console.log("Undo")} // TODO: implement undo (no routes/backend support yet)
          onReject={() => handleButtonSwipe("left")}
          onAccept={() => handleButtonSwipe("right")}
          onSuperLike={() => console.log("Super like")} // TODO: Is this a thing we're doing? No backend support
        />
      </div>
    </div>
  );
}
