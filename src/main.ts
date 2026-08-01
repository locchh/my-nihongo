import './style.css'
import { renderCards } from './cards.ts'
import { renderCharacters } from './characters.ts'
import { renderChart } from './chart.ts'
import { renderHome } from './home.ts'
import { renderSentences } from './sentences.ts'
import { renderTest } from './test.ts'
import { SECTIONS } from './types.ts'
import type { BoardId } from './types.ts'

/** Every board mounts the same way, so navigation stays a lookup, not a ladder. */
const MOUNT: Record<BoardId, (board: HTMLElement) => void> = {
  home: renderHome,
  chart: (board) => {
    board.innerHTML = renderChart()
  },
  characters: renderCharacters,
  cards: renderCards,
  sentences: renderSentences,
  test: renderTest,
}

const app = document.querySelector<HTMLDivElement>('#app')!
let current: BoardId = 'home'

/**
 * Each tab carries both names. On a phone the English is hidden and the kanji
 * stand alone — five English labels do not fit a 320px screen, and wrapping
 * them strands one tab on a second row inside the pill. Home shortens all the
 * way to 家 there, since it is the one label with no kanji form of its own and
 * ホーム costs four characters to say nothing extra.
 */
const tab = (id: BoardId | undefined, label: string, ja: string): string => {
  const inner = `<span class="tabs__ja" lang="ja">${ja}</span><span class="tabs__en">${label}</span>`
  return id
    ? `<button class="tabs__btn${id === current ? ' is-active' : ''}" type="button"
               data-board="${id}" aria-pressed="${id === current}"
               aria-label="${label}">${inner}</button>`
    : `<button class="tabs__btn" type="button" aria-disabled="true"
               aria-label="${label}">${inner}</button>`
}

/**
 * The homepage carries its own menu and shows no header at all — it is a title
 * screen. Every other board gets the ordinary tabs, with a way back.
 */
const header = (): string =>
  current === 'home'
    ? ''
    : `<header class="site">
         <h1 class="site__title" lang="ja">あ <span>my-nihongo</span></h1>
         <nav class="tabs">
           ${tab('home', 'Home', '家')}
           ${SECTIONS.map((s) => tab(s.id, s.label, s.ja)).join('')}
         </nav>
       </header>`

const show = () => {
  app.innerHTML = `${header()}<main id="board"></main>`
  MOUNT[current](document.querySelector<HTMLElement>('#board')!)
  // On a phone the tab strip scrolls, and the tab you just arrived on can be
  // off to the right where you cannot see that it is selected.
  app.querySelector('.tabs__btn.is-active')?.scrollIntoView({ block: 'nearest', inline: 'center' })
}

// Delegated, so the title screen's menu needs no wiring of its own: its
// entries carry the same data-board the tabs do.
app.addEventListener('click', (e) => {
  const target = (e.target as HTMLElement).closest<HTMLElement>('[data-board]')
  if (!target) return
  current = target.dataset.board as BoardId
  show()
  scrollTo({ top: 0 })
})

show()
