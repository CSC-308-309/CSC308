import { useEffect, useState } from "react";
import { Mic, Cake, User, Music, FileText } from "lucide-react";
import SwipeDragController from "./SwipeDragController";
import concertImage from "../assets/concert_image.png";
import { api } from "../client";

export default function ProfileCard({ profile, isActive = true, onSwipe }) {
  const defaultProfile = {
    name: "Taylor Swift",
    role: "Vocalist",
    age: "35 y.o.",
    gender: "Woman (she/her)",
    genre: "Pop/Country",
    experience: "12 years of experience",
    main_image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=500&fit=crop",
    concert_image: concertImage,
    last_song: "Dracula by Tame Impala",
    last_song_desc: "The last song that gave me chills is...",
  };

  const profileData = profile || defaultProfile;
  const [mainImageSrc, setMainImageSrc] = useState(profileData.main_image);
  const [concertImageSrc, setConcertImageSrc] = useState(
    profileData.concert_image,
  );

  useEffect(() => {
    let cancelled = false;

    const resolveImage = async (rawUrl, setter) => {
      if (!rawUrl) return;
      try {
        const { viewUrl } = await api.presignView({ fileUrl: rawUrl });
        if (!cancelled && viewUrl) setter(viewUrl);
      } catch {
        if (!cancelled) setter(rawUrl);
      }
    };

    setMainImageSrc(profileData.main_image);
    setConcertImageSrc(profileData.concert_image);
    resolveImage(profileData.main_image, setMainImageSrc);
    resolveImage(profileData.concert_image, setConcertImageSrc);

    return () => {
      cancelled = true;
    };
  }, [profileData.main_image, profileData.concert_image]);

  const handleSwipe = (direction) => {
    console.log(`Swiped ${direction} on ${profileData.name}`);
    if (onSwipe) {
      onSwipe(direction);
    }
  };

  return (
    <SwipeDragController onSwipe={handleSwipe} isActive={isActive}>
      {({ isDragging, dragOffset, rotation, opacity }) => (
        <div className="w-full flex flex-col items-center justify-center">
          {/* Card Container with swipe transforms */}
          <div
            className="w-full max-w-3xl bg-gradient-to-b from-purple-200 to-purple-100 rounded-3xl p-6 shadow-md cursor-grab active:cursor-grabbing select-none"
            style={{
              transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
              transition: isDragging ? "none" : "transform 0.3s ease-out",
              opacity: opacity,
            }}
          >
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left Column - Info */}
              <div className="bg-white rounded-2xl p-6 flex flex-col justify-center">
                <h2 className="text-5xl font-bold mb-6 break-words overflow-wrap-anywhere">
                  {profileData.name}
                </h2>

                <div className="space-y-3">
                  <InfoItem
                    icon={<Mic className="w-5 h-5" />}
                    text={profileData.role}
                  />
                  <InfoItem
                    icon={<Cake className="w-5 h-5" />}
                    text={profileData.age}
                  />
                  <InfoItem
                    icon={<User className="w-5 h-5" />}
                    text={profileData.gender}
                  />
                  <InfoItem
                    icon={<Music className="w-5 h-5" />}
                    text={profileData.genre}
                  />
                  <InfoItem
                    icon={<FileText className="w-5 h-5" />}
                    text={profileData.experience}
                  />
                </div>
              </div>

              {/* Right Column - Main Image */}
              <div className="bg-gray-400 rounded-2xl overflow-hidden aspect-[4/5] md:aspect-auto md:h-[420px]">
                <img
                  src={mainImageSrc}
                  alt={profileData.name}
                  className="block w-full h-full object-cover object-center"
                  draggable={false}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/400x500?text=No+Image";
                  }}
                />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Concert Image */}
              <div className="bg-gray-400 rounded-2xl overflow-hidden h-48">
                <img
                  src={concertImageSrc}
                  alt="Concert"
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/800x600?text=No+Concert+Image";
                  }}
                />
              </div>

              {/* Last Song Card */}
              <div className="bg-white rounded-2xl p-4 flex flex-col justify-center">
                <p className="text-lg text-gray-600 mb-2">
                  {profileData.last_song_desc}
                </p>
                <p className="text-4xl font-semibold">
                  {profileData.last_song}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </SwipeDragController>
  );
}

function InfoItem({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-gray-700">{icon}</div>
      <span className="text-xl font-medium">{text}</span>
    </div>
  );
}
