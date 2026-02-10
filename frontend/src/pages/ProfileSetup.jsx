import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoIcon from "../assets/logo.svg";

const API_BASE = "http://localhost:8000";

const GENRES = [
  "Pop", "Rock", "Hip-Hop", "R&B", "Country", "Jazz", "Classical",
  "Electronic", "Indie", "Metal", "Punk", "Folk", "Soul", "Reggae",
  "Latin", "Blues", "K-Pop", "Other",
];

function parsePositiveInt(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) return NaN;
  return n;
}

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingConcert, setUploadingConcert] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [profile, setProfile] = useState({
    name: "",
    role: "",
    age: "",
    gender: "",
    genre: "",
    experience: "",
    profileImage: "",
    concertImage: "",
    favoriteSong: "",
    songDescription: "",
  });

  const updateField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    setError("");
  };

  function validateStep1() {
    const err = {};
    const name = (profile.name || "").trim();
    if (!name) err.name = "Name is required.";
    if (!profile.role) err.role = "Please select how you show up in music.";
    const age = parsePositiveInt(profile.age);
    if (profile.age !== "" && (age === null || Number.isNaN(age))) err.age = "Please enter a valid whole number.";
    if (profile.age !== "" && age !== null && age < 1) err.age = "Age must be at least 1.";
    if (profile.age === "") err.age = "Age is required.";
    if (!(profile.gender || "").trim()) err.gender = "Gender is required.";
    if (!profile.genre) err.genre = "Please select a genre.";
    const exp = parsePositiveInt(profile.experience);
    if (profile.experience !== "" && (exp === null || Number.isNaN(exp))) err.experience = "Please enter a valid whole number (e.g. 0 or more).";
    if (profile.experience === "") err.experience = "Years of experience is required.";
    setFieldErrors((prev) => ({ ...prev, ...err }));
    return Object.keys(err).length === 0;
  }

  function validateStep2() {
    const err = {};
    if (!(profile.profileImage || "").trim()) err.profileImage = "Please upload a profile photo.";
    if (!(profile.concertImage || "").trim()) err.concertImage = "Please upload a concert image.";
    if (!(profile.favoriteSong || "").trim()) err.favoriteSong = "Favorite song is required.";
    if (!(profile.songDescription || "").trim()) err.songDescription = "Song description is required.";
    setFieldErrors((prev) => ({ ...prev, ...err }));
    return Object.keys(err).length === 0;
  }

<<<<<<< HEAD
  const handleImageUpload = async (e, field) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
