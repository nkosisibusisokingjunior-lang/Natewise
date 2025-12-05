import jwt from "jsonwebtoken";

const ACCESS_TTL = process.env.ACCESS_TTL || "10m";
const REFRESH_TTL = process.env.REFRESH_TTL || "7d";
const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

function ensureSecret(secret, name) {
  if (!secret) {
    throw new Error(`${name} is not set`);
  }
  return secret;
}

export function signAccessToken(payload) {
  return jwt.sign(payload, ensureSecret(ACCESS_SECRET, "JWT_SECRET"), {
    expiresIn: ACCESS_TTL,
  });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, ensureSecret(REFRESH_SECRET, "REFRESH_SECRET"), {
    expiresIn: REFRESH_TTL,
  });
}

export function verifyAccess(token) {
  return jwt.verify(token, ensureSecret(ACCESS_SECRET, "JWT_SECRET"));
}

export function verifyRefresh(token) {
  return jwt.verify(token, ensureSecret(REFRESH_SECRET, "REFRESH_SECRET"));
}
