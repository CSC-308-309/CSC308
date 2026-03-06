import { presignUpload, presignView } from "../../models/media.js";

const mockGetSignedUrl = jest.fn();
const mockSend = jest.fn();

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: mockSend })),
  PutObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
  GetObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
}));

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: (...args) => mockGetSignedUrl(...args),
}));

jest.mock("uuid", () => ({
  v4: () => "test-uuid-1234",
}));


// Helpers

/** Build a minimal Express-like req/res pair */
function makeReqRes(body = {}) {
  const req = { body };
  const res = {
    _status: 200,
    _body: null,
    status(code) {
      this._status = code;
      return this;            // allows res.status(400).json(...)
    },
    json(data) {
      this._body = data;
      return this;
    },
  };
  return { req, res };
}

/** Set required env vars */
function setEnv(overrides = {}) {
  const defaults = {
    AWS_REGION: "us-east-1",
    AWS_ACCESS_KEY_ID: "fake-key",
    AWS_SECRET_ACCESS_KEY: "fake-secret",
    S3_BUCKET: "my-test-bucket",
  };
  Object.assign(process.env, defaults, overrides);
}

/** Delete env vars */
function clearEnv(...names) {
  names.forEach((n) => delete process.env[n]);
}

// ─── presignUpload ────────────────────────────────────────────────────────────

describe("presignUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setEnv();
    mockGetSignedUrl.mockResolvedValue("https://s3.example.com/signed-upload");
  });

  afterEach(() => {
    clearEnv("AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "S3_BUCKET");
  });

  // ── Happy paths ──────────────────────────────────────────────────────────

  test("returns uploadUrl, fileUrl, and key for a valid profile image upload", async () => {
    const { req, res } = makeReqRes({
      kind: "profile",
      contentType: "image/jpeg",
      fileSize: 1 * 1024 * 1024, // 1 MB
      userId: "user-42",
    });

    await presignUpload(req, res);

    expect(res._status).toBe(200);
    expect(res._body.uploadUrl).toBe("https://s3.example.com/signed-upload");
    expect(res._body.key).toBe(
      "public/profile-photos/user-42/test-uuid-1234.jpg"
    );
    expect(res._body.fileUrl).toBe(
      "https://my-test-bucket.s3.us-east-1.amazonaws.com/public/profile-photos/user-42/test-uuid-1234.jpg"
    );
  });

  test("returns correct key prefix for each allowed kind", async () => {
    const cases = [
      { kind: "cover",      prefix: "public/cover-photos",      contentType: "image/png",  fileSize: 1e6 },
      { kind: "profile",    prefix: "public/profile-photos",    contentType: "image/webp", fileSize: 1e6 },
      { kind: "video",      prefix: "public/videos",            contentType: "video/mp4",  fileSize: 1e6 },
      { kind: "videoThumb", prefix: "public/video-thumbnails",  contentType: "image/jpeg", fileSize: 1e6 },
    ];

    for (const { kind, prefix, contentType, fileSize } of cases) {
      jest.clearAllMocks();
      mockGetSignedUrl.mockResolvedValue("https://s3.example.com/signed");

      const { req, res } = makeReqRes({ kind, contentType, fileSize, userId: "u1" });
      await presignUpload(req, res);

      expect(res._body.key).toMatch(new RegExp(`^${prefix}/`));
    }
  });

  test("signed URL is requested with 300 second expiry", async () => {
    const { req, res } = makeReqRes({
      kind: "profile",
      contentType: "image/jpeg",
      fileSize: 100,
      userId: "u1",
    });

    await presignUpload(req, res);

    // Second argument to getSignedUrl is the command, third is options
    const options = mockGetSignedUrl.mock.calls[0][2];
    expect(options.expiresIn).toBe(300);
  });

  // ── Validation errors ───

  test("returns 400 for an unknown kind", async () => {
    const { req, res } = makeReqRes({
      kind: "avatar",            // not in ALLOWED
      contentType: "image/jpeg",
      fileSize: 100,
      userId: "u1",
    });

    await presignUpload(req, res);

    expect(res._status).toBe(400);
    expect(res._body.error).toBe("Invalid kind");
  });

  test("returns 400 when contentType is not allowed for the kind", async () => {
    const { req, res } = makeReqRes({
      kind: "profile",
      contentType: "image/gif",  // gif not in allowed types
      fileSize: 100,
      userId: "u1",
    });

    await presignUpload(req, res);

    expect(res._status).toBe(400);
    expect(res._body.error).toBe("Invalid contentType");
  });

  test("returns 400 when file exceeds size limit for profile (5 MB)", async () => {
    const { req, res } = makeReqRes({
      kind: "profile",
      contentType: "image/jpeg",
      fileSize: 6 * 1024 * 1024, // 6 MB — over the 5 MB limit
      userId: "u1",
    });

    await presignUpload(req, res);

    expect(res._status).toBe(400);
    expect(res._body.error).toBe("File too large");
  });

  test("returns 400 when file exceeds size limit for video (300 MB)", async () => {
    const { req, res } = makeReqRes({
      kind: "video",
      contentType: "video/mp4",
      fileSize: 301 * 1024 * 1024, // over 300 MB
      userId: "u1",
    });

    await presignUpload(req, res);

    expect(res._status).toBe(400);
    expect(res._body.error).toBe("File too large");
  });

  test("returns 400 when userId is missing", async () => {
    const { req, res } = makeReqRes({
      kind: "profile",
      contentType: "image/jpeg",
      fileSize: 100,
      // userId omitted
    });

    await presignUpload(req, res);

    expect(res._status).toBe(400);
    expect(res._body.error).toBe("userId required");
  });

  // ── Environment errors ──

  test("returns 500 when S3_BUCKET env var is missing", async () => {
    clearEnv("S3_BUCKET");

    const { req, res } = makeReqRes({
      kind: "profile",
      contentType: "image/jpeg",
      fileSize: 100,
      userId: "u1",
    });

    await presignUpload(req, res);

    expect(res._status).toBe(500);
    expect(res._body.error).toBe("Failed to create upload URL");
  });

  test("returns 500 when getSignedUrl throws", async () => {
    mockGetSignedUrl.mockRejectedValue(new Error("AWS network failure"));

    const { req, res } = makeReqRes({
      kind: "profile",
      contentType: "image/jpeg",
      fileSize: 100,
      userId: "u1",
    });

    await presignUpload(req, res);

    expect(res._status).toBe(500);
    expect(res._body.error).toBe("Failed to create upload URL");
    expect(res._body.details).toBe("AWS network failure");
  });

  // ── File extension mapping ──

  test.each([
    ["image/jpeg", "jpg"],
    ["image/png",  "png"],
    ["image/webp", "webp"],
    ["video/mp4",  "mp4"],
    ["video/webm", "webm"],
  ])(
    "key has correct extension for contentType %s → .%s",
    async (contentType, expectedExt) => {
      mockGetSignedUrl.mockResolvedValue("https://s3.example.com/signed");

      // Pick a kind that supports this contentType
      const kind = contentType.startsWith("video") ? "video" : "profile";
      const { req, res } = makeReqRes({ kind, contentType, fileSize: 100, userId: "u1" });

      await presignUpload(req, res);

      expect(res._body.key).toMatch(new RegExp(`\\.${expectedExt}$`));
    }
  );
});

