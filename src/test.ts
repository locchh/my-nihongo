import kanaData from './data/kana.json'
import sentenceData from './data/sentences.json'
import wordData from './data/words.json'
import { makeDeck } from './deck.ts'
import type { Kana, Sentence, Word } from './types.ts'

const kana = (kanaData as Kana[]).filter((k) => !k.obsolete)
const words = wordData as Word[]
const sentences = sentenceData as Sentence[]

/**
 * A short test drawn from everything else in the app.
 *
 * How you answer depends on what is being asked, and the split is not
 * arbitrary: when the answer is romaji you type it, and when the answer is
 * Japanese you pick it from four.
 *
 * Typing is the harder and better test — recognising か among four options can
 * run on a vague sense of its shape, where writing `ka` cannot. But typing かa
 * needs an IME, which most people reading this will not have set up and cannot
 * have at all on a phone keyboard. So the rule is: type it where typing is
 * possible, choose where it is not, and never make the choice so easy that the
 * distractors give it away.
 */

type Source = 'characters' | 'words' | 'sentences'
type Stage = 'setup' | 'asking' | 'checked' | 'done'

/** How many questions a "small test" is. */
const LENGTH = 10

interface Question {
  source: Source
  /** What is shown, and what language it is in, so it can be marked up. */
  prompt: string
  promptLang: 'ja' | 'en' | 'romaji' | 'emoji'
  hint: string
  answer: string
  answerLang: 'ja' | 'en' | 'romaji' | 'emoji'
  /** Present when the answer is picked rather than typed. */
  choices?: string[]
  /** Other spellings that are also right. Kunrei for shi/si, and so on. */
  accepts: string[]
}

const SOURCES: { id: Source | 'all'; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'characters', label: 'Characters' },
  { id: 'words', label: 'Words' },
  { id: 'sentences', label: 'Phrases' },
]

const pick = <T>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)]

/**
 * Three wrong answers from the same pool as the right one.
 *
 * Drawn from the same kind of thing on purpose: offering ねこ against
 * ありがとう is not a question, it is a formality.
 */
const withDistractors = (right: string, pool: string[]): string[] => {
  const others = [...new Set(pool)].filter((o) => o !== right)
  const chosen: string[] = []
  while (chosen.length < Math.min(3, others.length)) {
    const one = pick(others)
    if (!chosen.includes(one)) chosen.push(one)
  }
  const all = [right, ...chosen]
  // Shuffle, or the answer is always first.
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return all
}

const askCharacter = (k: Kana): Question => {
  const script = pick(['hiragana', 'katakana'] as const)
  const shape = script === 'hiragana' ? k.hiragana : k.katakana
  const shapes = kana.map((o) => (script === 'hiragana' ? o.hiragana : o.katakana))

  // Reading it is typed; writing it is chosen, because the keyboard cannot.
  if (Math.random() < 0.5) {
    return {
      source: 'characters',
      prompt: shape,
      promptLang: 'ja',
      hint: `read this ${script}`,
      answer: k.romaji,
      answerLang: 'romaji',
      accepts: [k.romaji, ...k.alt],
    }
  }
  return {
    source: 'characters',
    prompt: k.romaji,
    promptLang: 'romaji',
    hint: `which ${script} is this?`,
    answer: shape,
    answerLang: 'ja',
    choices: withDistractors(shape, shapes),
    accepts: [shape],
  }
}

const askWord = (w: Word): Question => {
  const faces = ['japanese', 'emoji', 'romaji'] as const
  const from = pick(faces)
  const to = pick(faces.filter((f) => f !== from))
  const show = { japanese: w.japanese, emoji: w.emoji, romaji: w.romaji }
  const lang = { japanese: 'ja', emoji: 'emoji', romaji: 'romaji' } as const
  const named = { japanese: 'the word', emoji: 'the meaning', romaji: 'the reading' }

  const q: Question = {
    source: 'words',
    prompt: show[from],
    promptLang: lang[from],
    hint: `give ${named[to]}`,
    answer: show[to],
    answerLang: lang[to],
    accepts: [show[to]],
  }
  if (to !== 'romaji') {
    q.choices = withDistractors(
      show[to],
      words.map((o) => (to === 'japanese' ? o.japanese : o.emoji)),
    )
  }
  return q
}

