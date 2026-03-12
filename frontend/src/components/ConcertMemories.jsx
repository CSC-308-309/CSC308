// src/components/ConcertMemories.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Star, Plus } from "lucide-react";
import ConcertIcon from "../assets/concert.svg";
import NewConcertMemory from "./NewConcertMemory";
import ConcertMemoryDetail from "./ConcertMemoryDetail";
import { api } from "../client";
import { smartResolveUrl } from "../utils/s3Upload";

function makePlaceholders() {
  return [1, 2, 3].map((id) => ({
    id,
    title: "Concert Memories",
    updatedToday: true,
    starred: false,
    thumbnailViewUrl: ConcertIcon,
    isPlaceholder: true,
  }));
}

function normalizeDbMemory(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title || "Concert Memory",
    description: row.description || "",
    updatedToday: true,
    starred: !!row.is_starred,
    isPlaceholder: false,
    mediaUrl: row.video_url || "",
    thumbnailUrl: row.thumbnail_url || "",
    thumbnailViewUrl: "",
  };
}

export default function ConcertMemories({
  username,
  userId,
  canUpload = true,
}) {
  const [memories, setMemories] = useState(() => makePlaceholders());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

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
        console.error("Failed to resolve userId:", e);
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
        setMemories(makePlaceholders());
        return;
      }

      try {
        const res = await api.listConcertMemories(resolvedUserId);

        const rows = Array.isArray(res)
          ? res
          : Array.isArray(res?.memories)
            ? res.memories
            : Array.isArray(res?.concertMemories)
              ? res.concertMemories
              : Array.isArray(res?.data)
                ? res.data
                : [];

        const normalized = rows.map(normalizeDbMemory).filter(Boolean);

        const withThumbs = await Promise.all(
          normalized.map(async (m) => {
            if (!m.thumbnailUrl) {
              return { ...m, thumbnailViewUrl: ConcertIcon };
            }
            try {
              const view = await smartResolveUrl(m.thumbnailUrl);
              return {
                ...m,
                thumbnailViewUrl: view || m.thumbnailUrl || ConcertIcon,
              };
            } catch {
              return {
                ...m,
                thumbnailViewUrl: m.thumbnailUrl || ConcertIcon,
              };
            }
          }),
        );

        if (!cancelled) {
          setMemories(withThumbs.length ? withThumbs : makePlaceholders());
        }
      } catch (e) {
        console.error("Failed to load concert memories:", e);
        if (!cancelled) setMemories(makePlaceholders());
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [resolvedUserId]);

  const toggleStar = async (id) => {
    if (!canUpload) return;

    const target = memories.find((m) => m.id === id);
    if (!target || target.isPlaceholder) return;

    const newValue = !target.starred;

    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, starred: newValue } : m)),
    );

    try {
      await api.updateConcertMemory(id, { is_starred: newValue });
    } catch (e) {
      console.warn("Failed to persist star:", e);
    }
  };

  const handleNewClick = () => {
    if (!canUpload) return;
    if (!resolvedUserId) {
      alert("You must be logged in to upload.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleSaveMemory = async (memoryData) => {
    if (!resolvedUserId) return;

    const payload = {
      title: (memoryData.title || "").trim(),
      description: (memoryData.description || "").trim(),
      video_url: memoryData.mediaUrl || "",
      thumbnail_url: memoryData.thumbnailUrl || "",
    };

    try {
      const created = await api.createConcertMemory(resolvedUserId, payload);
      const normalized = normalizeDbMemory({ ...payload, ...created });

      const thumbView = normalized.thumbnailUrl
        ? await smartResolveUrl(normalized.thumbnailUrl)
        : ConcertIcon;

      const newMemory = {
        ...normalized,
        thumbnailViewUrl: thumbView || normalized.thumbnailUrl || ConcertIcon,
      };

      setMemories((prev) => {
        const real = prev.filter((m) => !m.isPlaceholder);
        return [newMemory, ...real];
      });

      setIsModalOpen(false);
    } catch (e) {
      console.error("Failed to save memory:", e);
      alert(e.message || "Failed to save memory");
    }
  };

  const handleMemoryClick = (memory) => {
    setSelectedMemory(memory);
    setShowDetail(true);
  };

  const displayMemories = useMemo(() => {
    const real = memories.filter((m) => !m.isPlaceholder);

    if (real.length === 0) {
      return memories.filter((m) => m.isPlaceholder).slice(0, 3);
    }

    const starred = real.filter((m) => m.starred);

    const curated = starred.length > 0 ? starred : real;

    return curated.slice(0, 3);
  }, [memories]);

  return (
    <div className="max-w-4xl mx-auto bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Concert Memories</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {displayMemories.map((memory) => (
          <div key={memory.id} className="flex flex-col items-start">
            <div
              className="bg-purple-100 rounded-xl relative hover:shadow-md transition-shadow cursor-pointer w-[180px] h-[180px] flex items-center justify-center overflow-hidden"
              onClick={() => handleMemoryClick(memory)}
            >
              {canUpload && !memory.isPlaceholder && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(memory.id);
                  }}
                  className="absolute top-3 right-3 z-10"
                  type="button"
                >
                  <Star
                    size={20}
                    className={`${
                      memory.starred
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-gray-400"
                    } hover:text-yellow-500 transition-colors`}
                  />
                </button>
              )}

              <img
                src={
                  memory.thumbnailViewUrl || memory.thumbnailUrl || ConcertIcon
                }
                alt="Memory"
                className="w-full h-full object-cover opacity-90"
              />
            </div>

            <h3 className="font-semibold text-gray-800 text-sm mt-2">
              {memory.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Updated today</p>
          </div>
        ))}

        {canUpload && (
          <div className="flex flex-col items-start">
            <button
              onClick={handleNewClick}
              className="bg-[#CCC2DC] rounded-xl p-4 hover:bg-[#A488D1] transition-colors flex items-center justify-center min-h-[180px] w-[180px]"
              type="button"
            >
              <Plus size={32} className="text-[#1D1B20]" />
            </button>
            <p className="text-sm font-semibold text-gray-800 mt-2 text-left">
              New
            </p>
          </div>
        )}
      </div>

      {canUpload && (
        <NewConcertMemory
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveMemory}
          username={username}
        />
      )}

      <ConcertMemoryDetail
        memory={selectedMemory}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        allMemories={memories}
        onToggleStar={canUpload ? toggleStar : undefined}
      />
    </div>
  );
}
