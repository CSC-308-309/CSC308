// src/components/BioSection.jsx
// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_PROFILE = {
  name: 'Your Name',
  age: '', 
  pronouns: '',
  username: '',
  city: '',
  state: '',
  role: '', 
  artistgenre: '',
  yearsofexperience: '',
  bio: '',
};

// eslint-disable-next-line react-refresh/only-export-components
export const normalizeUsername = (u = '') => u.replace(/^@+/, '').trim();

// eslint-disable-next-line react-refresh/only-export-components
export function getInitialProfileData(storageKey = 'profileData') {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export default function BioSection({ profileData = DEFAULT_PROFILE }) {
  const {
  name = '',
  age = '', 
  pronouns = '',
  username = '',
  city = '',
  state = '',
  role = '', 
  artistgenre = '',
  yearsofexperience = '',
  bio = '',
  } = profileData || {};

  const roleParts = [role, artistgenre, yearsofexperience].filter(Boolean);

  return (
    <section aria-label="Profile bio">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#7E3AF2] leading-tight">
            {name}
            {age && ` (${age})`}
          </h1>
          {pronouns && <p className="text-sm text-gray-500 mt-1">{pronouns}</p>}
        </div>
      </header>

      <div className="mt-3 space-y-1">
        {username && <p className="text-sm text-gray-600">@{username}</p>}
        {(city || state) && (
          <p className="text-sm text-gray-600">
            {city}
            {city && state ? ', ' : ''}
            {state}
          </p>
        )}

        {roleParts.length > 0 && (
          <p className="text-sm text-gray-600">
            {roleParts.join(' - ')}
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
