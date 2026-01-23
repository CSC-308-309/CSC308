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

  // Toggle this to switch between mock data and real API
  const USE_MOCK_DATA = false;

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        if (USE_MOCK_DATA) {
          // Mock data for testing
          const mockProfiles = [
            {
              id: 1,
              name: 'Taylor Swift',
              username: 'tswift',
              category: 'Musicians',
              isFavorite: false,
              role: 'Vocalist',
              age: '35 y.o.',
              gender: 'Woman (she/her)',
              genre: 'Pop/Country',
              experience: '12 years of experience',
              main_image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=500&fit=crop',
              concert_image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
              last_song: 'Dracula by Tame Impala',
              last_song_desc: 'The last song that gave me chills is...',
            },
            {
              id: 2,
              name: 'Marco Rodriguez',
              username: 'marco_r',
              category: 'Concert Buddies',
              isFavorite: true,
              role: 'Concert Enthusiast',
              age: '28 y.o.',
              gender: 'Man (he/him)',
              genre: 'Rock/Metal',
              experience: '5 years of concert-going',
              main_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
              concert_image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
              last_song: 'Master of Puppets by Metallica',
              last_song_desc: 'My all-time favorite concert song...',
            },
            {
              id: 3,
              name: 'Sarah Chen',
              username: 'sarah_c',
              category: 'Musicians',
              isFavorite: true,
              role: 'Guitarist',
              age: '26 y.o.',
              gender: 'Woman (she/her)',
              genre: 'Indie/Alternative',
              experience: '8 years of experience',
              main_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
              concert_image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
              last_song: 'Mr. Brightside by The Killers',
              last_song_desc: 'This song never gets old...',
            },
            {
              id: 4,
              name: 'Jake Morrison',
              username: 'jake_m',
              category: 'Concert Buddies',
              isFavorite: false,
              role: 'Festival Goer',
              age: '24 y.o.',
              gender: 'Man (he/him)',
              genre: 'EDM/Electronic',
              experience: '3 years of festivals',
              main_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
              concert_image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop',
              last_song: 'Levels by Avicii',
              last_song_desc: 'Takes me back to my first festival...',
            },
            {
              id: 5,
              name: 'Emma Williams',
              username: 'emma_w',
              category: 'Musicians',
              isFavorite: false,
              role: 'Drummer',
              age: '30 y.o.',
              gender: 'Woman (she/her)',
              genre: 'Jazz/Funk',
              experience: '15 years of experience',
              main_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop',
              concert_image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop',
              last_song: 'Superstition by Stevie Wonder',
              last_song_desc: 'The groove on this is incredible...',
            },
            {
              id: 6,
              name: 'Alex Kim',
              username: 'alex_k',
              category: 'Concert Buddies',
              isFavorite: true,
              role: 'Live Music Lover',
              age: '27 y.o.',
              gender: 'Non-binary (they/them)',
              genre: 'Hip-Hop/R&B',
              experience: '6 years of concerts',
              main_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
              concert_image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&h=600&fit=crop',
              last_song: 'HUMBLE. by Kendrick Lamar',
              last_song_desc: 'Live performance was insane...',
            },
          ];
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          setProfiles(mockProfiles);
        } else {
          // Real API call
          const data = await api.listUsers();
          setProfiles(data);
        }
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