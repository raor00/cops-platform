const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
const PHONE_RE = /\b(\+?\d[\d\s\-().]{6,}\d)\b/g
const RIF_RE = /\b[VEJG]-?\d{7,9}-?\d?\b/gi

export function redactText(input: string): string {
  return input
    .replace(EMAIL_RE, "[redacted-email]")
    .replace(RIF_RE, "[redacted-id]")
    .replace(PHONE_RE, "[redacted-phone]")
}

