import './style.css'
import { renderChart } from './chart.ts'
import { renderPractice } from './practice.ts'
import type { BoardId } from './types.ts'

const BOARDS: { id: BoardId; label: string }[] = [
  { id: 'chart', label: 'Chart' },
  { id: 'practice', label: 'Practice' },
]

const app = document.querySelector<HTMLDivElement>('#app')!
let current: BoardId = 'chart'

const show = () => {
  app.innerHTML = `
    <header class="site">
      <h1 class="site__title" lang="ja">あ <span>my-nihongo</span></h1>
      <nav class="tabs">
        ${BOARDS.map(
          (b) => `<button class="tabs__btn${b.id === current ? ' is-active' : ''}"
                          type="button" data-board="${b.id}"
                          aria-pressed="${b.id === current}">${b.label}</button>`,
        ).join('')}
      </nav>
    </header>
    <main id="board">${current === 'chart' ? renderChart() : ''}</main>`

  if (current === 'practice') {
    renderPractice(document.querySelector<HTMLElement>('#board')!)
  }
}

app.addEventListener('click', (e) => {
  const tab = (e.target as HTMLElement).closest<HTMLElement>('[data-board]')
  if (!tab) return
  current = tab.dataset.board as BoardId
  show()
})

show()
