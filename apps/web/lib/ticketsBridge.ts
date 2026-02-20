import { createHmac, randomUUID } from "crypto";

export type TicketsBridgePayload = {
  sub: string;
  role: string;
  iat: number;
  exp: number;
  nonce: string;
};

const BRIDGE_TOKEN_TTL_SECONDS = 90;

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function sign(unsignedToken: string, secret: string) {
  return createHmac("sha256", secret).update(unsignedToken).digest("base64url");
}

export function getTicketsBridgeSecret() {
  const secret = process.env.PLATFORM_TICKETS_BRIDGE_SECRET?.trim();
  if (!secret || secret.length < 16) {
    return null;
  }

  return secret;
}

export function createTicketsBridgeToken(input: { sub: string; role: string }, secret: string) {
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "HS256", typ: "COPS-BRIDGE" };
  const payload: TicketsBridgePayload = {
    sub: input.sub,
    role: input.role,
    iat: now,
    exp: now + BRIDGE_TOKEN_TTL_SECONDS,
    nonce: randomUUID(),
  };

  const headerPart = toBase64Url(JSON.stringify(header));
  const payloadPart = toBase64Url(JSON.stringify(payload));
  const unsignedToken = `${headerPart}.${payloadPart}`;
  const signature = sign(unsignedToken, secret);

  return `${unsignedToken}.${signature}`;
}
