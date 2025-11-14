// src/components/BioSection.jsx
export const DEFAULT_PROFILE = {
  name: "Your Name",
  pronouns: "",
  username: "",
  city: "",
  state: "",
  bio: "",
};

export const normalizeUsername = (u = "") => u.replace(/^@+/, "").trim();

export function getInitialProfileData(storageKey = "profileData") {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export default function BioSection({ profileData = DEFAULT_PROFILE }) {
  const {
    name = "",
    pronouns = "",
    username = "",
    city = "",
    state = "",
    bio = "",
  } = profileData || {};

  return (
    <section aria-label="Profile bio">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#7E3AF2] leading-tight">
            {name}
          </h1>
          {pronouns && (
            <p className="text-sm text-gray-500 mt-1">{pronouns}</p>
          )}
        </div>
      </header>

      <div className="mt-3 space-y-1">
        {username && (
          <p className="text-sm text-gray-600">@{username}</p>
        )}
        {(city || state) && (
          <p className="text-sm text-gray-600">
            {city}
            {city && state ? ", " : ""}
            {state}
          </p>
        )}
      </div>

      {bio && (
        <p className="text-sm text-gray-800 leading-relaxed mt-4 whitespace-pre-line">
          {bio}
        </p>
      )}
    </section>
  );
}
