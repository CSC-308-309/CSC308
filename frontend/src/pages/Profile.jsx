// src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import { api } from '../client.js';
import Navbar from '../components/Navbar';
import CoverPhoto from '../components/CoverPhoto';
import EditProfilePhoto from '../components/ProfilePhoto';
import TopProfileCard from '../components/TopProfileCard';
import AboutCard from '../components/AboutCard';
import YouMightKnowCard from '../components/YouMightKnowCard';
import BioSection, {
  DEFAULT_PROFILE,
  getInitialProfileData,
} from '../components/BioSection';
import EditBioButton from '../components/EditBioButton';
import ConcertMemories from '../components/ConcertMemories';
import AboutSection from '../components/AboutSection'; //
import YouMightKnowSection from '../components/YouMightKnowSection'; //
import MusicClips from '../components/musicclips/MusicClips';

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
        <div className="mx-auto justify-center p-6 w-[1160px]">
          <TopProfileCard>
            <div className="relative">
              <CoverPhoto username="testuser"/>

              <div className="absolute left-14 -bottom-[68px] z-20">
                <EditProfilePhoto username="testuser"/>
              </div>

              <div className="absolute right-12 top-[260px] z-30">
                <EditBioButton
                  profileData={profileData}
                  onSave={handleProfileSave}
                  className="w-[170px] h-[40px]"
                />
              </div>
            </div>

            <div className="relative z-10 px-8 pt-[80px] pb-8 grid grid-cols-12 gap-6 ">
              <div className="col-span-12 lg:col-span-8">
                <BioSection profileData={profileData} />
              </div>
              <div className="col-span-12 lg:col-span-4" />
            </div>
          </TopProfileCard>

          <div className="grid grid-cols-12 mt-5 w-[1160px]">
            <div className="col-span-12 lg:col-span-8 pr-5 space-y-10">
  
              {/* Concert Memories Section */}
              <section>
                <ConcertMemories />
              </section>

              {/* Divider for clarity */}
              <div className="border-t border-gray-300 my-8"></div>

              {/* Music Clips Section */}
              <section>
                <MusicClips />
              </section>
            </div>


            <div className="col-span-12 lg:col-span-4 ml-auto space-y-5">
              <AboutCard>
                <div className="p-4">
                  <AboutSection profileData={profileData} />
                </div>
              </AboutCard>

              <YouMightKnowCard>
                <div className="p-4">
                  <YouMightKnowSection />
                </div>
              </YouMightKnowCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}