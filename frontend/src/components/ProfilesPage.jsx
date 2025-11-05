import { useState, useRef } from 'react';
import ProfileCard from './ProfileCard';
import SwipeButtons from './SwipeButtons';
import concertImage from '../assets/concert_image.png';

export default function ProfilesPage() {
  const [profiles] = useState([
    {
      id: 1,
      name: "Taylor Swift",
      role: "Vocalist",
      age: "35 y.o.",
      gender: "Woman (she/her)",
      genre: "Pop/Country",
      experience: "12 years of experience",
      mainImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=500&fit=crop",
      concertImage: concertImage,
      lastSong: "Dracula by Tame Impala",
      lastSongDesc: "The last song that gave me chills is..."
    },
    {
      id: 2,
      name: "Ed Sheeran",
      role: "Guitarist/Vocalist",
      age: "33 y.o.",
      gender: "Man (he/him)",
      genre: "Pop/Folk",
      experience: "15 years of experience",
      mainImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=500&fit=crop",
      concertImage: concertImage,
      lastSong: "Bohemian Rhapsody by Queen",
      lastSongDesc: "The last song that gave me chills is..."
    },
    {
      id: 3,
      name: "Billie Eilish",
      role: "Vocalist/Songwriter",
      age: "22 y.o.",
      gender: "Woman (she/her)",
      genre: "Alternative/Pop",
      experience: "8 years of experience",
      mainImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=500&fit=crop",
      concertImage: concertImage,
      lastSong: "Ocean Eyes (own song)",
      lastSongDesc: "The last song that gave me chills is..."
    },
    {
      id: 4,
      name: "Bruno Mars",
      role: "Vocalist/Performer",
      age: "38 y.o.",
      gender: "Man (he/him)",
      genre: "R&B/Funk/Pop",
      experience: "18 years of experience",
      mainImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=500&fit=crop",
      concertImage: concertImage,
      lastSong: "Superstition by Stevie Wonder",
      lastSongDesc: "The last song that gave me chills is..."
    },
  ]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const swipeControllerRef = useRef(null);

  const handleSwipe = (direction) => {
    console.log(`Swiped ${direction} on ${profiles[currentIndex].name}`);
    setCurrentIndex(prev => prev + 1);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
  };

  const handleButtonSwipe = (direction) => {
    // This will trigger the swipe on the top card
    handleSwipe(direction);
  };

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
      <div className="relative w-full max-w-3xl" style={{ height: '700px' }}>
        {visibleCards.map((profile, index) => {
          const isTopCard = index === 0;
          
          // Calculate z-index, scale, and position
          const zIndex = visibleCards.length - index;
          const scale = 1 - (index * 0.05);
          const translateY = index * 20;
          const opacity = 1 - (index * 0.2);

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
        }).reverse()}
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