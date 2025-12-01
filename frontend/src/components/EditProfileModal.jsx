// src/components/EditProfileModal.jsx

import { useState, useEffect } from "react";
const isValidPlaylistLink = (link = "") => {
  const trimmed = link.trim();
  if (!trimmed) return true;
  return (
    trimmed.includes("music.apple.com") ||
    trimmed.includes("open.spotify.com")
  );
};

export default function EditProfileModal({
  isOpen,
  onClose,
  profileData = {},
  onSave,
}) {
  const [formData, setFormData] = useState(profileData);

  useEffect(() => {
    if (isOpen) {
      setFormData(profileData || {});
    }
  }, [isOpen, profileData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setFormData(profileData || {});
    onClose && onClose();
  };

  const playlistValid = isValidPlaylistLink(formData.playlistLink || "");
  const isSaveDisabled = !playlistValid;

  const handleSubmit = (e) => {
    e.preventDefault();

    // block save if playlist link invalid
    if (!playlistValid) return;

    onSave && onSave(formData);
    onClose && onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[500px] p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Edit Profile</h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="text"
                name="age"
                value={formData.age || ""}
                onChange={handleChange}
                placeholder="e.g., 24"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E3AF2] focus:border-transparent outline-none"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E3AF2] focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role || ""}
                  onChange={handleChange}
                  placeholder="e.g., Drummer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E3AF2] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Artist Genre
                </label>
                <input
                  type="text"
                  name="artistgenre"
                  value={formData.artistgenre || ""}
                  onChange={handleChange}
                  placeholder="e.g., Rock, Country"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E3AF2] focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience
              </label>
              <input
                type="text"
                name="yearsofexperience"
                value={formData.yearsofexperience || ""}
                onChange={handleChange}
                placeholder="e.g., 3 years"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E3AF2] focus:border-transparent outline-none"
              />
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
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mt-8 mb-4">
            About
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Top Interests
              </label>
              <input
                type="text"
                name="topInterests"
                value={formData.topInterests || ""}
                onChange={handleChange}
                placeholder="indie rock, vinyl collector, live shows"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E3AF2] focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Separate interests with commas.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Favorite / Top Artist(s)
              </label>
              <input
                type="text"
                name="favoriteArtists"
                value={formData.favoriteArtists || ""}
                onChange={handleChange}
                placeholder="Artist 1, Artist 2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E3AF2] focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Separate artists with commas.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Favorite Music Genres
              </label>
              <input
                type="text"
                name="favoriteGenres"
                value={formData.favoriteGenres || ""}
                onChange={handleChange}
                placeholder="indie rock, pop, jazz"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E3AF2] focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Separate genres with commas.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apple / Spotify Playlist Link
              </label>
              <input
                type="url"
                name="playlistLink"
                value={formData.playlistLink || ""}
                onChange={handleChange}
                placeholder="https://open.spotify.com/"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7E3AF2] focus:border-transparent outline-none ${
                  playlistValid ? "border-gray-300" : "border-red-400"
                }`}
              />
              {!playlistValid && (
                <p className="text-xs text-red-500 mt-1">
                  Enter a valid Spotify or Apple Music link.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meetup Locations
              </label>
              <textarea
                name="meetupLocations"
                value={formData.meetupLocations || ""}
                onChange={handleChange}
                rows={3}
                placeholder="Neighborhoods, venues, cities..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E3AF2] focus:border-transparent resize-none outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability
              </label>
              <textarea
                name="availability"
                value={formData.availability || ""}
                onChange={handleChange}
                rows={6}
                placeholder="e.g. Weeknights after 7pm, Saturday afternoons, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E3AF2] focus:border-transparent resize-none outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaveDisabled}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isSaveDisabled
                  ? "bg-gray-300 text-white cursor-not-allowed"
                  : "bg-[#7E3AF2] text-white hover:bg-[#6c32d4]"
              }`}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
