// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import CoverPhoto from "../components/CoverPhoto";
import EditProfilePhoto from "../components/ProfilePhoto";
import TopProfileCard from "../components/TopProfileCard";
import AboutCard from "../components/AboutCard";
import YouMightKnowCard from "../components/YouMightKnowCard";
import BioSection, {
  DEFAULT_PROFILE,
  getInitialProfileData,
} from "../components/BioSection";
import EditBioButton from "../components/EditBioButton";
import ConcertMemories from "../components/ConcertMemories";
import AboutSection from "../components/AboutSection"; //
import YouMightKnowSection from "../components/YouMightKnowSection"; //
import MusicClips from "../components/musicclips/MusicClips";
import { api } from "../client";

const PROFILE_STORAGE_KEY = "profileData";

function getLoggedInUsername() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.username || "";
  } catch {
    return "";
  }
}

function mapDbUserToProfileData(dbUser = {}, current = {}) {
  return {
    ...current,
    name: dbUser.name ?? current.name ?? "",
    age:
      dbUser.age != null && dbUser.age !== ""
        ? String(dbUser.age)
        : (current.age ?? ""),
    username: dbUser.username ?? current.username ?? "",
    role: dbUser.role ?? current.role ?? "",
    artistgenre: dbUser.genre ?? current.artistgenre ?? "",
    yearsofexperience:
      dbUser.experience != null && dbUser.experience !== ""
        ? String(dbUser.experience)
        : (current.yearsofexperience ?? ""),
    bio: dbUser.last_song_desc ?? current.bio ?? "",
  };
}

function mapProfileDataToDbUpdate(profileData = {}) {
  const toNullableInt = (value) => {
    if (value == null || value === "") return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  return {
    name: (profileData.name || "").trim(),
    age: toNullableInt(profileData.age),
    role: (profileData.role || "").trim(),
    genre: (profileData.artistgenre || "").trim(),
    experience: toNullableInt(profileData.yearsofexperience),
    last_song_desc: (profileData.bio || "").trim(),
  };
}

export default function Profile() {
  const [profileData, setProfileData] = useState(getInitialProfileData);
  const [username, setUsername] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  useEffect(() => {
    const activeUsername = getLoggedInUsername();
    setUsername(activeUsername);
    if (!activeUsername) return;

    const hydrateFromDb = async () => {
      try {
        const dbUser = await api.getByUsername(activeUsername);
        const merged = mapDbUserToProfileData(dbUser, getInitialProfileData());
        setProfileData(merged);
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(merged));

        if (dbUser?.main_image) {
          setProfileImageUrl(dbUser.main_image);
          localStorage.setItem("profilePhotoUrl", dbUser.main_image);
        }
        if (dbUser?.concert_image) {
          setCoverImageUrl(dbUser.concert_image);
          localStorage.setItem("coverPhotoUrl", dbUser.concert_image);
        }
      } catch (error) {
        console.error("Failed to load profile from DB:", error);
      }
    };

    hydrateFromDb();
  }, []);

  const handleProfileSave = async (data) => {
    setProfileData(data);

    if (!username) return;

    try {
      await api.update(username, mapProfileDataToDbUpdate(data));
    } catch (error) {
      console.error("Failed to save profile to DB:", error);
    }
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
              <CoverPhoto username={username} initialSrc={coverImageUrl} />

              <div className="absolute left-14 -bottom-[68px] z-20">
                <EditProfilePhoto
                  username={username}
                  initialSrc={profileImageUrl}
                />
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
