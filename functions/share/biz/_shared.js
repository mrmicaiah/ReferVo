// My Biz share-link encoding/decoding — shared between Cloudflare Pages
// Function routes. The leading underscore prevents Cloudflare from routing
// to this file directly.
//
// Mirrors src/utils/myBizShare.ts in the refervo-app repo, byte-for-byte
// identical logic — only TypeScript type annotations have been stripped.
// If you change one, change both (the wire format must stay in sync between
// the mobile encoder and this server-side decoder).
//
// The URL itself carries the entire card payload as a base64url-encoded JSON
// string in the `d` query parameter. No database record is created for a share
// — the link IS the data.
//
// Format:
//   https://refervo.com/share/biz?d=<base64url(JSON.stringify(payload))>
//
// Payload shape (only these four fields):
//   { name: string, phone: string (digits only), email?: string, note?: string }

const SHARE_BASE_URL = 'https://refervo.com/share/biz';

// --- base64url helpers ----------------------------------------------------
// We don't depend on Buffer (Node-only) or atob (env-dependent) so this works
// identically in Cloudflare Workers, the React Native runtime, and Node.

const B64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const utf8EncodeToBytes = (str) => {
  const out = [];
  for (let i = 0; i < str.length; i++) {
    let codePoint = str.charCodeAt(i);
    if (codePoint >= 0xd800 && codePoint <= 0xdbff && i + 1 < str.length) {
      // High surrogate → combine with following low surrogate
      const low = str.charCodeAt(i + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        codePoint = 0x10000 + ((codePoint - 0xd800) << 10) + (low - 0xdc00);
        i++;
      }
    }
    if (codePoint < 0x80) {
      out.push(codePoint);
    } else if (codePoint < 0x800) {
      out.push(0xc0 | (codePoint >> 6));
      out.push(0x80 | (codePoint & 0x3f));
    } else if (codePoint < 0x10000) {
      out.push(0xe0 | (codePoint >> 12));
      out.push(0x80 | ((codePoint >> 6) & 0x3f));
      out.push(0x80 | (codePoint & 0x3f));
    } else {
      out.push(0xf0 | (codePoint >> 18));
      out.push(0x80 | ((codePoint >> 12) & 0x3f));
      out.push(0x80 | ((codePoint >> 6) & 0x3f));
      out.push(0x80 | (codePoint & 0x3f));
    }
  }
  return out;
};

const utf8DecodeFromBytes = (bytes) => {
  let out = '';
  let i = 0;
  while (i < bytes.length) {
    const b1 = bytes[i++];
    if (b1 < 0x80) {
      out += String.fromCharCode(b1);
    } else if (b1 < 0xc0) {
      // Stray continuation byte — invalid
      return '';
    } else if (b1 < 0xe0) {
      const b2 = bytes[i++] & 0x3f;
      out += String.fromCharCode(((b1 & 0x1f) << 6) | b2);
    } else if (b1 < 0xf0) {
      const b2 = bytes[i++] & 0x3f;
      const b3 = bytes[i++] & 0x3f;
      out += String.fromCharCode(((b1 & 0x0f) << 12) | (b2 << 6) | b3);
    } else {
      const b2 = bytes[i++] & 0x3f;
      const b3 = bytes[i++] & 0x3f;
      const b4 = bytes[i++] & 0x3f;
      let codePoint = ((b1 & 0x07) << 18) | (b2 << 12) | (b3 << 6) | b4;
      codePoint -= 0x10000;
      out += String.fromCharCode(
        0xd800 + (codePoint >> 10),
        0xdc00 + (codePoint & 0x3ff)
      );
    }
  }
  return out;
};

