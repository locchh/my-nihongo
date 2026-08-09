import wordData from './data/words.json'
import { makeDeck } from './deck.ts'
import { KANA, twins } from './kana.ts'
import { ROW_HUE } from './types.ts'
import type { Kana, Word } from './types.ts'

/**
 * The flashcards.
 *
 * One board, two decks. Characters drill the shapes; words drill what is built
 * out of them. They are the same gesture — three cards, one prompt each, an
 * answer that stays hidden until you commit to a guess — so they are one board
 * with a switch rather than two places that happen to look alike.
 */
type Mode = 'characters' | 'words'

/** How many cards are on the table at once. */
const HAND = 3

const pick = <T>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)]

const allWords = wordData as Word[]

/**
 * Only what you are actually learning.
 *
 * The flags in the data are the syllabus: a character counts once either of its
 * kana is marked, a word once it is marked. Dealing from everything instead
 * would bury the dozen you are working on under ninety you have never met.
 *
 * An empty selection falls back to the lot, because a deck of nothing is not a
 * lesson — a fresh checkout with no progress recorded still has to deal. Both
 * pools are worked out once and kept: the deck tells one pool from another by
 * identity, so a fresh array every deal would reshuffle every deal.
 */
const studying = <T>(all: T[], learned: (x: T) => boolean): T[] => {
  const some = all.filter(learned)
  return some.length ? some : all
}

const CHARACTERS = studying(KANA, (k) => k.learnedHiragana || k.learnedKatakana)
const WORDS = studying(allWords, (w) => w.learned)

/* ---------- character cards ---------- */

/**
 * A character can be written three ways, and any of them can be the prompt.
 *
 * Which one is drawn fresh for every card on every deal. That is the point: a
 * character is not known until every route works — either kana to the sound,
 * the sound to either kana, and each kana to its twin. Fix the prompt and you
 * can answer from position instead of from knowledge.
 */
type Form = 'hiragana' | 'katakana' | 'romaji'

const FORMS: Form[] = ['hiragana', 'katakana', 'romaji']

/**
 * Asked only in the kana you have marked — being shown ア before you have met
 * it is a riddle rather than a question. The reading is always fair game. A
 * character with neither kana marked is only reachable through the fallback
 * above, where nothing is learned and so everything is open.
 */
const askableForms = (k: Kana): Form[] => {
  const forms: Form[] = ['romaji']
  if (k.learnedHiragana) forms.push('hiragana')
  if (k.learnedKatakana) forms.push('katakana')
  return forms.length > 1 ? forms : FORMS
}

const plain = (k: Kana, form: Form): string =>
  form === 'hiragana' ? k.hiragana : form === 'katakana' ? k.katakana : k.romaji

const written = (k: Kana, form: Form): string =>
  form === 'romaji'
    ? `<span class="card__as-romaji">${k.romaji}</span>`
    : `<span class="card__as-kana" lang="ja">${plain(k, form)}</span>`

/**
 * Turned over, a character gives all three forms at once: the pair side by side
 * above the reading. あ and ア are one character in two hands, and only ever
 * meeting them apart is how they end up remembered as two. The kana you have
 * not marked yet appears here on purpose — the back is the answer key, and this
 * is where the other half is met.
 */
const characterCard = (k: Kana, form: Form): string => {
  // The ring means both kana, not one: the card asks in either, so knowing half
  // of it is not knowing the card.
  const known = k.learnedHiragana && k.learnedKatakana
  // Only a romaji prompt is ambiguous — `ji` is じ and ぢ both. Either kana
  // names one character and needs no note.
  const also = form === 'romaji' ? twins(k).map((o) => `${o.hiragana} ${o.katakana}`) : []

  return `
    <button class="card card--kana${known ? ' card--learned' : ''}" type="button"
            style="--hue: ${ROW_HUE[k.row ?? 'a'] ?? 0}"
            aria-expanded="false"
            aria-label="${plain(k, form)} — reveal answer">
      <span class="card__inner">
        <span class="card__face card__face--front">${written(k, form)}</span>
        <span class="card__face card__face--back card__face--all" aria-hidden="true">
          <span class="card__pair">${written(k, 'hiragana')}${written(k, 'katakana')}</span>
          ${written(k, 'romaji')}
          ${also.length ? `<small class="card__also">or <span lang="ja">${also.join(' ')}</span></small>` : ''}
        </span>
      </span>
    </button>`
}

/* ---------- word cards ---------- */

/**
 * A word is asked the same three ways, for the same reason — shape to meaning,
 * meaning to shape, reading to both.
 *
 * The meaning is carried by an emoji rather than an English word. That is
 * deliberate: the deck is meant to build a direct hop from the Japanese to the
 * thing, and an English word in the middle is one more step to translate
 * through.
 */
type Face = 'japanese' | 'emoji' | 'romaji'

const FACES: Face[] = ['japanese', 'emoji', 'romaji']

const piece = (word: Word, face: Face): string => {
  if (face === 'japanese') return `<span class="card__as-word" lang="ja">${word.japanese}</span>`
  if (face === 'emoji')
    // Vietnamese is not a fallback for a missing picture, it is the meaning for
    // the words a picture cannot carry — and it is still not English, which is
    // the rule the emoji was there to keep.
    return word.emoji
      ? `<span class="card__emoji" role="img" aria-label="${word.gloss}">${word.emoji}</span>`
      : `<span class="card__vi" lang="vi">${word.vi}</span>`
  return `<span class="card__reading">${word.romaji}</span>`
}

/** What the prompt is called, for the label a screen reader announces. */
const NAMED: Record<Face, (w: Word) => string> = {
  japanese: (w) => w.japanese,
  emoji: (w) => w.gloss,
  romaji: (w) => w.romaji,
}

