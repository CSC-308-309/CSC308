// src/utils/s3Upload.js
import { api } from "../client";

export async function putToSignedUrl({ uploadUrl, blobOrFile, contentType }) {
  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.withCredentials = false;

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 204) resolve();
      else reject(new Error(`S3 upload failed: ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(blobOrFile);
  });
}

export async function uploadViaPresign({
  kind,
  file,
  userId,
  contentTypeOverride,
}) {
  if (!file) throw new Error("Missing file");
  if (!userId) throw new Error("Missing userId");

  const contentType = contentTypeOverride || file.type || "application/octet-stream";

  const { uploadUrl, fileUrl } = await api.presignUpload({
    kind,
    contentType,
    fileSize: file.size,
    userId,
  });

  if (!uploadUrl || !fileUrl) {
    throw new Error("Backend did not return uploadUrl/fileUrl");
  }

  await putToSignedUrl({ uploadUrl, blobOrFile: file, contentType });

  let viewUrl = fileUrl;
  try {
    const res = await api.presignView({ fileUrl });
    if (res?.viewUrl) viewUrl = res.viewUrl;
  } catch {
  }

  return { fileUrl, viewUrl };
}

export async function resolveViewUrl(fileUrl) {
  if (!fileUrl) return "";
  
  try {
    const { viewUrl } = await api.presignView({ fileUrl });
    return viewUrl || fileUrl;
  } catch (err) {
    console.error("Failed to resolve view URL:", err);
    return fileUrl;
  }
}

export function isLocalUrl(url) {
  if (!url) return false;
  return (
    url.startsWith("blob:") ||
    url.startsWith("data:") ||
    url.startsWith("/") ||
    (url.startsWith("http") && !url.includes(".amazonaws.com/"))
  );
}

export async function smartResolveUrl(url) {
  if (!url || isLocalUrl(url)) return url;
  return resolveViewUrl(url);
}