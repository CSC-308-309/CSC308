// src/components/YouMightKnowSection.jsx
export const DEFAULT_SUGGESTED_PROFILES = [
  {
    id: "1",
    name: "talia",
    username: "@talia",
    avatarColor: "#E5D4FF",
  },
  {
    id: "2",
    name: "abeyah",
    username: "@abeyah",
    avatarColor: "#FFD6EB",
  },
  {
    id: "3",
    name: "yanitsa",
    username: "@yanitsa",
    avatarColor: "#D6F3FF",
  },
];

export default function YouMightKnowSection({
  profiles = DEFAULT_SUGGESTED_PROFILES,
  onProfileClick,
}) {
  return (
    <section aria-label="People you might know">
      <h3 className="text-lg font-semibold text-[#7E3AF2] mb-3">
        You might know
      </h3>

      <div className="space-y-4">
        {profiles.map((user) => (
          <button
            key={user.id}
            type="button"
            onClick={() => onProfileClick?.(user)}
            className="
              w-full flex items-center gap-3
              rounded-xl px-1 py-1
              hover:bg-[#7E3AF2]/5
              transition-colors
              text-left
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7E3AF2]
            "
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: user.avatarColor || "#E5E7EB" }}
            >
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 leading-tight">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 leading-tight">
                {user.username}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