/**
 * Words borrow the chart's colour language: a card takes the hue of the row its
 * first kana belongs to, so あい sits in the same red as あ does on the wall.
 */
const hueOf = (word: Word): number => {
  const first = word.japanese[0]
  const match = KANA.find((k) => k.hiragana === first || k.katakana === first)
  return ROW_HUE[match?.row ?? 'a'] ?? 0
}

const wordCard = (word: Word, face: Face): string => {
  // Turned over, the card gives the whole word at once — spelling, meaning and
  // reading together, which is the thing being memorised.
  const answer = FACES.map((f) => piece(word, f)).join('')

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

/* ---------- the board ---------- */

let mode: Mode = 'characters'

/**
 * A deck each, so switching does not lose your place in the other one, and a
 * hand each for the same reason.
 *
 * Hands are held as finished markup because the prompt is part of the deal:
 * drawn once, when the card is turned face up, and kept until the next hand.
 * Rolling it again on every repaint would change the question under you the
 * moment you flipped a card.
 */
const kanaDeck = makeDeck<Kana>()
const wordDeck = makeDeck<Word>()
const hands: Record<Mode, string[]> = { characters: [], words: [] }

const deal = (): void => {
  hands[mode] =
    mode === 'characters'
      ? kanaDeck.deal(CHARACTERS, HAND).map((k) => characterCard(k, pick(askableForms(k))))
      : wordDeck.deal(WORDS, HAND).map((w) => wordCard(w, pick(FACES)))
}

/**
 * What each deck says about itself.
 *
 * `narrowed` is whether the learned filter caught anything, which is not the
 * same question as whether the deck is smaller than the whole set — mark every
 * card and it is the whole set, honestly.
 */
interface Held {
  label: string
  note: string
  held: number
  all: number
  narrowed: boolean
}

const DECKS: Record<Mode, Held> = {
  characters: {
    label: 'Characters',
    note: 'both kana and the reading, mixed',
    held: CHARACTERS.length,
    all: KANA.length,
    narrowed: CHARACTERS !== KANA,
  },
  words: {
    label: 'Words',
    note: 'built from the kana you know',
    held: WORDS.length,
    all: allWords.length,
    narrowed: WORDS !== allWords,
  },
}

// Worded off what is actually askable. Promising "either kana" while the deck
// only ever prompts in the one you have marked sends you looking for katakana
// fronts that are not coming.
const NOTE: Record<Mode, string> = {
  characters: `Three at a time, each asked in a kana you have marked or as its
    reading. Give the forms it is not showing you, then turn it over — the back
    has all three.`,
  words: `Three at a time. Each asks in one of three ways — the word, its
    meaning, or its reading. Tap a card to turn it over and see all three.`,
}

const markup = (): string => {
  const here = DECKS[mode]
  return `
    <section class="board">
      <div class="controls">
        <div class="toggle" role="group" aria-label="Deck">
          ${(Object.keys(DECKS) as Mode[])
            .map(
              (m) => `<button class="toggle__btn${m === mode ? ' is-active' : ''}"
                              type="button" data-mode="${m}"
                              aria-pressed="${m === mode}">${DECKS[m].label}</button>`,
            )
            .join('')}
        </div>
      </div>
      <!--
        The second line has to tell the truth about which pool you are in.
        Claiming the deck is your syllabus while it is quietly dealing all 104
        is the kind of small lie that makes someone stop trusting the count.
      -->
      <p class="board__note">
        ${NOTE[mode]}
        ${
          here.narrowed
            ? 'The deck holds what you have marked as learned, and nothing else.'
            : `Nothing is marked as learned yet, so this deals from all of them
               — mark what you are working on and the deck narrows to it.`
        }
      </p>
      <section class="group">
        <h2 class="group__title">
          ${here.label}
          <span class="group__note">${here.note}</span>
          <span class="group__count">${here.held}/${here.all}</span>
        </h2>
        <div class="cards cards--hand">${hands[mode].join('')}</div>
      </section>
      <div class="controls controls--after">
        <button class="btn-deal" type="button" data-deal>Next three</button>
        <p class="deal__left">
          ${(mode === 'characters' ? kanaDeck : wordDeck).left()} left before the deck reshuffles
        </p>
      </div>
    </section>`
}

/** Must match the .is-turning transition in style.css. */
const TURN_MS = 160

export const renderCards = (mount: HTMLElement): void => {
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

    const setMode = target.closest<HTMLElement>('[data-mode]')
    if (setMode) {
      const next = setMode.dataset.mode as Mode
      if (next !== mode) {
        turn(() => {
          mode = next
          // Only when there is nothing there: dealing over a hand you had
          // walked away from would throw away cards you never answered. The
          // hand comes back, face down — the deal is kept, the flips are not.
          if (!hands[mode].length) deal()
        })
      }
      return
    }

    if (target.closest('[data-deal]')) {
      turn(deal)
      return
    }

    const flipped = target.closest<HTMLElement>('.card')
    if (!flipped) return
    const isOpen = flipped.classList.toggle('is-flipped')
    flipped.setAttribute('aria-expanded', String(isOpen))
    // The hidden face is aria-hidden, not merely turned away: otherwise a
    // screen reader reads prompt and answer together and the recall attempt —
    // the whole point of a flip card — never happens.
    const faces = flipped.querySelectorAll<HTMLElement>('.card__face')
    faces[0]?.setAttribute('aria-hidden', String(isOpen))
    faces[1]?.setAttribute('aria-hidden', String(!isOpen))
  })

  if (!hands[mode].length) deal()
  paint()
}