const bytesToBase64 = (bytes) => {
  let out = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out += B64_CHARS[(n >> 18) & 0x3f];
    out += B64_CHARS[(n >> 12) & 0x3f];
    out += B64_CHARS[(n >> 6) & 0x3f];
    out += B64_CHARS[n & 0x3f];
  }
  if (i < bytes.length) {
    const n1 = bytes[i];
    const n2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    out += B64_CHARS[(n1 >> 2) & 0x3f];
    out += B64_CHARS[((n1 << 4) | (n2 >> 4)) & 0x3f];
    if (i + 1 < bytes.length) {
      out += B64_CHARS[(n2 << 2) & 0x3f];
      out += '=';
    } else {
      out += '==';
    }
  }
  return out;
};

const base64ToBytes = (b64) => {
  // Build a reverse lookup for both standard and url-safe alphabets
  const lookup = {};
  for (let i = 0; i < B64_CHARS.length; i++) {
    lookup[B64_CHARS[i]] = i;
  }
  // Accept url-safe variants by mapping them back
  const normalized = b64.replace(/-/g, '+').replace(/_/g, '/');

  // Re-pad to multiple of 4
  const padded =
    normalized + '='.repeat((4 - (normalized.length % 4)) % 4);

  const bytes = [];
  for (let i = 0; i < padded.length; i += 4) {
    const c1 = padded[i];
    const c2 = padded[i + 1];
    const c3 = padded[i + 2];
    const c4 = padded[i + 3];

    if (c1 === '=' || c2 === '=') {
      // Need at least two non-pad characters per 4-char group
      return null;
    }

    const v1 = lookup[c1];
    const v2 = lookup[c2];
    if (v1 === undefined || v2 === undefined) return null;

    bytes.push(((v1 << 2) | (v2 >> 4)) & 0xff);

    if (c3 === '=' || c3 === undefined) continue;
    const v3 = lookup[c3];
    if (v3 === undefined) return null;
    bytes.push(((v2 << 4) | (v3 >> 2)) & 0xff);

    if (c4 === '=' || c4 === undefined) continue;
    const v4 = lookup[c4];
    if (v4 === undefined) return null;
    bytes.push(((v3 << 6) | v4) & 0xff);
  }
  return bytes;
};

const toBase64Url = (b64) =>
  b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// --- public API -----------------------------------------------------------

/**
 * Encode a My Biz card into the canonical share URL.
 * Empty/nullish email and note are omitted from the JSON payload entirely.
 */
export const encodeMyBizShareUrl = (card) => {
  const phoneDigits = (card.phone || '').replace(/\D/g, '');

  const payload = {
    name: (card.name || '').trim(),
    phone: phoneDigits,
  };
  if (card.email && card.email.trim()) payload.email = card.email.trim();
  if (card.note && card.note.trim()) payload.note = card.note.trim();

  const json = JSON.stringify(payload);
  const bytes = utf8EncodeToBytes(json);
  const b64 = bytesToBase64(bytes);
  const b64url = toBase64Url(b64);

  return `${SHARE_BASE_URL}?d=${b64url}`;
};

/**
 * Decode a base64url-encoded share payload back to the card fields.
 * Returns null for any of:
 *   - missing / empty input
 *   - malformed base64
 *   - non-UTF-8 bytes
 *   - JSON parse failure
 *   - missing / empty `name` or `phone` after parse
 *
 * Phone is forced through digits-only normalization on decode as a defensive
 * step in case a malicious or hand-edited URL contains formatting characters.
 */
export const decodeMyBizShareUrl = (d) => {
  if (!d || typeof d !== 'string') return null;

  const bytes = base64ToBytes(d);
  if (!bytes || bytes.length === 0) return null;

  const json = utf8DecodeFromBytes(bytes);
  if (!json) return null;

  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null;
  }

  const name = typeof parsed.name === 'string' ? parsed.name.trim() : '';
  const rawPhone = typeof parsed.phone === 'string' ? parsed.phone : '';
  const phone = rawPhone.replace(/\D/g, '');

  if (!name || !phone) return null;

  const result = { name, phone };

  if (typeof parsed.email === 'string' && parsed.email.trim()) {
    result.email = parsed.email.trim();
  }
  if (typeof parsed.note === 'string' && parsed.note.trim()) {
    result.note = parsed.note.trim();
  }

  return result;
};
