import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  console.log("AUTH HEADER:", header); // ✅ add this

  if (!header) {
    return res.status(401).json({ message: "Missing token" });
  }

  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Bad auth header format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DECODED:", decoded); // ✅ add this

    req.userId = decoded.userId;
    req.username = decoded.username;

    return next();
  } catch (err) {
    console.log("JWT VERIFY FAILED:", err.message); // ✅ add this
    return res.status(401).json({ message: "Invalid token" });
  }
}