import sentenceData from './data/sentences.json'
import { makeDeck } from './deck.ts'
import type { Register, Sentence } from './types.ts'

const sentences = sentenceData as Sentence[]

/**
 * The phrasebook: set expressions, filed under the moment you would use them.
 *
 * Words and kana are drilled as cards, because the answer is one thing and you
 * either have it or you do not. A phrase is not like that. Knowing さようなら
 * is not knowing when to say it — it carries a weight of parting that makes it
 * wrong on the way out of the office — so these are rows you read down, with
 * the reading and the sense hidden until you ask.
 *
 * A few at a time, though, not the lot. Twenty phrases on one screen is a wall
 * to scroll past rather than anything you would read, and the deck they come
 * off is the same one the word cards use, so working through a topic shows you
 * all of it before it shows you anything twice.
 */

const HAND = 3

const TOPICS: { id: string; title: string; ja: string }[] = [
  { id: 'all', title: 'Everything', ja: 'ぜんぶ' },
  { id: 'greeting', title: 'Greetings', ja: 'あいさつ' },
  { id: 'introduction', title: 'Introductions', ja: 'じこしょうかい' },
  { id: 'wellbeing', title: 'How are you', ja: 'ごきげん' },
  { id: 'courtesy', title: 'Thanks and sorry', ja: 'れいぎ' },
  { id: 'farewell', title: 'Leaving', ja: 'わかれ' },
]

const REGISTER: Record<Register, string> = {
  casual: 'casual',
  neutral: 'any',
  polite: 'polite',
}

let topic = 'all'
const deck = makeDeck<Sentence>()
let hand: Sentence[] = []

/**
 * The pool is cached rather than filtered on each deal, because the deck reads
 * the array's identity to tell a changed selection from an unchanged one.
 */
let pool: Sentence[] = sentences
let pooledFor = 'all'

const poolFor = (id: string): Sentence[] => {
  if (id !== pooledFor) {
    pool = id === 'all' ? sentences : sentences.filter((s) => s.topic === id)
    pooledFor = id
  }
  return pool
}

const deal = (): void => {
  hand = deck.deal(poolFor(topic), HAND)
}

const chips = (): string => `
  <div class="toggle toggle--chips" role="group" aria-label="Topic">
    ${TOPICS.map(
      (t) => `<button class="toggle__btn${t.id === topic ? ' is-active' : ''}" type="button"
                      data-topic="${t.id}" aria-pressed="${t.id === topic}">${t.title}</button>`,
    ).join('')}
  </div>`

const phrase = (s: Sentence): string => `
  <li>
    <button class="phrase${s.learned ? ' phrase--learned' : ''}" type="button"
            aria-expanded="false">
      <span class="phrase__head">
        <span class="phrase__ja" lang="ja">${s.japanese}</span>
        <span class="phrase__tag phrase__tag--${s.register}">${REGISTER[s.register]}</span>
      </span>
      <!-- Hidden from the accessibility tree as well as the eye: read out with
           the prompt, it would answer the question before it is asked. -->
      <span class="phrase__answer" aria-hidden="true">
        <span class="phrase__romaji">${s.romaji}</span>
        <span class="phrase__en">${s.english}</span>
        ${s.note ? `<span class="phrase__note">${s.note}</span>` : ''}
      </span>
    </button>
  </li>`

const markup = (): string => {
  const here = poolFor(topic)
  const done = here.filter((s) => s.learned).length
  const name = TOPICS.find((t) => t.id === topic)!
  return `
    <section class="board">
      <div class="controls">${chips()}</div>
      <p class="board__note">
        Tap a phrase to see how it is read and what it does. The tag says who
        you can say it to — the wrong register is its own kind of mistake.
      </p>
      <section class="group">
        <h2 class="group__title">
          ${name.title}
          <span class="group__note" lang="ja">${name.ja}</span>
          <span class="group__count">${done}/${here.length}</span>
        </h2>
        <ul class="phrases">${hand.map(phrase).join('')}</ul>
      </section>
      <div class="controls controls--after">
        <button class="btn-deal" type="button" data-deal>Next ${hand.length}</button>
        <p class="deal__left">${deck.left()} left before this topic comes round again</p>
      </div>
    </section>`
}

export const renderSentences = (mount: HTMLElement): void => {
  const paint = () => {
    mount.innerHTML = markup()
  }

  mount.addEventListener('click', (e) => {
    const target = e.target as HTMLElement

    const pick = target.closest<HTMLElement>('[data-topic]')
    if (pick) {
      const next = pick.dataset.topic!
      if (next !== topic) {
        topic = next
        deal()
        paint()
      }
      return
    }

    if (target.closest('[data-deal]')) {
      deal()
      paint()
      return
    }

    const opened = target.closest<HTMLElement>('.phrase')
    if (!opened) return
    const isOpen = opened.classList.toggle('is-open')
    opened.setAttribute('aria-expanded', String(isOpen))
    opened
      .querySelector<HTMLElement>('.phrase__answer')
      ?.setAttribute('aria-hidden', String(!isOpen))
  })

  deal()
  paint()
}
