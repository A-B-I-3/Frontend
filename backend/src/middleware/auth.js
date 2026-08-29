import jwt from "jsonwebtoken";

export function issueToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function requireAuth(expectedType) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "unauthenticated" });

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (expectedType && payload.type !== expectedType) {
        return res.status(403).json({ error: "wrong_account_type" });
      }
      req.user = payload;
      next();
    } catch {
      return res.status(401).json({ error: "invalid_token" });
    }
  };
}
