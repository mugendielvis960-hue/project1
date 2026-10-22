import { createHash, timingSafeEqual } from "node:crypto";
import express from "express";
import {
  clearSessionCookie,
  createSession,
  isAdminSession,
  setSessionCookie,
} from "../middleware/auth.js";

const router = express.Router();
const attemptsByIp = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

const passwordMatches = (password) => {
  const supplied = createHash("sha256").update(password).digest();
  const expected = createHash("sha256").update(process.env.ADMIN_PASSWORD).digest();
  return timingSafeEqual(supplied, expected);
};

router.get("/session", (req, res) => {
  res.json({ success: true, authenticated: isAdminSession(req) });
});

router.post("/login", (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  if (attemptsByIp.size > 1000) {
    for (const [address, attempt] of attemptsByIp) {
      if (attempt.resetAt <= now) attemptsByIp.delete(address);
    }
  }
  const record = attemptsByIp.get(ip);
  if (record && record.resetAt > now && record.count >= MAX_ATTEMPTS) {
    return res.status(429).json({ success: false, message: "Too many sign-in attempts. Try again later." });
  }

  const password = req.body?.password;
  if (typeof password !== "string" || !passwordMatches(password)) {
    const current = record && record.resetAt > now
      ? record
      : { count: 0, resetAt: now + WINDOW_MS };
    current.count += 1;
    attemptsByIp.set(ip, current);
    return res.status(401).json({ success: false, message: "Incorrect administrator password" });
  }

  attemptsByIp.delete(ip);
  setSessionCookie(res, createSession());
  res.json({ success: true, authenticated: true });
});

router.post("/logout", (req, res) => {
  clearSessionCookie(res);
  res.json({ success: true });
});

export default router;
