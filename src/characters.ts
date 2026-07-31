import kanaData from './data/kana.json'
import { ROW_HUE, learnedIn } from './types.ts'
import type { Kana, KanaType, Script } from './types.ts'

const kana = kanaData as Kana[]

/** `recognize` reads Japanese; `produce` writes it. Different skills. */
type Direction = 'recognize' | 'produce'

const GROUPS: { type: KanaType; title: string; note: string }[] = [
  { type: 'base', title: 'Base', note: '46 shapes — the whole gojūon' },
  { type: 'dakuten', title: 'Dakuten ゛', note: 'voiced: か → が' },
  { type: 'handakuten', title: 'Handakuten ゜', note: 'は row → ぱ row' },
  { type: 'yoon', title: 'Yōon', note: 'き + ゃ → きゃ, one mora' },
]

/**
 * Hepburn collapses じ/ぢ to `ji` and ず/づ to `zu`, so in produce mode a romaji
 * prompt can have two correct answers. Forward it is unambiguous, so this only
 * matters one way round.
 */
const AMBIGUOUS = new Map<string, Kana[]>()
for (const k of kana.filter((c) => !c.obsolete)) {
  AMBIGUOUS.set(k.romaji, [...(AMBIGUOUS.get(k.romaji) ?? []), k])
}

let script: Script = 'hiragana'
let direction: Direction = 'recognize'

const shapeOf = (k: Kana): string => (script === 'hiragana' ? k.hiragana : k.katakana)

const alsoValid = (k: Kana): string =>
  (AMBIGUOUS.get(k.romaji) ?? [])
    .filter((other) => other.hiragana !== k.hiragana)
    .map(shapeOf)
    .join(' ')

const card = (k: Kana): string => {
  const shape = shapeOf(k)
  const reading = k.romaji
  const recognizing = direction === 'recognize'
  const front = recognizing ? shape : reading
  const back = recognizing ? reading : shape
  const also = recognizing ? '' : alsoValid(k)

  // The hidden face is aria-hidden, not just visually turned away: otherwise a
  // screen reader reads prompt and answer together and the recall attempt —
  // the entire point of a flip card — never happens.
  return `
    <button class="card${learnedIn(k, script) ? ' card--learned' : ''}" type="button"
            style="--hue: ${ROW_HUE[k.row ?? 'a'] ?? 0}"
            aria-expanded="false" aria-label="${front} — reveal answer">
      <span class="card__inner">
        <span class="card__face card__face--front card__as-${recognizing ? 'kana' : 'romaji'}"
              ${recognizing ? 'lang="ja"' : ''}>${front}</span>
        <span class="card__face card__face--back card__as-${recognizing ? 'romaji' : 'kana'}"
              ${recognizing ? '' : 'lang="ja"'} aria-hidden="true">
          ${back}${also ? `<small class="card__also">or ${also}</small>` : ''}
        </span>
      </span>
    </button>`
}

const group = (type: KanaType, title: string, note: string): string => {
  const items = kana.filter((k) => k.type === type && !k.obsolete)
  const done = items.filter((k) => learnedIn(k, script)).length
  // Produce mode is prompted by the reading, so じ and ぢ would appear as two
  // identical `ji` cards. Show one, and let its back name both answers.
  const shown =
    direction === 'produce'
      ? items.filter((k, i) => items.findIndex((o) => o.romaji === k.romaji) === i)
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
      The warning is worded per direction, because romaji is only a trap in one
      of them. Reading the character, romaji is the answer key and reading it
      first is the whole mistake this app exists to avoid. Producing the
      character, romaji is the legitimate cue and saying so avoids sounding
      like a rule the board immediately breaks.
    -->
    <p class="board__note">
      ${
        direction === 'recognize'
          ? `Say the sound aloud, then tap to check. The romaji on the back is
             the answer key, not something to read from — take it first often
             enough and the Latin letters quietly become the thing you know,
             while the kana stay decoration.`
          : `See the reading, picture the character, then tap to check. Romaji
             is only the cue here; the kana is the answer, and picturing it
             before you turn the card is the part that does the work.`
      }
      A ring marks what you have already learned.
    </p>
    ${GROUPS.map((g) => group(g.type, g.title, g.note)).join('')}
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
