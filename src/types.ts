export type KanaType = 'base' | 'dakuten' | 'handakuten' | 'yoon'
export type KanaColumn = 'a' | 'i' | 'u' | 'e' | 'o'
export type Script = 'hiragana' | 'katakana'
export type BoardId = 'home' | 'chart' | 'characters' | 'cards' | 'sentences' | 'test'

/** Time of day the homepage is painted in. Three, not a smooth cycle. */
export type Phase = 'morning' | 'afternoon' | 'night'

/**
 * Everywhere you can go, in menu order. A section without an `id` is one that
 * is listed but not built: the menu shows it so the shape of the app is
 * visible, and nothing in the markup pretends it opens.
 */
export const SECTIONS: { id?: BoardId; label: string; ja: string }[] = [
  { id: 'chart', label: 'Full board', ja: '五十音' },
  { id: 'characters', label: 'Characters', ja: '文字' },
  // The one label in katakana, because that is the word: カード is a loan, and
  // 単語 would name only half of what the board now deals.
  { id: 'cards', label: 'Flashcards', ja: 'カード' },
  { id: 'sentences', label: 'Phrases', ja: '会話' },
  { id: 'test', label: 'Test', ja: '試験' },
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

/**
 * A word worth knowing, as one flashcard.
 *
 * Unlike a kana, a word has one written form and not two: native words are
 * written in hiragana and borrowed ones in katakana, and that is a property of
 * the word rather than a choice the reader makes. `script` records which,
 * because the two are read differently even when a word could be spelled
 * either way.
 *
 * `emoji` is the meaning. It is deliberately not an English word: the point of
 * the deck is a direct hop from the Japanese to the thing, with no English in
 * between to translate through. `gloss` exists so screen readers and search
 * have something to say, and never appears on the card.
 */
export interface Word {
  japanese: string
  romaji: string
  emoji: string
  gloss: string
  script: Script
  learned: boolean
}

/** How formal a phrase is. Saying やあ to a stranger is its own kind of error. */
export type Register = 'casual' | 'neutral' | 'polite'

/**
 * A set phrase, filed under the situation it belongs to.
 *
 * Written in kana without kanji, like everything else here. Real Japanese
 * would spell おげんきですか as お元気ですか, but a reader who cannot yet read
 * kana gains nothing from the kanji and loses the chance to practise.
 */
export interface Sentence {
  japanese: string
  romaji: string
  english: string
  topic: string
  register: Register
  /** Why it is said this way, when that is not obvious. Empty when it is. */
  note: string
  learned: boolean
}

/**
 * A heading for a group of phrases. Lives in data so a new one is a new entry
 * in topics.json rather than a code change.
 */
export interface Topic {
  id: string
  title: string
  ja: string
}
