import { KANA, cue, shareCue } from './kana.ts'
import { ROW_HUE, learnedIn } from './types.ts'
import type { Kana, KanaType, Script } from './types.ts'

/** `recognize` reads Japanese; `produce` writes it. Different skills. */
type Direction = 'recognize' | 'produce'

const GROUPS: { type: KanaType; title: string; note: string; script?: Script }[] = [
  { type: 'base', title: 'Base', note: '46 shapes — the whole gojūon' },
  { type: 'dakuten', title: 'Dakuten ゛', note: 'voiced: か → が' },
  { type: 'handakuten', title: 'Handakuten ゜', note: 'は row → ぱ row' },
  { type: 'yoon', title: 'Yōon', note: 'き + ゃ → きゃ, one mora' },
  {
    type: 'extended',
    title: 'Extended katakana',
    note: 'loanword sounds: フ + ァ → ファ',
    script: 'katakana',
  },
]

let script: Script = 'hiragana'
let direction: Direction = 'recognize'

const shapeOf = (k: Kana): string => (script === 'hiragana' ? k.hiragana : k.katakana)

/**
 * In produce mode the prompt is a cue, and a few characters share one across
 * groups: `du` is づ by its spelling and ドゥ by its sound. Both are named, but
 * only those on the board — the extended set is katakana-only, so in hiragana
 * there is no でぃ card for ぢ to point at.
 */
const alsoValid = (k: Kana): string =>
  shareCue(k)
    .filter((o) => o.type !== 'extended' || script === 'katakana')
    .map(shapeOf)
    .join(' ')

const card = (k: Kana): string => {
  const shape = shapeOf(k)
  const recognizing = direction === 'recognize'
  // Reading the character, the answer is its study reading. Writing it, the
  // prompt is the cue, which differs only for づ and ぢ.
  const front = recognizing ? shape : cue(k)
  const back = recognizing ? k.romaji : shape
  const also = recognizing ? '' : alsoValid(k)
  // Yōon are written with two glyphs and need to be typeset as a pair, whether
  // they are the question or the answer.
  const asKana = `card__as-kana${shape.length > 1 ? ' card__as-kana--pair' : ''}`

  // The hidden face is aria-hidden, not just visually turned away: otherwise a
  // screen reader reads prompt and answer together and the recall attempt —
  // the entire point of a flip card — never happens.
  return `
    <button class="card${learnedIn(k, script) ? ' card--learned' : ''}" type="button"
            style="--hue: ${ROW_HUE[k.row ?? 'a'] ?? 0}"
            aria-expanded="false" aria-label="${front} — reveal answer">
      <span class="card__inner">
        <span class="card__face card__face--front ${recognizing ? asKana : 'card__as-romaji'}"
              ${recognizing ? 'lang="ja"' : ''}>${front}</span>
        <span class="card__face card__face--back ${recognizing ? 'card__as-romaji' : asKana}"
              ${recognizing ? '' : 'lang="ja"'} aria-hidden="true">
          ${back}${also ? `<small class="card__also">or ${also}</small>` : ''}
        </span>
      </span>
    </button>`
}

const group = (type: KanaType, title: string, note: string): string => {
  const items = KANA.filter((k) => k.type === type)
  const done = items.filter((k) => learnedIn(k, script)).length
  // Produce mode is prompted by the cue, and two cards in one group with the
  // same front would be one question asked twice, so only the first stands and
  // its back names the rest. Nothing collides today — ず/づ are `zu`/`du`,
  // ドゥ/デュ are `du`/`dyu` — this is what keeps that true as the data grows.
  const shown =
    direction === 'produce'
      ? items.filter((k, i) => items.findIndex((o) => cue(o) === cue(k)) === i)
      : items
  return `
    <section class="group">
      <h2 class="group__title">
        ${title}
        <span class="group__note">${note}</span>
        <span class="group__count">${done}/${items.length}</span>
      </h2>
      <div class="cards">${shown.map(card).join('')}</div>
    </section>`
}

