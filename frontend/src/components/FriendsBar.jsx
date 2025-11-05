import { Heart, ChevronDown } from 'lucide-react';

export default function FriendsBar() {
  const friends = [
    { id: 1, name: 'Marco', isFavorite: true },
    { id: 2, name: 'Jacob', isFavorite: false },
    { id: 3, name: 'Jennifer', isFavorite: false },
    { id: 4, name: 'Jazzy', isFavorite: true },
    { id: 5, name: 'Abeyah', isFavorite: false },
    { id: 6, name: 'Yaneli', isFavorite: false },
  ];

  return (
    <div className="flex flex-col w-[280px] h-screen bg-gray-100 p-4">
      {/* Custom Dropdown */}
      <div className="mb-6 flex justify-center">
        <div className="flex w-[255px] h-8 items-center justify-center px-[15px] py-1.5 bg-white rounded-[20px] border border-[#a376a2] relative">
            <ChevronDown className="absolute left-4 w-[15px] h-[15px] text-[#a376a2]" />
            <select 
            className="w-full bg-transparent border-none outline-none text-[#7e5179] font-medium text-sm appearance-none cursor-pointer text-center"
            style={{ fontFamily: 'Nunito, sans-serif' }}
            >
            <option>Concert Buddies</option>
            <option>Close Friends</option>
            <option>Family</option>
            </select>
        </div>
     </div>

      {/* Friends Grid */}
      <div className="grid grid-cols-2 gap-6 p-[20px]">
        {friends.map((friend) => (
          <FriendCard key={friend.id} friend={friend} />
        ))}
      </div>
    </div>
  );
}

function FriendCard({ friend }) {
  return (
    <div className="flex flex-col items-center">
      {/* Box with heart positioned relative to it */}
      <div className="relative w-[83px] h-[83px] bg-[#d9d9d9] rounded-[15px] mb-2">
        {friend.isFavorite && (
          <Heart 
            className="absolute -bottom-2 -right-2 w-6 h-6 text-red-500 fill-red-500 drop-shadow-md"
          />
        )}
      </div>
      
      {/* Name below box */}
      <p className="text-sm font-medium text-gray-800">{friend.name}</p>
    </div>
  );
}