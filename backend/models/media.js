import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

// Create S3 client with checksums disabled for browser compatibility
const s3 = new S3Client({ 
  region: process.env.AWS_REGION,
  // This prevents the SDK from adding mandatory checksum parameters to the URL
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED"
});

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

export async function presignUpload(req, res) {
  try {
    const { kind, contentType, fileSize, userId } = req.body;

    const rule = ALLOWED[kind];
    
    if (!rule) return res.status(400).json({ error: "Invalid kind" });
    if (!rule.types.includes(contentType)) return res.status(400).json({ error: "Invalid contentType" });
    if (fileSize > rule.maxBytes) return res.status(400).json({ error: "File too large" });
    if (!userId) return res.status(400).json({ error: "userId required" });

    const key = `${rule.prefix}/${userId}/${uuidv4()}.${extFromType(contentType)}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    // Generate the URL and explicitly sign only the necessary headers
    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 300,
      // By restricting this to host and content-type, we strip out 
      // the problematic x-amz-checksum-crc32 that was causing your 403.
      signableHeaders: new Set(['host', 'content-type']),
    });

    const fileUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    
    return res.json({ uploadUrl, fileUrl, key });
  } catch (e) {
    console.error("Presign PUT error:", e);
    return res.status(500).json({ error: "Failed to create upload URL", details: e.message });
  }
}