const askSentence = (s: Sentence): Question => {
  // Both directions are chosen. A whole Japanese sentence cannot be typed
  // without an IME, and free English cannot be marked without guessing at
  // wording.
  const toEnglish = Math.random() < 0.5
  return {
    source: 'sentences',
    prompt: toEnglish ? s.japanese : s.english,
    promptLang: toEnglish ? 'ja' : 'en',
    hint: toEnglish ? 'what does this do?' : 'which phrase is this?',
    answer: toEnglish ? s.english : s.japanese,
    answerLang: toEnglish ? 'en' : 'ja',
    choices: withDistractors(
      toEnglish ? s.english : s.japanese,
      sentences.map((o) => (toEnglish ? o.english : o.japanese)),
    ),
    accepts: [toEnglish ? s.english : s.japanese],
  }
}

/* ---------- the run ---------- */

let source: Source | 'all' = 'all'
let stage: Stage = 'setup'
let paper: Question[] = []
let at = 0
let given = ''
let right = 0
const missed: Question[] = []

const kanaDeck = makeDeck<Kana>()
const wordDeck = makeDeck<Word>()
const sentenceDeck = makeDeck<Sentence>()

/**
 * Questions come off the same decks the boards deal from, so a test covers
 * the material rather than asking about the same handful of items.
 */
const nextQuestion = (): Question => {
  const from: Source =
    source === 'all' ? pick(['characters', 'words', 'sentences'] as const) : source
  if (from === 'characters') return askCharacter(kanaDeck.deal(kana, 1)[0])
  if (from === 'words') return askWord(wordDeck.deal(words, 1)[0])
  return askSentence(sentenceDeck.deal(sentences, 1)[0])
}

const start = (): void => {
  paper = Array.from({ length: LENGTH }, nextQuestion)
  at = 0
  right = 0
  given = ''
  missed.length = 0
  stage = 'asking'
}

/** Loose enough for spacing and case, strict about the letters themselves. */
const same = (a: string, b: string): boolean =>
  a.trim().toLowerCase().replace(/\s+/g, ' ') === b.trim().toLowerCase().replace(/\s+/g, ' ')

const check = (answer: string): void => {
  given = answer
  const q = paper[at]
  const correct = q.accepts.some((a) => same(a, answer))
  if (correct) right++
  else missed.push(q)
  stage = 'checked'
}

const advance = (): void => {
  if (at + 1 >= paper.length) {
    stage = 'done'
    return
  }
  at++
  given = ''
  stage = 'asking'
}

/* ---------- drawing ---------- */

const langAttr = (lang: Question['promptLang']): string => (lang === 'ja' ? ' lang="ja"' : '')

const setup = (): string => `
  <section class="board">
    <p class="board__note">
      Ten questions, drawn from what you have been studying. Where the answer is
      a reading you type it; where it is Japanese you pick it, because a
      keyboard without an IME cannot write かな.
    </p>
    <div class="controls">
      <div class="toggle toggle--chips" role="group" aria-label="What to test">
        ${SOURCES.map(
          (s) => `<button class="toggle__btn${s.id === source ? ' is-active' : ''}" type="button"
                          data-source="${s.id}" aria-pressed="${s.id === source}">${s.label}</button>`,
        ).join('')}
      </div>
    </div>
    <div class="controls controls--after">
      <button class="btn-deal" type="button" data-start>Start the test</button>
    </div>
  </section>`

