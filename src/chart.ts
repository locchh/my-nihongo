import kanaData from './data/kana.json'
import { BASE_ROWS, COLUMNS, ROW_HUE } from './types.ts'
import type { Kana, KanaColumn } from './types.ts'

const kana = kanaData as Kana[]

const cell = (k: Kana | undefined, hue: number): string => {
  if (!k) return '<div class="chart__cell chart__cell--empty"></div>'
  return `
    <div class="chart__cell${k.obsolete ? ' chart__cell--obsolete' : ''}" style="--hue: ${hue}">
      <div class="chart__pair">
        <span class="chart__kana" lang="ja">${k.hiragana}</span>
        <span class="chart__kana" lang="ja">${k.katakana}</span>
      </div>
      <div class="chart__romaji">${k.romaji}</div>
    </div>`
}

/**
 * The gojūon wall chart: hiragana and katakana paired per cell, romaji beneath,
 * one colour band per row. Base characters only — the chart it reproduces does
 * not show dakuten or yōon, but it does show the retired ゐ and ゑ.
 */
export const renderChart = (): string => {
  const base = kana.filter((k) => k.type === 'base')
  const at = (row: string, column: KanaColumn) =>
    base.find((k) => k.row === row && k.column === column)

  const header = `
    <div class="chart__cell chart__cell--label"></div>
    ${COLUMNS.map((c) => `<div class="chart__label">${c}−</div>`).join('')}`

  const rows = BASE_ROWS.map((row) => {
    const hue = ROW_HUE[row] ?? 0
    return `
      <div class="chart__label">${row === 'a' ? '' : `${row}−`}</div>
      ${COLUMNS.map((c) => cell(at(row, c), hue)).join('')}`
  }).join('')

  const n = base.find((k) => k.row === null)
  const tail = `
    <div class="chart__label">n−</div>
    ${cell(n, ROW_HUE.a)}
    ${COLUMNS.slice(1).map(() => '<div class="chart__cell chart__cell--empty"></div>').join('')}`

  return `
    <section class="board">
      <p class="board__note">
        The full gojūon. ゐ and ゑ are shown greyed — they were retired in the
        1946 spelling reform and are not used today.
      </p>
      <div class="chart__scroll">
        <div class="chart">${header}${rows}${tail}</div>
      </div>
    </section>`
}
