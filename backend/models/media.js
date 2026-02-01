// models/media.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

// ---------- helpers ----------
function env(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) throw new Error(`Missing environment variable: ${name}`);
  return String(v).trim();
}

function makeS3Client() {
  const region = env("AWS_REGION");
  const accessKeyId = env("AWS_ACCESS_KEY_ID");
  const secretAccessKey = env("AWS_SECRET_ACCESS_KEY");

  const sessionTokenRaw = process.env.AWS_SESSION_TOKEN;
  const sessionToken =
    sessionTokenRaw && String(sessionTokenRaw).trim()
      ? String(sessionTokenRaw).trim()
      : undefined;

  const credentials = sessionToken
    ? { accessKeyId, secretAccessKey, sessionToken }
    : { accessKeyId, secretAccessKey };

  return new S3Client({ region, credentials });
}

// ---------- config ----------
const ALLOWED = {
  cover: {
    prefix: "public/cover-photos",
    maxBytes: 8 * 1024 * 1024,
    types: ["image/jpeg", "image/png", "image/webp"],
  },
  profile: {
    prefix: "public/profile-photos",
    maxBytes: 5 * 1024 * 1024,
    types: ["image/jpeg", "image/png", "image/webp"],
  },
  video: {
    prefix: "public/videos",
    maxBytes: 300 * 1024 * 1024,
    types: ["video/mp4", "video/webm", "audio/mpeg", "audio/mp4"],
  },
};

function extFromType(contentType) {
  const map = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "audio/mpeg": "mp3",
    "audio/mp4": "m4a",
  };
  return map[contentType] || "bin";
}

// ---------- route handler ----------
export async function presignUpload(req, res) {
  try {
    const { kind, contentType, fileSize, userId } = req.body;

    const rule = ALLOWED[kind];
    if (!rule) return res.status(400).json({ error: "Invalid kind" });
    if (!rule.types.includes(contentType)) return res.status(400).json({ error: "Invalid contentType" });
    if (fileSize > rule.maxBytes) return res.status(400).json({ error: "File too large" });
    if (!userId) return res.status(400).json({ error: "userId required" });

    const bucket = env("S3_BUCKET");
    const region = env("AWS_REGION");

    const key = `${rule.prefix}/${userId}/${uuidv4()}.${extFromType(contentType)}`;

    const s3 = makeS3Client();

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      // From the SO idea: if you sign ContentType, the PUT must send that exact header.
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return res.json({ uploadUrl, fileUrl, key });
  } catch (e) {
    console.error("Presign PUT error:", e);
    return res.status(500).json({
      error: "Failed to create upload URL",
      details: e?.message || String(e),
    });
  }
}
