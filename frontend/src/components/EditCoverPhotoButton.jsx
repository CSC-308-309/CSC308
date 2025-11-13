// src/components/EditCoverPhotoButton.jsx

import { useRef } from "react";

export default function EditCoverPhotoButton({
  onSelect,
  label = "Edit Cover Photo",
  className = "",
}) {
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onSelect) onSelect(file);
    e.target.value = "";
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`
          w-[170px] h-[40px] rounded-[10px]
          bg-white/90 hover:bg-white
          text-sm font-semibold text-[#7E3AF2]
          shadow ring-1 ring-[#7E3AF2]
          focus-visible:ring-2 focus-visible:ring-[#7E3AF2]
          ${className}
        `}
      >
        {label}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label={label}
      />
    </>
  );
}