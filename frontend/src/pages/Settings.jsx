import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { api } from "../client";

export default function Settings() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load current username on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const current = await api.currentUsername();
        setUsername(current.username);
      } catch (err) {
        console.error(err);
      }
    }

    loadUser();
  }, []);

  const handleUsernameUpdate = async () => {
    setError("");
    setMessage("");

    try {
      await api.updateUsername({ username });
      setMessage("Username updated successfully.");
    } catch (err) {
      console.error("Update username error:", err);
      setError("Failed to update username.");
    }
  };

  const handleEmailUpdate = async () => {
    setError("");
    setMessage("");

    try {
      await api.updateEmail({ email });
      setMessage("Email updated successfully.");
    } catch (err) {
      console.error("Update email error:", err);
      setError("Failed to update email.");
    }
  };

  const handlePasswordUpdate = async () => {
    setError("");
    setMessage("");

    try {
      await api.updatePassword({ password });
      setMessage("Password updated successfully.");
      setPassword("");
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

          {/* USERNAME */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">
              Change Username
            </h2>

            <div className="flex gap-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 border rounded-lg px-4 py-2"
              />

              <button
                onClick={handleUsernameUpdate}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
              >
                Save
              </button>
            </div>
          </div>

          {/* EMAIL */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">
              Change Email
            </h2>

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

          {/* PASSWORD */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">
              Change Password
            </h2>

            <div className="flex gap-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 border rounded-lg px-4 py-2"
                placeholder="Enter new password"
              />

              <button
                onClick={handlePasswordUpdate}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
              >
                Save
              </button>
            </div>
          </div>

          {/* Feedback */}
          {message && (
            <p className="text-green-600 font-medium">{message}</p>
          )}

          {error && (
            <p className="text-red-600 font-medium">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