const switcher = <T extends string>(
  name: string, key: string, options: T[], active: T, label: (o: T) => string,
): string => `
  <div class="toggle" role="group" aria-label="${name}">
    ${options
      .map(
        (o) => `<button class="toggle__btn${o === active ? ' is-active' : ''}"
                        type="button" data-${key}="${o}"
                        aria-pressed="${o === active}">${label(o)}</button>`,
      )
      .join('')}
  </div>`

const markup = (): string => `
  <section class="board">
    <div class="controls">
      ${switcher('Script', 'script', ['hiragana', 'katakana'] as Script[], script, (s) =>
        s === 'hiragana' ? 'Hiragana' : 'Katakana',
      )}
      ${switcher(
        'Direction', 'direction', ['recognize', 'produce'] as Direction[], direction,
        (d) => (d === 'recognize' ? 'かa → sound' : 'sound → かa'),
      )}
    </div>
    <!--
      One line, worded per direction, because romaji is only a trap in one of
      them. Reading the character it is the answer key, and taking it first is
      the whole mistake this app exists to avoid. Producing the character it is
      the legitimate cue, so there is no warning to give — the note there is
      about attempting the answer instead, which is the other half of the same
      idea. Said in as few words as possible: a paragraph of philosophy above
      the board is a paragraph nobody rereads on the second visit.
    -->
    <p class="board__note">
      ${
        direction === 'recognize'
          ? `Say the sound before you tap. Romaji is the answer key, never the
             thing you read from — take it first and the kana stay decoration.`
          : `Picture the character before you tap. Reaching for it, rather than
             recognising it, is the part that does the work.`
      }
      A ring marks what you know.
    </p>
    ${GROUPS.filter((g) => !g.script || g.script === script)
      .map((g) => group(g.type, g.title, g.note))
      .join('')}
  </section>`

/**
 * The characters, as flip cards in both directions. Each entry holds both kana
 * forms; only the selected script is ever shown, so the prompt stays a single
 * shape.
 *
 * Named for what it drills rather than for the drilling. Words and phrases are
 * practice too, and this is the rung below them: characters, then words, then
 * phrases.
 */
/** Must match the .is-turning transition in style.css. */
const TURN_MS = 160

export const renderCharacters = (mount: HTMLElement): void => {
  const paint = () => {
    mount.innerHTML = markup()
  }

  /**
   * Changing a toggle turns every card over in place instead of blanking the
   * board and redrawing it. Cards rotate to edge-on, the content swaps while
   * they are side-on and invisible, then they rotate back — the same motion as
   * flipping one card, applied to all of them at once.
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
      // Start the incoming faces side-on, then release them on the next frame
      // so the browser animates the second half of the turn.
      next.classList.add('is-entering')
      requestAnimationFrame(() =>
        requestAnimationFrame(() => next.classList.remove('is-entering')),
      )
    }, TURN_MS)
  }

  mount.addEventListener('click', (e) => {
    const target = e.target as HTMLElement

    const setScript = target.closest<HTMLElement>('[data-script]')
    if (setScript) {
      const next = setScript.dataset.script as Script
      if (next !== script) turn(() => (script = next))
      return
    }

    const setDirection = target.closest<HTMLElement>('[data-direction]')
    if (setDirection) {
      const next = setDirection.dataset.direction as Direction
      if (next !== direction) turn(() => (direction = next))
      return
    }

    // Sticky flip. Hover only previews, and only on pointer devices.
    const flipped = target.closest<HTMLElement>('.card')
    if (!flipped) return
    const isOpen = flipped.classList.toggle('is-flipped')
    flipped.setAttribute('aria-expanded', String(isOpen))
    const faces = flipped.querySelectorAll<HTMLElement>('.card__face')
    faces[0]?.setAttribute('aria-hidden', String(isOpen))
    faces[1]?.setAttribute('aria-hidden', String(!isOpen))
  })

  paint()
}
