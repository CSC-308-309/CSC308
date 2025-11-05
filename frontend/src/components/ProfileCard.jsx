import { Mic, Cake, User, Music, FileText } from 'lucide-react';
import SwipeButtons from './SwipeButtons';
import concertImage from '../assets/concert_image.png'

export default function ProfileCard() {
  const profile = {
    name: "Taylor Swift",
    role: "Vocalist",
    age: "35 y.o.",
    gender: "Woman (she/her)",
    genre: "Pop/Country",
    experience: "12 years of experience",
    mainImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=500&fit=crop",
    concertImage: concertImage,
    lastSong: "Dracula by Tame Impala",
    lastSongDesc: "The last song that gave me chills is..."
  };

  const handleUndo = () => console.log('Undo clicked');
  const handleReject = () => console.log('Reject clicked');
  const handleAccept = () => console.log('Accept clicked');
  const handleSuperLike = () => console.log('Super like clicked');

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen p-4">
      {/* Card Container */}
      <div className="w-full max-w-3xl bg-gradient-to-b from-purple-200 to-purple-100 rounded-3xl p-6 shadow-md">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Info */}
          <div className="bg-white rounded-2xl p-6 flex flex-col justify-center">
            <h2 className="text-5xl font-bold mb-6 break-words overflow-wrap-anywhere">{profile.name}</h2>
            
            <div className="space-y-3">
              <InfoItem icon={<Mic className="w-5 h-5" />} text={profile.role} />
              <InfoItem icon={<Cake className="w-5 h-5" />} text={profile.age} />
              <InfoItem icon={<User className="w-5 h-5" />} text={profile.gender} />
              <InfoItem icon={<Music className="w-5 h-5" />} text={profile.genre} />
              <InfoItem icon={<FileText className="w-5 h-5" />} text={profile.experience} />
            </div>
          </div>

          {/* Right Column - Main Image */}
          <div className="bg-gray-400 rounded-2xl overflow-hidden">
            <img 
              src={profile.mainImage} 
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Concert Image */}
          <div className="bg-gray-400 rounded-2xl overflow-hidden h-48">
            <img 
              src={profile.concertImage} 
              alt="Concert"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Last Song Card */}
          <div className="bg-white rounded-2xl p-4 flex flex-col justify-center p-6">
            <p className="text-lg text-gray-600 mb-2">{profile.lastSongDesc}</p>
            <p className="text-4xl font-semibold">{profile.lastSong}</p>
          </div>
        </div>
      </div>

      {/* Swipe Buttons - Imported from seperate file */}
      <div className="mt-6">
        <SwipeButtons 
          onUndo={handleUndo}
          onReject={handleReject}
          onAccept={handleAccept}
          onSuperLike={handleSuperLike}
        />
      </div>
    </div>
  );
}

function InfoItem({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-gray-700">
        {icon}
      </div>
      <span className="text-xl font-medium">{text}</span>
    </div>
  );
}