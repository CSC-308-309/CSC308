// src/utils/imageProcessing.js
async function loadImage(file) {
  const reader = new FileReader();
  const fileData = await new Promise((resolve) => {
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

  const img = new Image();
  img.src = fileData;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error("Image load failed"));
  });

  return img;
}

function drawToCanvas({ img, sx, sy, sWidth, sHeight, dWidth, dHeight }) {
  const canvas = document.createElement("canvas");
  canvas.width = dWidth;
  canvas.height = dHeight;

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight);

  return canvas;
}

async function canvasToBlob(canvas, type = "image/jpeg", quality = 0.92) {
  const blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), type, quality);
  });

  if (!blob) throw new Error("Image processing failed");
  return blob;
}

export async function processImageToSquare(file, size) {
  const img = await loadImage(file);

  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;

  const canvas = drawToCanvas({
    img,
    sx,
    sy,
    sWidth: side,
    sHeight: side,
    dWidth: size,
    dHeight: size,
  });

  return canvasToBlob(canvas);
}

export async function processImageToMaxWidth(file, maxWidth) {
  const img = await loadImage(file);

  const scale = img.width > maxWidth ? maxWidth / img.width : 1;
  const canvas = drawToCanvas({
    img,
    sx: 0,
    sy: 0,
    sWidth: img.width,
    sHeight: img.height,
    dWidth: Math.round(img.width * scale),
    dHeight: Math.round(img.height * scale),
  });

  return canvasToBlob(canvas);
}

export async function generateVideoThumbnail(videoFile, seekTime = null) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const objectUrl = URL.createObjectURL(videoFile);
    video.preload = "metadata";
    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      const targetTime = seekTime ?? Math.min(1, video.duration ? video.duration / 2 : 1);
      video.currentTime = targetTime;
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load video for thumbnail"));
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) return reject(new Error("Failed to create thumbnail blob"));
          resolve(blob);
        },
        "image/jpeg",
        0.8
      );
    };
  });
}

export function isImageFile(file) {
  return file?.type?.startsWith("image/");
}

export function isVideoFile(file) {
  return file?.type?.startsWith("video/");
}

export function isAudioFile(file) {
  return file?.type?.startsWith("audio/");
}