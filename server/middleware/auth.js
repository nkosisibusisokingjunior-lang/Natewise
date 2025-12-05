import { verifyAccess } from "../utils/tokens.js";

function extractBearer(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

export function requireAuth(req, res, next) {
  try {
    const token = extractBearer(req);
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const decoded = verifyAccess(token);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export function optionalAuth(req, _res, next) {
  try {
    const token = extractBearer(req);
    if (token) {
      req.user = verifyAccess(token);
    }
  } catch {
    req.user = null;
  }
  return next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next();
  };
}
