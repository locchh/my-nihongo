import kanaData from './data/kana.json'
import type { Kana } from './types.ts'

/**
 * The characters, and the two facts about them that more than one board needs.
 *
 * Both are exported as fixed arrays rather than as functions that filter on
 * demand, and that matters: the deck tells one pool from another by identity,
 * so a fresh `filter(...)` handed over on every deal would read as a new pool
 * every time and reshuffle every time, which loses the one thing a deck is for.
 */

/** Everything drilled. ゐ and ゑ are on the wall chart to be read about, not practised. */
export const KANA: Kana[] = (kanaData as Kana[]).filter((k) => !k.obsolete)

/**
 * Some readings have two spellings: じ/ぢ are both `ji`, ず/づ are both `zu`.
 * Written the other way round they are unambiguous, so this only matters when
 * the reading is the question.
 */
const BY_READING = new Map<string, Kana[]>()
for (const k of KANA) {
  BY_READING.set(k.romaji, [...(BY_READING.get(k.romaji) ?? []), k])
}

/** The other characters that answer to this one's reading. Usually none. */
export const twins = (k: Kana): Kana[] =>
  (BY_READING.get(k.romaji) ?? []).filter((other) => other.hiragana !== k.hiragana)

/**
 * The reading to prompt with when the character is the answer.
 *
 * A card fronted `zu` cannot say whether it wants ず or づ. So the first of a
 * pair keeps its Hepburn reading and the second is cued by its other spelling —
 * づ as `du`, ぢ as `di` — which is also what an IME takes to type it, so it is
 * the reading a writer actually reaches for. A twin with no other spelling
 * keeps the shared one, and the caller is left to merge those.
 */
export const cue = (k: Kana): string =>
  BY_READING.get(k.romaji)?.[0] === k ? k.romaji : (k.alt[0] ?? k.romaji)

/**
 * A cue can be shared across groups too: `di` is ぢ by its spelling and ディ by
 * its sound, `wo` is を and ウォ. Neither answer is wrong, so a card fronted
 * with one names the other rather than pretending to be the only one.
 */
const BY_CUE = new Map<string, Kana[]>()
for (const k of KANA) {
  BY_CUE.set(cue(k), [...(BY_CUE.get(cue(k)) ?? []), k])
}

/** The other characters a card fronted with this one's cue could mean. */
export const shareCue = (k: Kana): Kana[] =>
  (BY_CUE.get(cue(k)) ?? []).filter((other) => other !== k)
