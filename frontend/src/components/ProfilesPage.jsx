import { useState, useEffect } from 'react';
import { api } from '../client.js';
import ProfileCard from './ProfileCard';
import SwipeButtons from './SwipeButtons';

export default function ProfilesPage({ category }) {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await api.listUsers();
        setProfiles(data);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError('Failed to load profiles. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  // Reset to first card when category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [category]);

  const handleSwipe = async (direction) => {
    const targetProfile = filteredProfiles[currentIndex];
    console.log(`Swiped ${direction} on ${targetProfile.name}`);
    
    try {
      if (!currentUser) throw new Error('You must be logged in to interact');
      if (direction === 'right') {
        await api.like(currentUser, targetProfile.username);
      } else if (direction === 'left') {
        await api.dislike(currentUser, targetProfile.username);
      }
    } catch (err) {
      console.error(`Failed to record ${direction} swipe:`, err);
    }
    
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
  };

  const handleButtonSwipe = (direction) => {
    handleSwipe(direction);
  };

  // Filter profiles based on selected category
  const filteredProfiles = profiles.filter(
    profile => profile.category === category
  );

  if (isLoading) {
    return <div className="text-center mt-10">Loading profiles...</div>;
  }

  if (error) {
    return <div className="text-center mt-10">Error: {error}</div>;
  }

  if (filteredProfiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">No profiles found in "{category}"</h2>
          <p className="text-gray-600">Try selecting a different category</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= filteredProfiles.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">No more profiles in "{category}"!</h2>
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

  // Show up to 3 cards stacked from filtered profiles
  const visibleCards = filteredProfiles.slice(currentIndex, currentIndex + 3);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4">
      {/* Card Stack Container with fixed height */}
      <div className="relative w-full max-w-3xl" style={{ height: '700px' }}>
        {visibleCards
          .map((profile, index) => {
            const isTopCard = index === 0;
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
                  pointerEvents: isTopCard ? 'auto' : 'none',
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
          onUndo={() => console.log('Undo')}
          onReject={() => handleButtonSwipe('left')}
          onAccept={() => handleButtonSwipe('right')}
          onSuperLike={() => console.log('Super like')}
        />
      </div>
    </div>
  );
}