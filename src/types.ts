export type KanaType = 'base' | 'dakuten' | 'handakuten' | 'yoon'
export type KanaColumn = 'a' | 'i' | 'u' | 'e' | 'o'
export type Script = 'hiragana' | 'katakana'
export type BoardId = 'home' | 'chart' | 'practice'

/** Time of day the homepage is painted in. Three, not a smooth cycle. */
export type Phase = 'morning' | 'afternoon' | 'night'

/**
 * The three places to go, in menu order. `id` is missing while a section is
 * still unbuilt: the menu lists it so the shape of the app is visible, but
 * there is nothing to open, and nothing in the markup pretends otherwise.
 */
export const SECTIONS: { id?: BoardId; label: string; ja: string }[] = [
  { id: 'chart', label: 'Full board', ja: '五十音' },
  { id: 'practice', label: 'Practice', ja: '練習' },
  { label: 'Test', ja: '試験' },
]

export interface Kana {
  /** Stable unique key for this character. */
  hiragana: string
  katakana: string
  /** Hepburn. Not unique — じ/ぢ are both `ji`, ず/づ are both `zu`. */
  romaji: string
  /** Kunrei and wapuro spellings an IME also accepts. */
  alt: string[]
  /** `null` only for ん, which sits outside the grid. */
  row: string | null
  /** `null` only for ん, which has no vowel. */
  column: KanaColumn | null
  type: KanaType
  /** ゐ and ゑ — retired in the 1946 reform. On the wall chart, not in practice. */
  obsolete: boolean
  learnedHiragana: boolean
  learnedKatakana: boolean
}

/** Gojūon rows, in chart order. ん is rendered separately — it has no row. */
export const BASE_ROWS = ['a', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'] as const

export const COLUMNS: KanaColumn[] = ['a', 'i', 'u', 'e', 'o']

/**
 * One hue per row, matching the wall chart's pastel bands. Lightness is applied
 * per colour scheme in CSS, so the same hue works on light and dark.
 */
export const ROW_HUE: Record<string, number> = {
  a: 0, k: 22, s: 48, t: 85, n: 150, h: 205, m: 245, y: 280, r: 320, w: 345,
  g: 22, z: 48, d: 85, b: 205, p: 320,
  ky: 22, sh: 48, ch: 85, ny: 150, hy: 205, my: 245, ry: 320, gy: 22, j: 48, by: 205, py: 320,
}

export const learnedIn = (k: Kana, script: Script): boolean =>
  script === 'hiragana' ? k.learnedHiragana : k.learnedKatakana
