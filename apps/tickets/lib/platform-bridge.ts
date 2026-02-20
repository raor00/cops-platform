import { createHmac, timingSafeEqual } from "crypto";

type BridgeHeader = {
  alg: "HS256";
  typ: "COPS-BRIDGE";
};

export type BridgePayload = {
  sub: string;
  role: string;
  iat: number;
  exp: number;
  nonce: string;
};

export type BridgeVerificationResult =
  | { valid: true; payload: BridgePayload }
  | {
      valid: false;
      reason: "missing-secret" | "invalid-format" | "invalid-signature" | "invalid-payload" | "expired";
    };

function readBridgeSecret() {
  const secret = process.env.PLATFORM_TICKETS_BRIDGE_SECRET?.trim();
  if (!secret || secret.length < 16) {
    return null;
  }

  return secret;
}

function decodePart(part: string) {
  try {
    return Buffer.from(part, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function verifyTicketsBridgeToken(token: string): BridgeVerificationResult {
  const secret = readBridgeSecret();
  if (!secret) {
    return { valid: false, reason: "missing-secret" };
  }

  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
    return { valid: false, reason: "invalid-format" };
  }

  const [headerPart, payloadPart, signaturePart] = parts;
  const unsignedToken = `${headerPart}.${payloadPart}`;
  const expectedSignature = createHmac("sha256", secret).update(unsignedToken).digest("base64url");

  if (!safeCompare(signaturePart, expectedSignature)) {
    return { valid: false, reason: "invalid-signature" };
  }

  const rawHeader = decodePart(headerPart);
  const rawPayload = decodePart(payloadPart);
  if (!rawHeader || !rawPayload) {
    return { valid: false, reason: "invalid-format" };
  }

  let header: BridgeHeader;
  let payload: BridgePayload;
  try {
    header = JSON.parse(rawHeader) as BridgeHeader;
    payload = JSON.parse(rawPayload) as BridgePayload;
  } catch {
    return { valid: false, reason: "invalid-format" };
  }

  if (header.alg !== "HS256" || header.typ !== "COPS-BRIDGE") {
    return { valid: false, reason: "invalid-format" };
  }

  if (
    typeof payload.sub !== "string" ||
    typeof payload.role !== "string" ||
    typeof payload.nonce !== "string" ||
    typeof payload.iat !== "number" ||
    typeof payload.exp !== "number"
  ) {
    return { valid: false, reason: "invalid-payload" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now || payload.iat > now + 60) {
    return { valid: false, reason: "expired" };
  }

  return { valid: true, payload };
}
