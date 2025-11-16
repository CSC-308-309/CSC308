// src/components/EditProfileModal.jsx
import { useState } from 'react';

export default function EditProfileModal({
  isOpen,
  onClose,
  profileData,
  onSave,
}) {
  const [formData, setFormData] = useState(profileData);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  const handleCancel = () => {
    setFormData(profileData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[500px] p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Edit Profile</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
              value={formData.pronouns}
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
                value={formData.username}
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
                value={formData.city}
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
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E3AF2] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E3AF2] focus:border-transparent resize-none outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={handleCancel}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-[#7E3AF2] text-white font-medium hover:bg-[#6c32d4] transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
