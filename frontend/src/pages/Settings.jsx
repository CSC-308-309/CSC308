import { useState } from "react";
import Navbar from "../components/Navbar";
import { api } from "../client";

export default function Settings() {
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleEmailUpdate = async () => {
    setError("");
    setMessage("");

    try {
      await api.updateEmail({ email });
      setMessage("Email updated successfully.");
      setEmail("");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (err) {
      console.error("Update email error:", err);
      setError("Failed to update email.");
    }
  };

  const handlePasswordUpdate = async () => {
    setError("");
    setMessage("");

    try {
      await api.updatePassword({ currentPassword, newPassword });
      setMessage("Password updated successfully. Please log in again.");
      setCurrentPassword("");
      setNewPassword("");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (err) {
      console.error("Update password error:", err);
      setError("Failed to update password.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      <Navbar />

      <div className="flex-1 bg-gray-50 p-10 overflow-y-auto">
        <h1 className="text-3xl font-bold text-melodious-pink mb-8">
          Settings
        </h1>

        <div className="max-w-xl space-y-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Change Email</h2>

            <div className="flex gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border rounded-lg px-4 py-2"
                placeholder="Enter new email"
              />

              <button
                onClick={handleEmailUpdate}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
              >
                Save
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>

            <div className="space-y-4">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="Current password"
              />

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="New password"
              />

              <button
                onClick={handlePasswordUpdate}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 w-full"
              >
                Update Password
              </button>
            </div>
          </div>

          {message && <p className="text-green-600 font-medium">{message}</p>}
          {error && <p className="text-red-600 font-medium">{error}</p>}
        </div>
      </div>
    </div>
  );
}
