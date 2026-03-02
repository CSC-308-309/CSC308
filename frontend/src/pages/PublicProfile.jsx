// src/pages/PublicProfile.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import CoverPhoto from "../components/CoverPhoto";
import ProfilePhoto from "../components/ProfilePhoto";
import TopProfileCard from "../components/TopProfileCard";
import AboutCard from "../components/AboutCard";
import BioSection, { getInitialProfileData } from "../components/BioSection";
import ConcertMemories from "../components/ConcertMemories";
import AboutSection from "../components/AboutSection";
import MusicClips from "../components/musicclips/MusicClips";
import { api } from "../client";

const PROFILE_STORAGE_KEY = "profileData";
const PROFILE_PHOTO_STORAGE_KEY = "profilePhotoUrl";
const COVER_PHOTO_STORAGE_KEY = "coverBannerUrl";

function buildUserStorageKey(baseKey, username) {
  return username ? `${baseKey}:${username}` : baseKey;
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

export default function PublicProfile() {
  const navigate = useNavigate();
  const { username: viewedUsername } = useParams();

  const [dbUser, setDbUser] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const profileData = useMemo(() => {
    const base = getInitialProfileData(
      buildUserStorageKey(PROFILE_STORAGE_KEY, viewedUsername),
    );
    return mapDbUserToProfileData(dbUser || {}, base);
  }, [dbUser, viewedUsername]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateFromDb() {
      try {
        setLoading(true);
        if (!viewedUsername) return;

        const user = await api.getByUsername(viewedUsername);

        if (cancelled) return;

        setDbUser(user || null);

        if (user?.main_image) {
          setProfileImageUrl(user.main_image);
          localStorage.setItem(
            buildUserStorageKey(PROFILE_PHOTO_STORAGE_KEY, viewedUsername),
            user.main_image,
          );
        } else {
          setProfileImageUrl("");
        }

        if (user?.concert_image) {
          setCoverImageUrl(user.concert_image);
          localStorage.setItem(
            buildUserStorageKey(COVER_PHOTO_STORAGE_KEY, viewedUsername),
            user.concert_image,
          );
        } else {
          setCoverImageUrl("");
        }

        const merged = mapDbUserToProfileData(
          user,
          getInitialProfileData(
            buildUserStorageKey(PROFILE_STORAGE_KEY, viewedUsername),
          ),
        );
        localStorage.setItem(
          buildUserStorageKey(PROFILE_STORAGE_KEY, viewedUsername),
          JSON.stringify(merged),
        );
      } catch (error) {
        console.error("Failed to load public profile from DB:", error);
        if (!cancelled) setDbUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    hydrateFromDb();
    return () => {
      cancelled = true;
    };
  }, [viewedUsername]);

  const handleMessage = () => {
    if (!viewedUsername) return;
    navigate("/messages", { state: { startChatWith: viewedUsername } });
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="flex">
          <Navbar />
        </div>
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="mx-auto justify-center p-6 w-[1160px]">
            <div className="text-gray-700">Loading profile...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!dbUser) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="flex">
          <Navbar />
        </div>
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="mx-auto justify-center p-6 w-[1160px]">
            <div className="text-gray-700">User not found.</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex">
        <Navbar />
      </div>

      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="mx-auto justify-center p-6 w-[1160px]">
          <TopProfileCard>
            <div className="relative">
              <CoverPhoto
                username={viewedUsername}
                initialSrc={coverImageUrl}
                storageKey={buildUserStorageKey(
                  COVER_PHOTO_STORAGE_KEY,
                  viewedUsername,
                )}
                editable={false}
              />

              <div className="absolute left-14 -bottom-[68px] z-20">
                <ProfilePhoto
                  username={viewedUsername}
                  initialSrc={profileImageUrl}
                  storageKey={buildUserStorageKey(
                    PROFILE_PHOTO_STORAGE_KEY,
                    viewedUsername,
                  )}
                  editable={false}
                />
              </div>

              <div className="absolute right-12 top-[260px] z-30">
                <button
                  type="button"
                  onClick={handleMessage}
                  className="w-[170px] h-[40px] rounded-full bg-melodious-pink text-white font-semibold hover:opacity-90 transition"
                >
                  Message
                </button>
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
              <section>
                <ConcertMemories username={viewedUsername} />
              </section>

              <div className="border-t border-gray-300 my-8"></div>

              <section>
                <MusicClips username={viewedUsername} />
              </section>
            </div>

            <div className="col-span-12 lg:col-span-4 ml-auto space-y-5">
              <AboutCard>
                <div className="p-4">
                  <AboutSection profileData={profileData} />
                </div>
              </AboutCard>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}