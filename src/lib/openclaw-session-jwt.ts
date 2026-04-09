import { SignJWT, jwtVerify } from "jose";

/**
 * HS256 JWT helper used to mint short-lived tokens that prove a logged-in
 * TBDC admin is authorised to open an OpenClaw WebSocket for a given
 * ChatSession.
 *
 * The secret is resolved lazily at call time (NOT at module load) so that
 * `next build` does not require `OPENCLAW_SESSION_JWT_SECRET` to be set.
 */
const secret = (): Uint8Array => {
  const s = process.env.OPENCLAW_SESSION_JWT_SECRET;
  if (!s) throw new Error("OPENCLAW_SESSION_JWT_SECRET env var is required");
  return new TextEncoder().encode(s);
};

export interface OpenClawSessionClaims {
  userId: string;
  openclawSessionId: string;
}

export async function mintOpenClawSessionToken(
  claims: OpenClawSessionClaims,
): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(secret());
}

export async function verifyOpenClawSessionToken(
  token: string,
): Promise<OpenClawSessionClaims> {
  const { payload } = await jwtVerify(token, secret());
  return payload as unknown as OpenClawSessionClaims;
}
