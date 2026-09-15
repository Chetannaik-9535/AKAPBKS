import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const ADMIN_USERNAME = "AKAPBKSPRESIDENT";
const ADMIN_PASSWORD = "PRESIDENT@2389";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

function digest(value: string) {
  return createHash("sha256").update(value, "utf8").digest();
}

function safeEqual(a: string, b: string) {
  return timingSafeEqual(digest(a), digest(b));
}

export function verifyCredentials(username: string, password: string) {
  return safeEqual(username.trim(), ADMIN_USERNAME) && safeEqual(password, ADMIN_PASSWORD);
}

function sign(payload: string) {
  return createHmac("sha256", `${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).update(payload).digest("hex");
}

export function issueAdminToken() {
  const payload = String(Date.now() + TOKEN_TTL_MS);
  return `${payload}.${sign(payload)}`;
}

export function assertAdminToken(token: string | undefined) {
  const [payload, signature] = (token ?? "").split(".");
  if (!payload || !signature) throw new Error("Unauthorized");
  if (!safeEqual(signature, sign(payload))) throw new Error("Unauthorized");
  if (Number(payload) < Date.now()) throw new Error("Session expired");
}
