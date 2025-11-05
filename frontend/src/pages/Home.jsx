// src/pages/Home.jsx
import Navbar from "../components/navbar";
import FriendsBar from "../components/FriendsBar";
import ProfileCard from "../components/ProfileCard";

export default function Home() {
  return (
    <div className="flex">
      <Navbar />
      <FriendsBar />
      <ProfileCard />
    </div>
  );
}
