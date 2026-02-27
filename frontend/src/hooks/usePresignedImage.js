// src/hooks/usePresignedImage.js
import { useEffect, useState } from "react";
import { resolveViewUrl } from "../utils/s3Upload";

export function usePresignedImage(storageKey, initialSrc = "", fallbackSrc = "") {
  const [src, setSrc] = useState(fallbackSrc);

  useEffect(() => {
    const hydrateFromStorage = async () => {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;
      
      try {
        const viewUrl = await resolveViewUrl(saved);
        setSrc(viewUrl);
      } catch {
        setSrc(saved);
      }
    };
    
    hydrateFromStorage();
  }, [storageKey]);

  useEffect(() => {
    const hydrateFromInitial = async () => {
      if (!initialSrc) return;
      
      try {
        const viewUrl = await resolveViewUrl(initialSrc);
        setSrc(viewUrl);
      } catch {
        setSrc(initialSrc);
      }
    };
    
    hydrateFromInitial();
  }, [initialSrc]);

  const handleError = () => {
    setSrc(fallbackSrc);
    localStorage.removeItem(storageKey);
  };

  return { src, setSrc, handleError };
}