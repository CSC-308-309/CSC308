// src/pages/Home.jsx
import Navbar from '../components/Navbar';
import FriendsBar from '../components/FriendsBar';
import ProfileCard from '../components/ProfileCard';
import ProfilesPage from '../components/ProfilesPage';

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex">
        <Navbar />
      </div>
      <div className="flex">
        <FriendsBar />
      </div>
      <div className="flex-1 overflow-auto">
        <ProfilesPage />
      </div>
    </div>
  );
}
