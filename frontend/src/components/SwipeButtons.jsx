import { Undo, X, Check, Heart } from 'lucide-react';

export default function SwipeButtons({ onUndo, onReject, onAccept, onSuperLike }) {
  return (
    <div className="flex gap-4 justify-center">
      <ActionButton 
        icon={<Undo className="w-7 h-7" />} 
        bgColor="bg-[#F3EDF7]"
        hoverColor="hover:bg-gray-300"
        size="large"
        onClick={onUndo}
      />
      <ActionButton 
        icon={<X className="w-7 h-7" />} 
        bgColor="bg-purple-300"
        hoverColor="hover:bg-purple-400"
        size="large"
        onClick={onReject}
      />
      <ActionButton 
        icon={<Check className="w-7 h-7" />} 
        bgColor="bg-green-300"
        hoverColor="hover:bg-green-400"
        size="large"
        onClick={onAccept}
      />
      <ActionButton 
        icon={<Heart className="w-7 h-7" />} 
        bgColor="bg-[#FFCCD7]"
        hoverColor="hover:bg-pink-400"
        size="large"
        onClick={onSuperLike}
      />
    </div>
  );
}

function ActionButton({ icon, bgColor, hoverColor, size = "normal", onClick }) {
  const sizeClasses = size === "large" 
    ? "w-16 h-16" 
    : "w-14 h-14";

  return (
    <button 
      onClick={onClick}
      className={`${sizeClasses} ${bgColor} ${hoverColor} rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-lg`}
    >
      {icon}
    </button>
  );
}