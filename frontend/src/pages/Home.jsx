// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FriendsBar from '../components/FriendsBar';
import ProfileCard from '../components/ProfileCard';
import ProfilesPage from '../components/ProfilesPage';

export default function Home() {
  // State for selected category
  const [selectedCategory, setSelectedCategory] = useState('Concert Buddies');
  
  // State for all profiles from database
  const [allPeople, setAllPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch profiles from database
  useEffect(() => {
    // Replace this with your actual API call
    const fetchProfiles = async () => {
      try {
        // Example: const response = await fetch('/api/profiles');
        // const data = await response.json();
        
        // Temporary mock data until you connect to database
        const mockData = [
          { id: 1, name: 'Marco', isFavorite: true, category: 'Concert Buddies' },
          { id: 2, name: 'Jacob', isFavorite: false, category: 'Concert Buddies' },
          { id: 3, name: 'Jennifer', isFavorite: false, category: 'Concert Buddies' },
          { id: 4, name: 'Jazzy', isFavorite: true, category: 'Concert Buddies' },
          { id: 5, name: 'Abeyah', isFavorite: false, category: 'Concert Buddies' },
          { id: 6, name: 'Yaneli', isFavorite: false, category: 'Concert Buddies' },
          { id: 7, name: 'Sarah', isFavorite: true, category: 'Musicians' },
          { id: 8, name: 'Mike', isFavorite: true, category: 'Musicians' },
          { id: 9, name: 'Emma', isFavorite: false, category: 'Musicians' },
          { id: 10, name: 'Alex', isFavorite: true, category: 'Musicians' },
        ];
        
        setAllPeople(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  // Toggle favorite and update database
  const toggleFavorite = async (personId) => {
    // Optimistically update UI
    setAllPeople((prevPeople) =>
      prevPeople.map((person) =>
        person.id === personId
          ? { ...person, isFavorite: !person.isFavorite }
          : person
      )
    );

    // Update database
    try {
      // Example: await fetch(`/api/profiles/${personId}/favorite`, { method: 'PATCH' });
      console.log(`Toggled favorite for user ${personId}`);
    } catch (error) {
      console.error('Error updating favorite:', error);
      // Revert on error
      setAllPeople((prevPeople) =>
        prevPeople.map((person) =>
          person.id === personId
            ? { ...person, isFavorite: !person.isFavorite }
            : person
        )
      );
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex">
        <Navbar />
      </div>
      <div className="flex">
        {/* Pass profiles and handlers to FriendsBar */}
        <FriendsBar 
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          allPeople={allPeople}
          onToggleFavorite={toggleFavorite}
        />
      </div>
      <div className="flex-1 overflow-auto">
        {/* Pass category and profiles to ProfilesPage */}
        <ProfilesPage 
          category={selectedCategory}
          allPeople={allPeople}
        />
      </div>
    </div>
  );
}