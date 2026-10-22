import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
  createSession,
  isAdminSession,
  requireAdmin,
  setSessionCookie,
} from "./auth.js";

process.env.SESSION_SECRET = "unit-test-session-secret-which-is-long-enough";

test("accepts a valid signed administrator session", () => {
  const token = createSession();
  assert.equal(
    isAdminSession({ headers: { cookie: `product_admin_session=${token}` } }),
    true,
  );
});

test("rejects altered and expired sessions", () => {
  const token = createSession();
  const altered = `${token.slice(0, -1)}x`;
  assert.equal(
    isAdminSession({ headers: { cookie: `product_admin_session=${altered}` } }),
    false,
  );

  const payload = Buffer.from(JSON.stringify({ expiresAt: Date.now() - 1 })).toString("base64url");
  const signature = createHmac("sha256", process.env.SESSION_SECRET)
    .update(payload)
    .digest("base64url");
  assert.equal(
    isAdminSession({
      headers: { cookie: `product_admin_session=${payload}.${signature}` },
    }),
    false,
  );
});

test("protects admin operations and sets an HttpOnly session cookie", () => {
  let statusCode;
  let responseBody;
  let continued = false;
  const response = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
    },
  };

  requireAdmin(
    { headers: {}, get: () => undefined },
    response,
    () => {
      continued = true;
    },
  );
  assert.equal(statusCode, 401);
  assert.equal(responseBody.success, false);
  assert.equal(continued, false);

  requireAdmin(
    {
      headers: {},
      get: (name) => (name === "origin" ? "https://attacker.example" : "store.example"),
    },
    response,
    () => {
      continued = true;
    },
  );
  assert.equal(statusCode, 403);
  assert.equal(responseBody.message, "Cross-origin request rejected");

  process.env.COOKIE_SECURE = "true";
  setSessionCookie({ setHeader: (_name, value) => { responseBody = value; } }, createSession());
  assert.match(responseBody, /HttpOnly/);
  assert.match(responseBody, /SameSite=Strict/);
  assert.match(responseBody, /; Secure/);
  delete process.env.COOKIE_SECURE;
});
