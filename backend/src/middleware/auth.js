import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🧩 Decoded token:", decoded); // 👀 Add this log
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ JWT verification failed:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// --- New middleware for Admin/Seller only ---
export const adminMiddleware = (req, res, next) => {
  if (!req.user?.isAdmin) {
    console.log("🚫 Forbidden request. User:", req.user);
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
  next();
};
