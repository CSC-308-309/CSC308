import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({ region: process.env.AWS_REGION });

const ALLOWED = {
  "profile": { 
    prefix: "public/profile-photos", 
    maxBytes: 5 * 1024 * 1024, 
    types: ["image/jpeg", "image/png", "image/webp"] 
  },
  "cover": { 
    prefix: "public/cover-photos", 
    maxBytes: 8 * 1024 * 1024, 
    types: ["image/jpeg", "image/png", "image/webp"] 
  },
  "video": { 
    prefix: "public/videos", 
    maxBytes: 300 * 1024 * 1024, 
    types: ["video/mp4", "video/webm", "audio/mpeg", "audio/mp4"] 
  }
};

function extFromType(contentType) {
  const map = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "audio/mpeg": "mp3",
    "audio/mp4": "m4a"
  };
  return map[contentType] || "bin";
}

export async function presignUpload(req, res) {
  try {
    const { kind, contentType, fileSize, userId } = req.body;

    console.log("Presign request:", { kind, contentType, fileSize, userId });

    const rule = ALLOWED[kind];
    if (!rule) {
      console.error("Invalid kind:", kind);
      return res.status(400).json({ error: "Invalid kind" });
    }
    
    if (!rule.types.includes(contentType)) {
      console.error("Invalid contentType:", contentType);
      return res.status(400).json({ error: "Invalid contentType" });
    }
    
    if (fileSize > rule.maxBytes) {
      console.error("File too large:", fileSize);
      return res.status(400).json({ error: "File too large" });
    }
    
    if (!userId) {
      console.error("Missing userId");
      return res.status(400).json({ error: "userId required" });
    }

    const key = `${rule.prefix}/${userId}/${uuidv4()}.${extFromType(contentType)}`;

    const post = await createPresignedPost(s3, {
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Expires: 60,
        Conditions: [
            ["content-length-range", 1, rule.maxBytes],
            ["eq", "$Content-Type", contentType]
        ],
        Fields: {
            "Content-Type": contentType
        }
        });

        const fileUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        res.json({
        upload: post,  
        fileUrl,
        key
        });

  } catch (e) {
    console.error("Presign error:", e);
    res.status(500).json({ error: "Failed to create upload URL", details: e.message });
  }
}