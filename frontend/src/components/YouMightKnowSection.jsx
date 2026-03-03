// src/components/YouMightKnowSection.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../client";
import defaultProfilePhoto from "../assets/DefaultProfilePhoto.png";

export const DEFAULT_SUGGESTED_PROFILES = [
  { id: "1", name: "talia", username: "@talia", avatarColor: "#E5D4FF" },
  { id: "2", name: "abeyah", username: "@abeyah", avatarColor: "#FFD6EB" },
  { id: "3", name: "yanitsa", username: "@yanitsa", avatarColor: "#D6F3FF" },
];

function formatHandle(username) {
  if (!username) return "";
  return username.startsWith("@") ? username : `@${username}`;
}

function shouldPresign(rawUrl) {
  const value = String(rawUrl || "").trim();
  if (!value) return false;
  if (value.startsWith("data:") || value.startsWith("blob:")) return false;
  if (value.startsWith("/")) return false;

  try {
    const parsed = new URL(value);
    if (parsed.searchParams.has("X-Amz-Signature")) return false;
    const host = parsed.hostname.toLowerCase();
    return host.endsWith("amazonaws.com");
  } catch {
    return true;
  }
}

async function resolveImage(rawUrl) {
  const value = String(rawUrl || "").trim();
  if (!value) return "";

  if (!shouldPresign(value)) return value;

  try {
    const { viewUrl } = await api.presignViewUrl(value);
    return viewUrl || value;
  } catch {
    return value;
  }
}

export default function YouMightKnowSection({ onProfileClick }) {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadRecentMatches() {
      try {
        setLoading(true);

        const matches = await api.listMatches();
        const top3 = (matches || []).slice(0, 3);

        const hydrated = await Promise.all(
          top3.map(async (u, idx) => {
            const username = u?.username || "";
            const name = u?.name || username || "Unknown";
            const mainImage = await resolveImage(u?.main_image);

            return {
              id: u?.id ?? `${username}-${idx}`,
              name,
              username: formatHandle(username),
              rawUsername: username,
              avatarUrl: mainImage || "",
              avatarColor: ["#E5D4FF", "#FFD6EB", "#D6F3FF"][idx % 3],
            };
          }),
        );

        if (!cancelled) setProfiles(hydrated);
      } catch (e) {
        console.error("Failed to load recent matches:", e);
        if (!cancelled) setProfiles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRecentMatches();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleClick = (user) => {
    if (onProfileClick) return onProfileClick(user);

    const uname = user?.rawUsername || (user?.username || "").replace(/^@/, "");
    if (!uname) return;

    navigate(`/profile/${uname}`);
  };

  return (
    <section aria-label="Recent matches">
      <h3 className="text-lg font-semibold text-[#A41B67] mb-3">
        Recent Matches
      </h3>

      <div className="space-y-4">
        {loading && (
          <div className="text-xs text-gray-500 px-1">Loading…</div>
        )}

        {!loading && profiles.length === 0 && (
          <div className="text-xs text-gray-500 px-1">No matches yet.</div>
        )}

        {!loading &&
          profiles.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleClick(user)}
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
                className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-100"
                style={{ backgroundColor: user.avatarUrl ? "#F3F4F6" : (user.avatarColor || "#E5E7EB") }}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = defaultProfilePhoto;
                    }}
                  />
                ) : null}
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