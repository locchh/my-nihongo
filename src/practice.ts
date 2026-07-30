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
    <p class="board__note">
      ${
        direction === 'recognize'
          ? 'See the character, say the sound. Tap to check.'
          : 'See the reading, picture the character. Tap to check.'
      }
      A ring marks what you have already learned.
    </p>
    ${GROUPS.map((g) => group(g.type, g.title, g.note)).join('')}
  </section>`

/**
 * Flip-card practice in both directions. Each character holds both kana forms;
 * only the selected script is ever shown, so the prompt stays a single shape.
 */
export const renderPractice = (mount: HTMLElement): void => {
  const paint = () => {
    mount.innerHTML = markup()
  }

  mount.addEventListener('click', (e) => {
    const target = e.target as HTMLElement

    const setScript = target.closest<HTMLElement>('[data-script]')
    if (setScript) {
      script = setScript.dataset.script as Script
      return paint()
    }

    const setDirection = target.closest<HTMLElement>('[data-direction]')
    if (setDirection) {
      direction = setDirection.dataset.direction as Direction
      return paint()
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
