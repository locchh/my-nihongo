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
 * Hepburn collapses じ/ぢ to `ji` and ず/づ to `zu`, so a romaji prompt can have
 * two correct answers. Written the other way round it is unambiguous, so this
 * only matters when the reading is the question.
 */
const BY_READING = new Map<string, Kana[]>()
for (const k of KANA) {
  BY_READING.set(k.romaji, [...(BY_READING.get(k.romaji) ?? []), k])
}

/** The other characters that answer to this one's reading. Usually none. */
export const twins = (k: Kana): Kana[] =>
  (BY_READING.get(k.romaji) ?? []).filter((other) => other.hiragana !== k.hiragana)
