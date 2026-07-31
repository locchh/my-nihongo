import { renderScene } from './scene.ts'
import { SECTIONS } from './types.ts'
import type { Phase } from './types.ts'

/**
 * The homepage: the Fuji scene, and a menu over it. No header and no title —
 * the picture is the page, and the menu is the navigation, the way a title
 * screen works. Every other board keeps the ordinary tabs.
 *
 * Time of day lives in one `data-phase` attribute on the root, which every
 * colour in the picture reads through CSS variables. So the minute tick is a
 * single attribute write, the palette crossfades, and the petals never stop
 * falling.
 */

const PHASES: Phase[] = ['morning', 'afternoon', 'night']

/**
 * Local wall-clock hours. Deliberately blunt — the point is that the page
 * looks like the time it is, not that it models sunrise.
 */
const phaseAt = (hour: number): Phase =>
  hour < 5 ? 'night' : hour < 11 ? 'morning' : hour < 17 ? 'afternoon' : 'night'

/**
 * What the bird says. One is picked at random each time the page is opened, so
 * the list is the whole of it — adding a line is adding a string.
 */
const SAYINGS: { ja: string; en: string }[] = [
  { ja: 'いっしょに べんきょう しよう', en: "let's study together" },
  { ja: 'まいにち すこしずつ', en: 'a little every day' },
  { ja: 'かなを よめますか', en: 'can you read the kana?' },
  { ja: 'ゆっくりで だいじょうぶ', en: 'slow is fine' },
  { ja: 'きょうも がんばろう', en: "let's do our best today" },
  { ja: 'ローマじは つかわないよ', en: 'no romaji here' },
]

const menu = (): string => `
  <nav class="menu" aria-label="Boards">
    <ul class="menu__list">
      ${SECTIONS.map(
        (s) => `
        <li>
          <button class="pick${s.id ? '' : ' pick--soon'}" type="button"
                  ${s.id ? `data-board="${s.id}"` : 'aria-disabled="true"'}>
            <span class="pick__ja" lang="ja">${s.ja}</span>
            <span class="pick__label">${s.label}</span>
            ${s.id ? '' : '<span class="pick__soon">soon</span>'}
          </button>
        </li>`,
      ).join('')}
    </ul>
  </nav>`

const markup = (): string => `
  <section class="home" data-phase="morning">
    ${renderScene(SAYINGS[Math.floor(Math.random() * SAYINGS.length)])}
    ${menu()}
  </section>`

/**
 * One timer, module-scoped. `main.ts` throws the whole board away on every
 * navigation, and a timer — unlike a listener — survives its element being
 * detached, so leaving the old one running would stack a second copy on every
 * return to this page.
 */
let clock: number | undefined

/** Milliseconds between clock checks. A minute is finer than any phase edge. */
const TICK = 60_000

export const renderHome = (mount: HTMLElement): void => {
  clearInterval(clock)
  mount.innerHTML = markup()

  const home = mount.querySelector<HTMLElement>('.home')!
  // ?phase=night forces one, for looking at all three without waiting a day.
  const forced = new URLSearchParams(location.search).get('phase') as Phase | null
  const pinned = forced && PHASES.includes(forced) ? forced : null

  const apply = () => {
    const next = pinned ?? phaseAt(new Date().getHours())
    if (home.dataset.phase !== next) home.dataset.phase = next
  }

  apply()
  clock = window.setInterval(apply, TICK)
}