const question = (): string => {
  const q = paper[at]
  const done = stage === 'checked'
  const correct = done && q.accepts.some((a) => same(a, given))

  const answerBox = q.choices
    ? `<div class="choices">
         ${q.choices
           .map((c) => {
             const state = !done
               ? ''
               : c === q.answer
                 ? ' is-right'
                 : same(c, given)
                   ? ' is-wrong'
                   : ''
             return `<button class="choice${state}" type="button" data-answer="${c}"
                             ${done ? 'disabled' : ''}${langAttr(q.answerLang)}>${c}</button>`
           })
           .join('')}
       </div>`
    : `<form class="typed" data-typed>
         <input class="typed__field" name="answer" type="text" autocomplete="off"
                autocapitalize="off" spellcheck="false" placeholder="type the reading"
                aria-label="your answer" ${done ? `disabled value="${given}"` : 'autofocus'}>
         ${done ? '' : '<button class="btn-deal" type="submit">Check</button>'}
       </form>`

  return `
    <section class="board">
      <div class="quiz">
        <p class="quiz__progress">
          <span>${at + 1} of ${paper.length}</span>
          <span class="quiz__score">${right} right</span>
        </p>
        <div class="quiz__bar"><span style="width: ${(at / paper.length) * 100}%"></span></div>

        <p class="quiz__hint">${q.hint}</p>
        <p class="quiz__prompt quiz__prompt--${q.promptLang}"${langAttr(q.promptLang)}>${q.prompt}</p>

        ${answerBox}

        ${
          done
            ? `<div class="verdict verdict--${correct ? 'right' : 'wrong'}">
                 <p class="verdict__word">${correct ? 'Correct' : 'Not quite'}</p>
                 ${
                   correct
                     ? ''
                     : `<p class="verdict__answer"${langAttr(q.answerLang)}>${q.answer}</p>`
                 }
                 <button class="btn-deal" type="button" data-next autofocus>
                   ${at + 1 >= paper.length ? 'See the result' : 'Next'}
                 </button>
               </div>`
            : ''
        }
      </div>
    </section>`
}

const result = (): string => {
  const score = Math.round((right / paper.length) * 100)
  return `
    <section class="board">
      <div class="quiz">
        <p class="quiz__hint">done</p>
        <p class="quiz__score-big">${right}<span>/${paper.length}</span></p>
        <p class="board__note">
          ${
            score === 100
              ? 'Every one. Take the next set.'
              : score >= 70
                ? 'Solid. The ones below are worth another look.'
                : 'Worth going back to the boards before the next run.'
          }
        </p>
        ${
          missed.length
            ? `<ul class="missed">
                 ${missed
                   .map(
                     (m) => `<li>
                       <span class="missed__q"${langAttr(m.promptLang)}>${m.prompt}</span>
                       <span class="missed__a"${langAttr(m.answerLang)}>${m.answer}</span>
                     </li>`,
                   )
                   .join('')}
               </ul>`
            : ''
        }
        <div class="controls controls--after">
          <button class="btn-deal" type="button" data-start>Another test</button>
        </div>
      </div>
    </section>`
}

const markup = (): string =>
  stage === 'setup' ? setup() : stage === 'done' ? result() : question()

export const renderTest = (mount: HTMLElement): void => {
  stage = 'setup'

  const paint = () => {
    mount.innerHTML = markup()
    mount.querySelector<HTMLElement>('[autofocus]')?.focus()
  }

  mount.addEventListener('click', (e) => {
    const target = e.target as HTMLElement

    const src = target.closest<HTMLElement>('[data-source]')
    if (src) {
      source = src.dataset.source as Source | 'all'
      paint()
      return
    }
    if (target.closest('[data-start]')) {
      start()
      paint()
      return
    }
    if (target.closest('[data-next]')) {
      advance()
      paint()
      return
    }
    const choice = target.closest<HTMLElement>('[data-answer]')
    if (choice && stage === 'asking') {
      check(choice.dataset.answer!)
      paint()
    }
  })

  // Enter submits the typed answer, and Enter again moves on — a test you have
  // to reach for the mouse between every question is a slower test.
  mount.addEventListener('submit', (e) => {
    e.preventDefault()
    if (stage !== 'asking') return
    const field = (e.target as HTMLFormElement).elements.namedItem('answer') as HTMLInputElement
    check(field.value)
    paint()
  })

  paint()
}
