const CHOSEONG = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ"
];

const JUNGSEONG = [
  "ㅏ",
  "ㅐ",
  "ㅑ",
  "ㅒ",
  "ㅓ",
  "ㅔ",
  "ㅕ",
  "ㅖ",
  "ㅗ",
  "ㅘ",
  "ㅙ",
  "ㅚ",
  "ㅛ",
  "ㅜ",
  "ㅝ",
  "ㅞ",
  "ㅟ",
  "ㅠ",
  "ㅡ",
  "ㅢ",
  "ㅣ"
];

const JONGSEONG = [
  "",
  "ㄱ",
  "ㄲ",
  "ㄳ",
  "ㄴ",
  "ㄵ",
  "ㄶ",
  "ㄷ",
  "ㄹ",
  "ㄺ",
  "ㄻ",
  "ㄼ",
  "ㄽ",
  "ㄾ",
  "ㄿ",
  "ㅀ",
  "ㅁ",
  "ㅂ",
  "ㅄ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ"
];

const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;
const JUNGSEONG_COUNT = 21;
const JONGSEONG_COUNT = 28;

export function toKoreanSearchText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFC")
    .replace(/\s+/g, "")
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);

      if (code < HANGUL_BASE || code > HANGUL_END) {
        return char;
      }

      const offset = code - HANGUL_BASE;
      const choseongIndex = Math.floor(offset / (JUNGSEONG_COUNT * JONGSEONG_COUNT));
      const jungseongIndex = Math.floor((offset % (JUNGSEONG_COUNT * JONGSEONG_COUNT)) / JONGSEONG_COUNT);
      const jongseongIndex = offset % JONGSEONG_COUNT;

      return `${CHOSEONG[choseongIndex]}${JUNGSEONG[jungseongIndex]}${JONGSEONG[jongseongIndex]}`;
    })
    .join("");
}

export function toKoreanInitialText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFC")
    .replace(/\s+/g, "")
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);

      if (code < HANGUL_BASE || code > HANGUL_END) {
        return char;
      }

      const offset = code - HANGUL_BASE;
      return CHOSEONG[Math.floor(offset / (JUNGSEONG_COUNT * JONGSEONG_COUNT))];
    })
    .join("");
}

export function matchesKoreanSearch(source: string, query: string) {
  const normalizedQuery = toKoreanSearchText(query);
  if (!normalizedQuery) return true;

  return (
    toKoreanSearchText(source).includes(normalizedQuery) ||
    toKoreanInitialText(source).includes(normalizedQuery)
  );
}