=======
  const handleFileChange = async ({
    event,
    fieldName,
    kind,
    maxBytes,
    errorField,
  }) => {
    const file = event.target?.files?.[0];
    if (!file) return;
    setFieldErrors((prev) => ({ ...prev, [errorField]: "" }));
>>>>>>> 8f5a9c5 (fixed database and uploading photos work)
    setError("");

    const userJson = localStorage.getItem("user");
    const user = userJson ? JSON.parse(userJson) : null;
    const username = user?.username;
    if (!username) {
      setError("Not logged in. Please sign in again.");
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
<<<<<<< HEAD
      setFieldErrors((prev) => ({ ...prev, [field]: "Please choose a JPEG, PNG, or WebP image." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors((prev) => ({ ...prev, [field]: "Image must be under 5MB." }));
=======
      setFieldErrors((prev) => ({
        ...prev,
        [errorField]: "Please choose a JPEG, PNG, or WebP image.",
      }));
      return;
    }
    if (file.size > maxBytes) {
      setFieldErrors((prev) => ({
        ...prev,
        [errorField]:
          kind === "cover"
            ? "Image must be under 8MB."
            : "Image must be under 5MB.",
      }));
>>>>>>> 8f5a9c5 (fixed database and uploading photos work)
      return;
    }

    if (fieldName === "concertImage") setUploadingConcert(true);
    else setUploadingProfile(true);
    try {
      const presignRes = await fetch(`${API_BASE}/media/presign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          kind,
          contentType: file.type,
          fileSize: file.size,
          userId: username,
        }),
      });
      if (!presignRes.ok) {
        const data = await presignRes.json().catch(() => ({}));
        throw new Error(data.error || data.details || "Could not get upload URL");
      }
      const { uploadUrl, fileUrl, putHeaders } = await presignRes.json();
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          ...(putHeaders || {}),
        },
        body: file,
      });
      if (!putRes.ok) throw new Error("Upload failed");
<<<<<<< HEAD
      updateField(field, fileUrl);
    } catch (err) {
      setFieldErrors((prev) => ({ ...prev, [field]: err.message || "Upload failed. Try again." }));
=======
      updateField(fieldName, fileUrl);
    } catch (err) {
      setFieldErrors((prev) => ({
        ...prev,
        [errorField]: err.message || "Upload failed. Try again.",
      }));
>>>>>>> 8f5a9c5 (fixed database and uploading photos work)
    } finally {
      if (fieldName === "concertImage") setUploadingConcert(false);
      else setUploadingProfile(false);
      event.target.value = "";
    }
  };

  const handleProfileFileChange = (e) => handleImageUpload(e, "profileImage");
  const handleConcertFileChange = (e) => handleImageUpload(e, "concertImage");

  const goNext = () => {
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleSubmitProfile = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    setError("");

    try {
      const userJson = localStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;
      const username = user?.username;
      if (!username) {
        setError("Not logged in. Please sign in again.");
        return;
      }

      const age = parsePositiveInt(profile.age);
      const experience = parsePositiveInt(profile.experience);
      const payload = {
        username,
        name: (profile.name || "").trim(),
        role: profile.role,
        age: age != null && !Number.isNaN(age) ? age : null,
        gender: (profile.gender || "").trim(),
        genre: profile.genre,
        experience: experience != null && !Number.isNaN(experience) ? experience : null,
        profileImage: (profile.profileImage || "").trim(),
        concert_image: (profile.concertImage || "").trim(),
        favoriteSong: (profile.favoriteSong || "").trim(),
        songDescription: (profile.songDescription || "").trim(),
      };

      const res = await fetch(`${API_BASE}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to create profile");
      }

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#7E5179] flex items-center justify-center">
      <div className="w-[360px]">
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src={logoIcon} alt="Mic" className="w-12 h-12" />
          <h1 className="text-4xl font-semibold text-white font-nunito">
            Melodious
          </h1>
        </div>

        <div className="space-y-3">
          {step === 1 && (
            <>
              <div>
                <Input
                  placeholder="What's your name? *"
                  value={profile.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  aria-invalid={!!fieldErrors.name}
                />
                {fieldErrors.name && <p className="text-red-300 text-sm mt-0.5">{fieldErrors.name}</p>}
              </div>

              <div>
                <select
                  className="w-full p-2 rounded border"
                  value={profile.role}
                  onChange={(e) => updateField("role", e.target.value)}
                  aria-invalid={!!fieldErrors.role}
                >
                  <option value="">How do you show up in music? *</option>
                  <option value="Vocalist">Vocalist</option>
                  <option value="Instrumentalist">Instrumentalist</option>
                  <option value="Producer">Producer</option>
                  <option value="Listener">Listener</option>
                  <option value="Live Music Lover">Live Music Lover</option>
                </select>
                {fieldErrors.role && <p className="text-red-300 text-sm mt-0.5">{fieldErrors.role}</p>}
              </div>

              <div>
                <Input
                  type="number"
                  min={1}
                  placeholder="How old are you? *"
                  value={profile.age}
                  onChange={(e) => updateField("age", e.target.value)}
                  aria-invalid={!!fieldErrors.age}
                />
                {fieldErrors.age && <p className="text-red-300 text-sm mt-0.5">{fieldErrors.age}</p>}
              </div>

              <div>
                <Input
                  placeholder="What's your gender identity? *"
                  value={profile.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                  aria-invalid={!!fieldErrors.gender}
                />
                {fieldErrors.gender && <p className="text-red-300 text-sm mt-0.5">{fieldErrors.gender}</p>}
              </div>

              <div>
                <select
                  className="w-full p-2 rounded border"
                  value={profile.genre}
                  onChange={(e) => updateField("genre", e.target.value)}
                  aria-invalid={!!fieldErrors.genre}
                >
                  <option value="">Favorite genre? *</option>
                  {GENRES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {fieldErrors.genre && <p className="text-red-300 text-sm mt-0.5">{fieldErrors.genre}</p>}
              </div>

              <div>
                <Input
                  type="number"
                  min={0}
                  placeholder="Years of experience? *"
                  value={profile.experience}
                  onChange={(e) => updateField("experience", e.target.value)}
                  aria-invalid={!!fieldErrors.experience}
                />
                {fieldErrors.experience && <p className="text-red-300 text-sm mt-0.5">{fieldErrors.experience}</p>}
              </div>

              <button
                onClick={goNext}
                className="w-full bg-purple-600 text-white py-2 rounded"
              >
                Next
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-white text-sm mb-1">Profile photo *</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                      handleFileChange({
                        event,
                        fieldName: "profileImage",
                        kind: "profile",
                        maxBytes: 5 * 1024 * 1024,
                        errorField: "profileImage",
                      })
                    }
                    disabled={uploadingProfile}
                    className="w-full p-2 rounded border bg-white text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-purple-100 file:text-purple-700"
                  />
                {profile.profileImage && (
                  <p className="text-green-200 text-sm mt-1">Photo added.</p>
                )}
                {fieldErrors.profileImage && <p className="text-red-300 text-sm mt-0.5">{fieldErrors.profileImage}</p>}
                {uploadingProfile && <p className="text-white/80 text-sm">Uploading…</p>}
              </div>

              <div>
                <label className="block text-white text-sm mb-1">Concert image *</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                      handleFileChange({
                        event,
                        fieldName: "concertImage",
                        kind: "cover",
                        maxBytes: 8 * 1024 * 1024,
                        errorField: "concertImage",
                      })
                    }
                    disabled={uploadingConcert}
                    className="w-full p-2 rounded border bg-white text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-purple-100 file:text-purple-700"
                  />
                {profile.concertImage && (
                  <p className="text-green-200 text-sm mt-1">Photo added.</p>
                )}
                {fieldErrors.concertImage && <p className="text-red-300 text-sm mt-0.5">{fieldErrors.concertImage}</p>}
                {uploadingConcert && <p className="text-white/80 text-sm">Uploading…</p>}
              </div>

              <div>
                <label className="block text-white text-sm mb-1">Concert photo</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleConcertFileChange}
                  disabled={uploading}
                  className="w-full p-2 rounded border bg-white text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-purple-100 file:text-purple-700"
                />
                {profile.concertImage && (
                  <p className="text-green-200 text-sm mt-1">Concert photo added.</p>
                )}
                {fieldErrors.concertImage && <p className="text-red-300 text-sm mt-0.5">{fieldErrors.concertImage}</p>}
                {uploading && <p className="text-white/80 text-sm">Uploading…</p>}
              </div>

              <div>
                <Input
                  placeholder="What's the last song you loved? *"
                  value={profile.favoriteSong}
                  onChange={(e) => updateField("favoriteSong", e.target.value)}
                  aria-invalid={!!fieldErrors.favoriteSong}
                />
                {fieldErrors.favoriteSong && <p className="text-red-300 text-sm mt-0.5">{fieldErrors.favoriteSong}</p>}
              </div>

              <div>
                <textarea
                  placeholder="Describe what you like about this song *"
                  className="w-full p-2 rounded border h-24"
                  value={profile.songDescription}
                  onChange={(e) => updateField("songDescription", e.target.value)}
                  aria-invalid={!!fieldErrors.songDescription}
                />
                {fieldErrors.songDescription && <p className="text-red-300 text-sm mt-0.5">{fieldErrors.songDescription}</p>}
              </div>

              {error && (
                <p className="text-red-300 text-sm text-center">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white/20 text-white py-2 rounded"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitProfile}
                  disabled={isLoading}
                  className="flex-1 bg-purple-600 text-white py-2 rounded disabled:opacity-50"
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

function Input({ placeholder, value, onChange, type = "text", min, ...props }) {
  return (
    <input
      type={type}
      min={min}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full p-2 rounded border"
      {...props}
    />
  );
}
