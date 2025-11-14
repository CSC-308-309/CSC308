// src/components/EditBioButton.jsx
import { useEffect, useRef, useState } from "react";
import { DEFAULT_PROFILE, normalizeUsername } from "./BioSection";

export default function EditBioButton({
  profileData,
  onSave,
  storageKey = "profileData",
  label = "Edit Profile",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(profileData ?? DEFAULT_PROFILE);
  const backdropRef = useRef(null);

  useEffect(() => {
    if (profileData) setFormData(profileData);
  }, [profileData]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "state" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const merged = {
      ...formData,
      username: normalizeUsername(formData.username),
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(merged));
    } catch {
    }

    onSave?.(merged);
    setOpen(false);
  };

  const handleCancel = () => {
    setFormData(profileData ?? DEFAULT_PROFILE);
    setOpen(false);
  };

  const handleBackdrop = (e) => {
    if (e.target === backdropRef.current) setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`
          w-[170px] h-[40px] rounded-[10px]
          bg-white/90 hover:bg-[#7E3AF2] hover:text-white
          text-sm font-semibold text-[#7E3AF2]
          shadow ring-1 ring-[#7E3AF2]
          focus-visible:ring-2 focus-visible:ring-[#7E3AF2]
          ${className}
        `}
      >
        {label}
      </button>

      {open && (
        <div
          ref={backdropRef}
          onMouseDown={handleBackdrop}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          aria-hidden={false}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Edit profile"
            className="bg-white rounded-2xl w-[500px] p-6 shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Edit Profile
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E3AF2] focus:border-transparent outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pronouns
                </label>
                <input
                  type="text"
                  name="pronouns"
                  value={formData.pronouns || ""}
                  onChange={handleChange}
                  placeholder="e.g., she/her"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E3AF2] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#7E3AF2]">
                  <span className="text-gray-600 pl-3">@</span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username || ""}
                    onChange={handleChange}
                    className="flex-1 px-2 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E3AF2] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state || ""}
                    onChange={handleChange}
                    maxLength={2}
                    className="w-full px-3 py-2 uppercase border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E3AF2] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E3AF2] focus:border-transparent resize-none outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#7E3AF2] text-white font-medium hover:bg-[#6c32d4] transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
