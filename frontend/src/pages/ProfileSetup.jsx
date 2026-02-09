import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoIcon from "../assets/logo.svg";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    role: "",
    age: "",
    gender: "",
    experience: "",
    profileImage: "",
    favoriteSong: "",
    songDescription: "",
  });

  const updateField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitProfile = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error("Failed to create profile");

      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#7E5179] flex items-center justify-center">
      <div className="w-[360px]">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src={logoIcon} alt="Mic" className="w-12 h-12" />
          <h1 className="text-4xl font-semibold text-white font-nunito">
            Melodious
          </h1>
        </div>

        {/* Card */}
        <div className="space-y-3">
          {step === 1 && (
            <>
              <Input
                placeholder="What's your name?"
                value={profile.name}
                onChange={(e) => updateField("name", e.target.value)}
              />

              <select
                className="w-full p-2 rounded border"
                value={profile.role}
                onChange={(e) => updateField("role", e.target.value)}
              >
                <option value="">How do you show up in music?</option>
                <option>Vocalist</option>
                <option>Instrumentalist</option>
                <option>Producer</option>
                <option>Listener</option>
                <option>Live Music Lover</option>
              </select>

              <Input
                placeholder="How old are you?"
                value={profile.age}
                onChange={(e) => updateField("age", e.target.value)}
              />

              <Input
                placeholder="What's your gender identity?"
                value={profile.gender}
                onChange={(e) => updateField("gender", e.target.value)}
              />

              <Input
                placeholder="How many years of experience do you have?"
                value={profile.experience}
                onChange={(e) => updateField("experience", e.target.value)}
              />

              <button
                onClick={() => setStep(2)}
                className="w-full bg-purple-600 text-white py-2 rounded"
              >
                Next
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <Input
                placeholder="Add a profile photo (image URL)"
                value={profile.profileImage}
                onChange={(e) =>
                  updateField("profileImage", e.target.value)
                }
              />

              <Input
                placeholder="What's the last song you loved?"
                value={profile.favoriteSong}
                onChange={(e) =>
                  updateField("favoriteSong", e.target.value)
                }
              />

              <textarea
                placeholder="Describe what you like about this song"
                className="w-full p-2 rounded border h-24"
                value={profile.songDescription}
                onChange={(e) =>
                  updateField("songDescription", e.target.value)
                }
              />

              {error && (
                <p className="text-red-300 text-sm text-center">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/2 bg-white/20 text-white py-2 rounded"
                >
                  Back
                </button>

                <button
                  onClick={handleSubmitProfile}
                  disabled={isLoading}
                  className="w-1/2 bg-purple-600 text-white py-2 rounded"
                >
                  {isLoading ? "Saving..." : "Finish"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ placeholder, value, onChange }) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full p-2 rounded border"
    />
  );
}
