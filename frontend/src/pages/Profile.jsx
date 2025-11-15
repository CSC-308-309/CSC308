// src/pages/Profile.jsx
import { useState } from "react";
import Navbar from "../components/Navbar";
import CoverPhoto from "../components/CoverPhoto";
import EditProfilePhoto from "../components/ProfilePhoto";
import TopProfileCard from "../components/TopProfileCard";
import BioSection, { DEFAULT_PROFILE, getInitialProfileData } from "../components/BioSection";
import EditBioButton from "../components/EditBioButton";

export default function Profile() {
  const [profileData, setProfileData] = useState(getInitialProfileData);

  const handleProfileSave = (data) => {
    setProfileData(data);
  };

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

              <div className="absolute left-14 -bottom-[68px] z-20">
                <EditProfilePhoto />
              </div>

              <div className="absolute right-12 top-[260px] z-30">
                <EditBioButton
                  profileData={profileData}
                  onSave={handleProfileSave}
                  className="w-[170px] h-[40px]"
                />
              </div>
            </div>

            <div className="relative z-10 px-8 pt-[80px] pb-8 grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8">
                <BioSection profileData={profileData} />
              </div>
              <div className="col-span-12 lg:col-span-4" />
            </div>
          </TopProfileCard>
        </div>
      </main>
    </div>
  );
}
