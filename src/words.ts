import kanaData from './data/kana.json'
import wordData from './data/words.json'
import { ROW_HUE } from './types.ts'
import type { Kana, Word } from './types.ts'

const words = wordData as Word[]
const kana = kanaData as Kana[]

/**
 * Word flashcards.
 *
 * The kana board drills shapes; this one drills words built out of them, and
 * keeps the rule that matters: the answer stays hidden until you commit to a
 * guess.
 *
 * The meaning is carried by an emoji rather than an English word. That is
 * deliberate — the deck is meant to build a direct hop from the Japanese to
 * the thing, and an English word in the middle is one more step to translate
 * through.
 */

/**
 * A card can be asked in any of three ways, and which one it is is decided at
 * random for each card every time the board is drawn.
 *
 * That is the point of the deck: a word is not learned until all three routes
 * work — shape to meaning, meaning to shape, reading to both. Fixing the
 * prompt lets you answer from position rather than knowledge, and after a
 * couple of passes the deck starts testing your memory of the layout.
 */
type Face = 'japanese' | 'emoji' | 'romaji'

const FACES: Face[] = ['japanese', 'emoji', 'romaji']

/** How many cards are on the table at once. */
const HAND = 3

/**
 * Cards come off a shuffled deck rather than being picked independently at
 * random, and that is the whole difference between a deck that covers itself
 * and one that does not.
 *
 * Picking three at random every time looks fair and is not: with a thousand
 * words, three hundred draws would land on roughly six hundred distinct cards
 * and hammer some of them a dozen times over, because nothing stops a card
 * being chosen again immediately. Dealing off a shuffled deck instead means
 * every card is seen once before any card is seen twice — three hundred draws
 * gives nine hundred different words, and the deck only reshuffles when it has
 * run out.
 */
let deck: Word[] = []
let hand: { word: Word; face: Face }[] = []

/** Fisher-Yates, so every ordering of the deck is equally likely. */
const shuffled = (xs: Word[]): Word[] => {
  const out = [...xs]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const deal = (): void => {
  const size = Math.min(HAND, words.length)
  const picked: Word[] = []
  while (picked.length < size) {
    if (!deck.length) deck = shuffled(words)
    const next = deck.pop()!
    if (picked.includes(next)) {
      // The deck ran dry mid-deal and this card has come straight back round.
      // Send it to the bottom rather than showing it twice in one hand.
      deck.unshift(next)
      continue
    }
    picked.push(next)
  }
  hand = picked.map((word) => ({
    word,
    face: FACES[Math.floor(Math.random() * FACES.length)],
  }))
}

/**
 * Words borrow the chart's colour language: a card takes the hue of the row
 * its first kana belongs to, so あい sits in the same red as あ does on the
 * wall chart.
 */
const hueOf = (word: Word): number => {
  const first = word.japanese[0]
  const match = kana.find((k) => k.hiragana === first || k.katakana === first)
  return ROW_HUE[match?.row ?? 'a'] ?? 0
}

const piece = (word: Word, face: Face): string => {
  if (face === 'japanese') return `<span class="card__as-word" lang="ja">${word.japanese}</span>`
  if (face === 'emoji')
    return `<span class="card__emoji" role="img" aria-label="${word.gloss}">${word.emoji}</span>`
  return `<span class="card__reading">${word.romaji}</span>`
}

/** What the prompt is called, for the label a screen reader announces. */
const NAMED: Record<Face, (w: Word) => string> = {
  japanese: (w) => w.japanese,
  emoji: (w) => w.gloss,
  romaji: (w) => w.romaji,
}

const card = (word: Word, face: Face): string => {
  // Turned over, the card gives the whole word at once — spelling, meaning and
  // reading together, which is the thing being memorised.
  const answer = FACES.map((f) => piece(word, f)).join('')

  // The hidden face is aria-hidden, not merely turned away: otherwise a screen
  // reader reads prompt and answer together and the recall attempt — the whole
  // point of a flip card — never happens.
  return `
    <button class="card card--word${word.learned ? ' card--learned' : ''}" type="button"
            style="--hue: ${hueOf(word)}"
            aria-expanded="false"
            aria-label="${NAMED[face](word)} — reveal answer">
      <span class="card__inner">
        <span class="card__face card__face--front">${piece(word, face)}</span>
        <span class="card__face card__face--back card__face--all" aria-hidden="true">${answer}</span>
      </span>
    </button>`
}

const markup = (): string => {
  const done = words.filter((w) => w.learned).length
  return `
    <section class="board">
      <p class="board__note">
        Three at a time. Each asks in one of three ways — the word, its meaning,
        or its reading. Tap a card to turn it over and see all three.
      </p>
      <section class="group">
        <h2 class="group__title">
          Words
          <span class="group__note">built from the kana you know</span>
          <span class="group__count">${done}/${words.length}</span>
        </h2>
        <div class="cards cards--words">
          ${hand.map(({ word, face }) => card(word, face)).join('')}
        </div>
      </section>
      <div class="controls controls--after">
        <button class="btn-deal" type="button" data-deal>Next three</button>
        <p class="deal__left">
          ${deck.length} left before the deck reshuffles
        </p>
      </div>
    </section>`
}

/** Must match the .is-turning transition in style.css. */
const TURN_MS = 160

export const renderWords = (mount: HTMLElement): void => {
  const paint = () => {
    mount.innerHTML = markup()
  }

  /**
   * Dealing turns the cards over in place rather than blanking the board and
   * redrawing it — the same motion as flipping one card, applied to all of them
   * at once. Copied in spirit from the kana board, so the two feel like one
   * app. The next hand is drawn while the cards are edge-on.
   */
  const turn = (change: () => void) => {
    const board = mount.querySelector<HTMLElement>('.board')
    if (!board || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      change()
      return paint()
    }
    board.classList.add('is-turning')
    setTimeout(() => {
      change()
      paint()
      const next = mount.querySelector<HTMLElement>('.board')
      if (!next) return
      next.classList.add('is-entering')
      requestAnimationFrame(() =>
        requestAnimationFrame(() => next.classList.remove('is-entering')),
      )
    }, TURN_MS)
  }

  mount.addEventListener('click', (e) => {
    const target = e.target as HTMLElement

    if (target.closest('[data-deal]')) {
      turn(deal)
      return
    }

    const flipped = target.closest<HTMLElement>('.card')
    if (!flipped) return
    const isOpen = flipped.classList.toggle('is-flipped')
    flipped.setAttribute('aria-expanded', String(isOpen))
    const faces = flipped.querySelectorAll<HTMLElement>('.card__face')
    faces[0]?.setAttribute('aria-hidden', String(isOpen))
    faces[1]?.setAttribute('aria-hidden', String(!isOpen))
  })

  deal()
  paint()
}
