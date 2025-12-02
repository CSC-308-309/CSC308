// src/components/EditBioButton.jsx
import { useState } from "react";
import { DEFAULT_PROFILE, normalizeUsername } from "./BioSection";
import EditProfileModal from "./EditProfileModal";

export default function EditBioButton({
  profileData,
  onSave,
  storageKey = 'profileData',
  label = 'Edit Profile',
  className = '',
}) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSaveFromModal = (updated) => {
    const merged = {
      ...(profileData ?? DEFAULT_PROFILE),
      ...updated,
      username: normalizeUsername(updated.username),
      state: (updated.state || "").toUpperCase(),
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(merged));
    } catch {}

    onSave?.(merged);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`
          w-[170px] h-[40px] rounded-[10px]
          bg-white/90 hover:bg-[#A41B67] hover:text-white
          text-sm font-semibold text-[#A41B67]
          shadow ring-1 ring-[#A41B67]
          focus-visible:ring-2 focus-visible:ring-[#A41B67]
          ${className}
        `}
      >
        {label}
      </button>

      <EditProfileModal
        isOpen={open}
        onClose={handleClose}
        profileData={profileData ?? DEFAULT_PROFILE}
        onSave={handleSaveFromModal}
      />
    </>
  );
}
