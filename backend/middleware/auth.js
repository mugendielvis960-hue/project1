import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "product_admin_session";
const SESSION_DURATION_SECONDS = 12 * 60 * 60;

const sign = (value) =>
  createHmac("sha256", process.env.SESSION_SECRET).update(value).digest("base64url");

const getCookie = (req, name) => {
  const cookie = req.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return cookie?.slice(name.length + 1);
};

const isValidSession = (token) => {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expectedSignature = sign(payload);
  const supplied = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return false;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString());
    return Number.isSafeInteger(session.expiresAt) && session.expiresAt > Date.now();
  } catch {
    return false;
  }
};

export const createSession = () => {
  const payload = Buffer.from(
    JSON.stringify({ expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
};

export const setSessionCookie = (res, token) => {
  const secure = process.env.COOKIE_SECURE === "true" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_DURATION_SECONDS}${secure}`,
  );
};

export const clearSessionCookie = (res) => {
  const secure = process.env.COOKIE_SECURE === "true" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`,
  );
};

export const isAdminSession = (req) =>
  isValidSession(getCookie(req, COOKIE_NAME));

export const requireAdmin = (req, res, next) => {
  const origin = req.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== req.get("host")) {
        return res.status(403).json({ success: false, message: "Cross-origin request rejected" });
      }
    } catch {
      return res.status(403).json({ success: false, message: "Invalid request origin" });
    }
  }
  if (!isAdminSession(req)) {
    return res.status(401).json({ success: false, message: "Administrator sign-in required" });
  }
  next();
};
