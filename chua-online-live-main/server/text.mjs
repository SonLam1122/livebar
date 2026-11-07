// Text helpers: normalisation, keyword matching, profanity masking and names that read well aloud.
// Everything coming from TikTok is untrusted: it is cut to length here and only ever rendered as text.

/** Lowercase, NFC, Vietnamese diacritics removed, punctuation collapsed to single spaces. */
export function fold(s) {
  return String(s ?? '')
    .normalize('NFKC').toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ').trim();
}

/** True when `phrase` appears in `text` as whole words (both already folded). */
export function hasPhrase(text, phrase) {
  return (' ' + text + ' ').includes(' ' + phrase + ' ');
}

/** Clean a viewer-supplied string for display: NFKC (turns "𝓜𝓪𝓷𝓱" into "Manh"), strip control chars, cap length. */
export function clean(s, max = 120) {
  return String(s ?? '')
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]/g, '')
    .replace(/\s+/g, ' ').trim()
    .slice(0, max);
}

/** A display name: cleaned, never empty. */
export function displayName(s) {
  return clean(s, 24) || 'Phật tử ẩn danh';
}

/** A name that sounds right in Vietnamese TTS: no emoji, no "user8237461", no trailing number runs, no handles. */
export function spokenName(s) {
  let n = clean(s, 40)
    .replace(/[_@.\-]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\buser\s*\d+\b/gi, '')
    .replace(/\d{3,}/g, '')
    .replace(/\s+/g, ' ').trim();
  if (!/\p{L}/u.test(n)) n = '';
  return n.slice(0, 28) || 'một Phật tử';
}

// Folded forms; matched as whole words so "đi cưới" or "quen" never trip anything.
const BASE_BAD = [
  'dm', 'dmm', 'dcm', 'dit', 'djt', 'du ma', 'du me', 'deo', 'dech', 'cac', 'cak', 'lon', 'buoi', 'cave', 'dien', 'dien khung',
  'ngu', 'oc cho', 'cho chet', 'mat day', 'vl', 'vcl', 'vkl', 'clgt', 'cmm', 'cmn', 'loz',
  'fuck', 'shit', 'bitch', 'dick', 'pussy',
];
// Without diacritics these are also everyday words (lớn, buổi, các, điện, ngủ, đeo): only flag them alone or in an insult pattern.
const AMBIGUOUS = new Set(['lon', 'buoi', 'cac', 'dien', 'ngu', 'deo']);

export function makeFilter(extra = []) {
  const words = [...new Set([...BASE_BAD, ...extra.map(fold).filter(Boolean)])];
  const strict = words.filter(w => !AMBIGUOUS.has(w));
  return {
    /** true when the text contains a banned word or phrase */
    isBad(text) {
      const f = fold(text);
      if (!f) return false;
      if (strict.some(w => hasPhrase(f, w))) return true;
      // ambiguous words only count as the whole message or with an insult prefix
      return [...AMBIGUOUS].some(w => f === w || hasPhrase(f, 'do ' + w) || hasPhrase(f, 'thang ' + w) || hasPhrase(f, 'con ' + w + ' nay'));
    },
    words,
  };
}

/** Escape text for SSML / XML (Edge TTS). */
export function xmlEscape(s) {
  return String(s).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
}

export const clamp = (v, a, b) => Math.max(a, Math.min(b, Math.round(+v || 0)));
