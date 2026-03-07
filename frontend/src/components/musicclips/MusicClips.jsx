// src/components/musicclips/MusicClips.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Star, Plus } from "lucide-react";
import NewMusicClip from "./NewMusicClip";
import MusicClipDetail from "./MusicClipDetail";
import { api } from "../../client";
import { smartResolveUrl } from "../../utils/s3Upload";

function guessTypeFromUrl(url = "") {
  const lower = url.toLowerCase();
  if (
    lower.endsWith(".mp3") ||
    lower.endsWith(".wav") ||
    lower.endsWith(".m4a") ||
    lower.endsWith(".aac") ||
    lower.includes("audio")
  ) {
    return "audio";
  }
  return "video";
}

function normalizeDbClip(row) {
  if (!row) return null;
  const mediaUrl = row.media_url || row.mediaUrl || row.music_clip || "";
  return {
    id: row.id,
    title: row.title || "Music Clip",
    description: row.description || "",
    type: row.type || guessTypeFromUrl(mediaUrl),
    starred: !!row.starred,
    isPlaceholder: false,

    mediaUrl,
    thumbnailUrl: row.thumbnail_url || row.thumbnailUrl || "",

    thumbnailViewUrl: "",
  };
}

export default function MusicClips({ username, userId, canUpload = true }) {
  const [clips, setClips] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClip, setSelectedClip] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [resolvedUserId, setResolvedUserId] = useState(userId ?? null);

  useEffect(() => {
    let cancelled = false;

    async function resolveId() {
      if (userId) {
        setResolvedUserId(userId);
        return;
      }
      if (!username) {
        setResolvedUserId(null);
        return;
      }

      try {
        const user = await api.getByUsername(username);
        if (!cancelled) setResolvedUserId(user?.id ?? null);
      } catch (e) {
        console.error("Failed to resolve userId for music clips:", e);
        if (!cancelled) setResolvedUserId(null);
      }
    }

    resolveId();
    return () => {
      cancelled = true;
    };
  }, [userId, username]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!resolvedUserId) {
        setClips([]);
        return;
      }

      try {
        const res = await api.listMusicClips(resolvedUserId);
        const rows = Array.isArray(res)
          ? res
          : Array.isArray(res?.clips)
            ? res.clips
            : Array.isArray(res?.musicClips)
              ? res.musicClips
              : [];

        const normalized = rows.map(normalizeDbClip).filter(Boolean);

        const withThumbs = await Promise.all(
          normalized.map(async (c) => {
            const thumb = c.thumbnailUrl;
            if (!thumb) return { ...c, thumbnailViewUrl: "" };
            try {
              const view = await smartResolveUrl(thumb);
              return { ...c, thumbnailViewUrl: view || thumb };
            } catch {
              return { ...c, thumbnailViewUrl: thumb };
            }
          }),
        );

        if (!cancelled) setClips(withThumbs);
      } catch (e) {
        console.error("Failed to load music clips:", e);
        if (!cancelled) setClips([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [resolvedUserId]);

  const toggleStar = (id) => {
    setClips((prev) =>
      prev.map((clip) =>
        clip.id === id ? { ...clip, starred: !clip.starred } : clip,
      ),
    );
  };

  const handleSaveClip = async (clipData) => {
    if (!resolvedUserId) return;

    const payload = {
      title: (clipData.title || "").trim(),
      description: (clipData.description || "").trim(),
      media_url: clipData.mediaUrl || "",
      thumbnail_url: clipData.thumbnailUrl || "",
    };

    try {
      const created = await api.createMusicClip(resolvedUserId, payload);
      const row = created?.clip || created?.musicClip || created;

      const normalized = normalizeDbClip({ ...payload, ...row });
      const thumbView = normalized.thumbnailUrl
        ? await smartResolveUrl(normalized.thumbnailUrl)
        : "";

      const newClip = {
        ...normalized,
        thumbnailViewUrl: thumbView || normalized.thumbnailUrl || "",
      };

      setClips((prev) => [newClip, ...prev]);
      setIsModalOpen(false);
    } catch (e) {
      console.error("Failed to save music clip to DB:", e);
      alert(e.message || "Failed to save music clip");
    }
  };

  const handleClipClick = (clip) => {
    setSelectedClip(clip);
    setIsDetailOpen(true);
  };

  const displayClips = useMemo(() => {
    if (clips.length === 0) return [];
    const starred = clips.filter((c) => c.starred);
    if (starred.length > 0) return starred.slice(0, 3);
    return clips.slice(0, 3);
  }, [clips]);

  const handleOpenModal = () => {
    if (!canUpload) return;
    if (!resolvedUserId) {
      alert("You must be logged in to upload a clip.");
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Music Clips</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Display Clips */}
        {displayClips.map((clip) => (
          <div key={clip.id} className="flex flex-col items-start">
            <div
              className="bg-purple-100 rounded-xl relative cursor-pointer hover:brightness-90 transition-all w-[180px] h-[180px] flex items-center justify-center overflow-hidden"
              onClick={() => handleClipClick(clip)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStar(clip.id);
                }}
                className="absolute top-3 right-3 z-10"
                type="button"
              >
                <Star
                  size={20}
                  className={`${
                    clip.starred
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-400"
                  } hover:text-yellow-500 transition-colors`}
                />
              </button>

              {/* Preview */}
              {clip.type === "audio" ? (
                <div className="text-gray-700 font-semibold">🎵 Audio</div>
              ) : (
                <img
                  src={clip.thumbnailViewUrl || clip.thumbnailUrl || ""}
                  alt={clip.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "";
                  }}
                />
              )}
            </div>

            <h3 className="font-semibold text-gray-800 text-sm mt-2">
              {clip.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Updated today</p>
          </div>
        ))}

        {/* Add New Button */}
        {canUpload && (
          <div className="flex flex-col items-start">
            <button
              onClick={handleOpenModal}
              className="bg-[#CCC2DC] rounded-xl p-4 hover:bg-[#A488D1] transition-colors flex items-center justify-center min-h-[180px] w-[180px] group"
              type="button"
            >
              <Plus
                size={32}
                className="text-[#1D1B20] group-hover:text-[#1D1B20]"
              />
            </button>
            <p className="text-sm font-semibold text-gray-800 mt-2 text-left">
              New
            </p>
          </div>
        )}
      </div>

      {canUpload && (
        <NewMusicClip
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveClip}
          username={username}
        />
      )}

      <MusicClipDetail
        clip={selectedClip}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        allClips={clips}
        onToggleStar={toggleStar}
      />
    </div>
  );
}