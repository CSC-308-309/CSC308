// src/hooks/useMediaUpload.js
import { useState } from "react";
import { uploadViaPresign } from "../utils/s3Upload";
import { generateVideoThumbnail } from "../utils/imageProcessing";

export function useMediaUpload(username, defaultThumbnail = "") {
  const [isUploading, setIsUploading] = useState(false);

  const uploadMedia = async ({ file, kind = "video" }) => {
    if (!file) throw new Error("Missing file");
    if (!username) throw new Error("Missing username (used as userId)");

    setIsUploading(true);

    try {
      const main = await uploadViaPresign({
        kind,
        file,
        userId: username,
      });

      let thumb = { fileUrl: "", viewUrl: defaultThumbnail };

      if (file.type.includes("video")) {
        const thumbBlob = await generateVideoThumbnail(file);
        const thumbFile = new File([thumbBlob], "thumb.jpg", {
          type: "image/jpeg",
        });

        thumb = await uploadViaPresign({
          kind: "videoThumb",
          file: thumbFile,
          userId: username,
        });
      }

      return {
        mediaUrl: main.fileUrl,
        mediaViewUrl: main.viewUrl,
        thumbnailUrl: thumb.fileUrl || "",
        thumbnailViewUrl: thumb.viewUrl || defaultThumbnail,
        type: file.type.includes("audio") ? "audio" : "video",
      };
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadMedia, isUploading };
}