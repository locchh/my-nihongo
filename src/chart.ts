import kanaData from './data/kana.json'
import { BASE_ROWS, COLUMNS, ROW_HUE } from './types.ts'
import type { Kana, KanaColumn, Script } from './types.ts'

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
 * One line of a sound-rule table. `write` is the kana that carries the rule,
 * `example` a word using it with that kana wrapped in [brackets] so it can be
 * picked out on the page. The gloss is Vietnamese, as on the word cards.
 */
interface RuleRow {
  sound: string
  write: string
  example: string
  romaji: string
  vi: string
}

interface RuleGroup {
  /** The Japanese name of the rule, and how the same rule is called in class. */
  ja: string
  name: string
  vi: string
  /** What the rule does, in one line. */
  how: string
  rows: RuleRow[]
}

/**
 * Long vowels and doubled consonants are written differently in the two kana,
 * which is why there is a table per script rather than a rule per mark.
 *
 * Hiragana spells a long vowel out with a second vowel kana, and two columns
 * do not take the kana you would guess: え lengthens with い (とけい) and お
 * with う (ぎんこう). The other spelling exists for a handful of native words
 * — おねえさん, おおきい, とおい — and those are listed as the exceptions they
 * are. Katakana ignores all of that and draws the length as a bar, ー, whatever
 * the vowel. Both scripts double a consonant with a small tsu — っ in hiragana,
 * ッ in katakana — and the bar never appears in hiragana, nor the vowel
 * spelling in katakana: コーヒー, never こーひー.
 */
const RULES: Record<Script, RuleGroup[]> = {
  hiragana: [
    {
      ja: '長音',
      name: 'chōon',
      vi: 'trường âm',
      how: 'add a vowel kana — え takes い, お takes う',
      rows: [
        { sound: 'a → aa', write: 'あ + あ', example: 'おか[あ]さん', romaji: 'okaasan', vi: 'mẹ' },
        { sound: 'i → ii', write: 'い + い', example: 'おに[い]さん', romaji: 'oniisan', vi: 'anh trai' },
        { sound: 'u → uu', write: 'う + う', example: 'く[う]き', romaji: 'kuuki', vi: 'không khí' },
        { sound: 'e → ee', write: 'え + い', example: 'とけ[い]', romaji: 'tokei', vi: 'đồng hồ' },
        { sound: 'e → ee', write: 'え + え (hiếm)', example: 'おね[え]さん', romaji: 'oneesan', vi: 'chị gái' },
        { sound: 'o → oo', write: 'お + う', example: 'ぎんこ[う]', romaji: 'ginkou', vi: 'ngân hàng' },
        { sound: 'o → oo', write: 'お + お (hiếm)', example: 'と[お]い', romaji: 'tooi', vi: 'xa' },
      ],
    },
    {
      ja: '促音',
      name: 'sokuon',
      vi: 'âm ngắt',
      how: 'small っ doubles the consonant after it',
      rows: [
        { sound: 't → tt', write: 'っ + て', example: 'き[っ]て', romaji: 'kitte', vi: 'tem' },
        { sound: 's → ss', write: 'っ + し', example: 'ざ[っ]し', romaji: 'zasshi', vi: 'tạp chí' },
        { sound: 'p → pp', write: 'っ + ぷ', example: 'き[っ]ぷ', romaji: 'kippu', vi: 'vé' },
      ],
    },
  ],
  katakana: [
    {
      ja: '長音',
      name: 'chōon',
      vi: 'trường âm',
      how: 'draw a bar, ー, whatever the vowel',
      rows: [
        { sound: 'a → aa', write: 'ア + ー', example: 'カ[ー]', romaji: 'kaa', vi: 'xe hơi' },
        { sound: 'i → ii', write: 'イ + ー', example: 'スキ[ー]', romaji: 'sukii', vi: 'trượt tuyết' },
        { sound: 'u → uu', write: 'ウ + ー', example: 'プ[ー]ル', romaji: 'puuru', vi: 'hồ bơi' },
        { sound: 'e → ee', write: 'エ + ー', example: 'ケ[ー]キ', romaji: 'keeki', vi: 'bánh kem' },
        { sound: 'o → oo', write: 'オ + ー', example: 'ソ[ー]ス', romaji: 'soosu', vi: 'nước sốt' },
      ],
    },
    {
      ja: '促音',
      name: 'sokuon',
      vi: 'âm ngắt',
      how: 'small ッ doubles the consonant after it',
      rows: [
        { sound: 'd → dd', write: 'ッ + ド', example: 'ベ[ッ]ド', romaji: 'beddo', vi: 'giường' },
        { sound: 't → tt', write: 'ッ + ト', example: 'ホ[ッ]ト', romaji: 'hotto', vi: 'nóng' },
        { sound: 'k → kk', write: 'ッ + ク', example: 'チェ[ッ]ク', romaji: 'chekku', vi: 'kiểm tra' },
      ],
    },
  ],
}

/** `[っ]` in an example becomes the highlighted kana. */
const mark = (example: string): string => example.replace(/\[(.+?)\]/g, '<b>$1</b>')

const ruleRow = (r: RuleRow): string => `
  <tr>
    <td class="rules__sound">${r.sound}</td>
    <td class="rules__write" lang="ja">${r.write}</td>
    <td class="rules__example">
      <span lang="ja">${mark(r.example)}</span>
      <span class="rules__romaji">${r.romaji}</span>
      <span class="rules__vi" lang="vi">${r.vi}</span>
    </td>
  </tr>`

const ruleGroup = (g: RuleGroup): string => `
  <tbody>
    <tr class="rules__group">
      <th colspan="3" scope="rowgroup">
        <strong lang="ja">${g.ja}</strong> ${g.name} <span lang="vi">${g.vi}</span>
        <small>${g.how}</small>
      </th>
    </tr>
    ${g.rows.map(ruleRow).join('')}
  </tbody>`

const rulesTable = (script: Script, ja: string): string => `
  <div class="rules__scroll">
    <table class="rules">
      <caption><span lang="ja">${ja}</span> ${script}</caption>
      <thead>
        <tr>
          <th scope="col">sound</th>
          <th scope="col">write</th>
          <th scope="col">example</th>
        </tr>
      </thead>
      ${RULES[script].map(ruleGroup).join('')}
    </table>
  </div>`

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
    <section class="board board--bamboo">
      <p class="board__note">
        The full gojūon. ゐ and ゑ are shown greyed — they were retired in the
        1946 spelling reform and are not used today.
      </p>
      <!-- The chart is wider than a phone and scrolls sideways. Nothing inside
           it can take focus, so without a tabindex of its own a keyboard has no
           way to reach the columns that are off-screen. -->
      <div class="chart__scroll" tabindex="0" role="group" aria-label="Gojūon chart">
        <div class="chart">${header}${rows}${tail}</div>
      </div>
      <section class="chart__rules" aria-labelledby="chart-rules-title">
        <h2 id="chart-rules-title">Sound rules <span lang="vi">Quy tắc âm</span></h2>
        <p class="chart__rules-note">
          A long vowel is spelled out in hiragana and drawn as a bar in katakana.
          The bar never appears in hiragana: <span lang="ja">コーヒー</span>, never
          <span lang="ja">こーひー</span>. Both scripts double a consonant with a
          small tsu.
        </p>
        <div class="chart__rule-grid">
          ${rulesTable('hiragana', 'ひらがな')}
          ${rulesTable('katakana', 'カタカナ')}
        </div>
      </section>
    </section>`
}
