/**
 * A deck that hands out a few items at a time and covers itself.
 *
 * Picking at random on every draw looks fair and is not: nothing stops an item
 * being chosen again immediately, so the draws pile up on a subset while other
 * items go unseen for a long time. With a thousand items, three hundred draws
 * of three land on roughly six hundred distinct ones.
 *
 * Dealing off a shuffled deck instead means everything is seen once before
 * anything is seen twice, and the same three hundred draws reach nine hundred.
 * The deck only reshuffles once it has run out.
 *
 * The pool is passed in on each deal rather than held here, because the caller
 * may narrow it — to one topic, say. Hand in the *same array* while the
 * selection is unchanged: a new array is taken as a new pool and starts a
 * fresh shuffle, which is right when the selection really did change and
 * wrong if it did not.
 */
export interface Deck<T> {
  /** The next hand. Reshuffles when the deck runs dry. */
  deal: (pool: T[], size: number) => T[]
  /** How many are left before the next reshuffle. */
  left: () => number
}

export const makeDeck = <T>(): Deck<T> => {
  let rest: T[] = []
  let source: T[] | null = null

  const shuffled = (xs: T[]): T[] => {
    // Fisher-Yates, so every ordering is equally likely.
    const out = [...xs]
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  }

  return {
    deal(pool, size) {
      if (pool !== source) {
        source = pool
        rest = []
      }
      const want = Math.min(size, pool.length)
      const picked: T[] = []
      while (picked.length < want) {
        if (!rest.length) rest = shuffled(pool)
        const next = rest.pop()!
        if (picked.includes(next)) {
          // The deck ran dry mid-deal and this has come straight back round.
          // Send it to the bottom rather than showing it twice in one hand.
          rest.unshift(next)
          continue
        }
        picked.push(next)
      }
      return picked
    },
    left: () => rest.length,
  }
}
