// src/hooks/usePresignedImage.js
import { useEffect, useState } from "react";
import { resolveViewUrl, isLocalUrl } from "../utils/s3Upload";

export function usePresignedImage(
  storageKey,
  initialSrc = "",
  fallbackSrc = "",
  options = {},
) {
  const { useStorage = true } = options;
  const [src, setSrc] = useState(fallbackSrc);

  useEffect(() => {
    if (!useStorage) return;
    if (!storageKey) return;

    const hydrateFromStorage = async () => {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;

      try {
        if (isLocalUrl(saved)) {
          setSrc(saved);
          return;
        }
        const viewUrl = await resolveViewUrl(saved);
        setSrc(viewUrl || saved);
      } catch {
        setSrc(saved);
      }
    };

    hydrateFromStorage();
  }, [storageKey, useStorage]);

  useEffect(() => {
    const hydrateFromInitial = async () => {
      if (!initialSrc) {
        setSrc(fallbackSrc);
        return;
      }

      try {
        if (isLocalUrl(initialSrc)) {
          setSrc(initialSrc);
          return;
        }
        const viewUrl = await resolveViewUrl(initialSrc);
        setSrc(viewUrl || initialSrc);
      } catch {
        setSrc(initialSrc);
      }
    };

    hydrateFromInitial();
  }, [initialSrc, fallbackSrc]);

  const handleError = () => {
    setSrc(fallbackSrc);
    if (useStorage && storageKey) {
      localStorage.removeItem(storageKey);
    }
  };

  return { src, setSrc, handleError };
}