// ─── presignView ──

describe("presignView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setEnv();
    mockGetSignedUrl.mockResolvedValue("https://s3.example.com/signed-view");
  });

  afterEach(() => {
    clearEnv("AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "S3_BUCKET");
  });

  // ── Happy paths ──

  test("returns viewUrl and key when a plain S3 key is provided", async () => {
    const { req, res } = makeReqRes({
      key: "public/profile-photos/user-42/test-uuid-1234.jpg",
    });

    await presignView(req, res);

    expect(res._status).toBe(200);
    expect(res._body.viewUrl).toBe("https://s3.example.com/signed-view");
    expect(res._body.key).toBe(
      "public/profile-photos/user-42/test-uuid-1234.jpg"
    );
  });

  test("extracts the S3 key from a full HTTPS fileUrl", async () => {
    const { req, res } = makeReqRes({
      fileUrl:
        "https://my-test-bucket.s3.us-east-1.amazonaws.com/public/videos/u1/test-uuid-1234.mp4",
    });

    await presignView(req, res);

    expect(res._body.key).toBe("public/videos/u1/test-uuid-1234.mp4");
  });

  test("uses default TTL of 3600 when expiresIn is not provided", async () => {
    const { req, res } = makeReqRes({
      key: "public/profile-photos/u1/photo.jpg",
    });

    await presignView(req, res);

    const options = mockGetSignedUrl.mock.calls[0][2];
    expect(options.expiresIn).toBe(3600);
  });

  test("respects a custom expiresIn value", async () => {
    const { req, res } = makeReqRes({
      key: "public/profile-photos/u1/photo.jpg",
      expiresIn: 7200,
    });

    await presignView(req, res);

    const options = mockGetSignedUrl.mock.calls[0][2];
    expect(options.expiresIn).toBe(7200);
  });

  test("clamps expiresIn to 60 when a value below the minimum is given", async () => {
    const { req, res } = makeReqRes({
      key: "public/profile-photos/u1/photo.jpg",
      expiresIn: 10,           // below 60 minimum
    });

    await presignView(req, res);

    const options = mockGetSignedUrl.mock.calls[0][2];
    expect(options.expiresIn).toBe(60);
  });

  test("clamps expiresIn to 7 days when a value above the maximum is given", async () => {
    const { req, res } = makeReqRes({
      key: "public/profile-photos/u1/photo.jpg",
      expiresIn: 999999,       // above 7-day max
    });

    await presignView(req, res);

    const options = mockGetSignedUrl.mock.calls[0][2];
    expect(options.expiresIn).toBe(7 * 24 * 3600);
  });

  // ── Validation errors ──
  test("returns 400 when neither key nor fileUrl is provided", async () => {
    const { req, res } = makeReqRes({});

    await presignView(req, res);

    expect(res._status).toBe(400);
    expect(res._body.error).toBe("fileUrl or key required");
  });

  test("returns 400 when fileUrl is an invalid URL that resolves to an empty key", async () => {
    const { req, res } = makeReqRes({ fileUrl: "not-a-url-and-not-a-key" });

    // toS3Key returns the raw string when it's not http(s), so this case
    // only produces an empty key for truly empty/blank values
    const { req: req2, res: res2 } = makeReqRes({ fileUrl: "" });

    await presignView(req2, res2);

    expect(res2._status).toBe(400);
  });

  // ── Environment / AWS errors ───

  test("returns 500 when S3_BUCKET env var is missing", async () => {
    clearEnv("S3_BUCKET");

    const { req, res } = makeReqRes({
      key: "public/profile-photos/u1/photo.jpg",
    });

    await presignView(req, res);

    expect(res._status).toBe(500);
    expect(res._body.error).toBe("Failed to create view URL");
  });

  test("returns 500 and includes error details when getSignedUrl throws", async () => {
    mockGetSignedUrl.mockRejectedValue(new Error("Token expired"));

    const { req, res } = makeReqRes({
      key: "public/profile-photos/u1/photo.jpg",
    });

    await presignView(req, res);

    expect(res._status).toBe(500);
    expect(res._body.error).toBe("Failed to create view URL");
    expect(res._body.details).toBe("Token expired");
  });
});