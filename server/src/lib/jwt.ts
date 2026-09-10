import jwt from "jsonwebtoken";

/**
 * Signing key. A missing JWT_SECRET used to fall back to the literal
 * "dev-secret" — which meant a production deploy that forgot the variable
 * would sign admin tokens with a value published in this repo, letting anyone
 * mint an ADMIN session. Refuse to boot instead.
 */
const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET is missing or shorter than 32 characters. Refusing to start."
    );
  }
  console.warn("[jwt] JWT_SECRET unset — using an insecure development key.");
  return "dev-secret-local-only";
})();

export interface JwtPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "EDITOR";
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
