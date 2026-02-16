// src/hooks/usePresignedUrl.js
import { useEffect, useState } from "react";
import { smartResolveUrl } from "../utils/s3Upload";

export function usePresignedUrl(rawUrl, shouldResolve = true) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      setUrl("");
      if (!shouldResolve || !rawUrl) return;

      try {
        const resolved = await smartResolveUrl(rawUrl);
        if (!cancelled) setUrl(resolved);
      } catch (err) {
        console.error("Failed to resolve URL:", err);
        if (!cancelled) setUrl(rawUrl);
      }
    };

    resolve();

    return () => {
      cancelled = true;
    };
  }, [rawUrl, shouldResolve]);

  return url;
}