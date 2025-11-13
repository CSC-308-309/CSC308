// src/pages/Profile.jsx
import Navbar from "../components/Navbar";
import CoverPhoto from "../components/CoverPhoto";
import EditProfilePhoto from "../components/ProfilePhoto";
import TopProfileCard from "../components/TopProfileCard";

export default function Profile() {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex">
        <Navbar />
      </div>
      
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="mx-auto justify-center p-6">
          <TopProfileCard>
            <div className="relative">
              <CoverPhoto />
              <div className="absolute left-14 -bottom-[68px]">
                <EditProfilePhoto />
              </div>
            </div>
          </TopProfileCard>
        </div>
      </main>
    </div>
  );
}