# The data

Everything the app teaches lives in this folder. Adding material is editing
JSON — no code, and nothing to register anywhere else. Every board and the test
pick up new entries on their own.

## The `learned` flags are the syllabus

`learned` on a word, and `learnedHiragana` / `learnedKatakana` on a character,
are not only decoration. They decide what the Flashcards board deals: the
character deck draws from what is marked in either kana, the word deck from
what is marked, and a character is only ever *asked* in a kana you have marked
— being shown ア before you have met it is a riddle rather than a question.

Mark nothing and the deck falls back to dealing everything, so a fresh checkout
still works. The board says which of the two it is doing.

The wall chart and the test are unaffected: both always cover the lot.

## words.json — the Words cards, and word questions in the test

```json
{
  "japanese": "かさ",
  "romaji": "kasa",
  "emoji": "☂️",
  "gloss": "umbrella",
  "script": "hiragana",
  "learned": false
}
```

`emoji` is the meaning, and it is deliberately not an English word: the deck is
meant to build a direct hop from the Japanese to the thing, and English in the
middle is one more step to translate through. `gloss` is what a screen reader
announces for that emoji — it never appears on a card.

`script` is `hiragana` or `katakana`, and it is a property of the word rather
than a choice: native words take hiragana, borrowed ones katakana.

The card's colour comes from the row its first character belongs to, so かさ
sits in the same band as か on the wall chart. That is worked out from
`kana.json` — there is nothing to set.

## sentences.json — the Phrases board, and phrase questions in the test

```json
{
  "japanese": "またね",
  "romaji": "mata ne",
  "english": "see you",
  "topic": "farewell",
  "register": "casual",
  "note": "",
  "learned": false
}
```

`register` is `casual`, `neutral` or `polite`, and it is worth getting right —
saying やあ to a stranger is its own kind of mistake, and the tag is the only
thing on the board that warns you.

`note` is for when the phrase does something English does not: こんにちは
spelling は and reading *wa*, さようなら carrying more finality than "goodbye".
Leave it `""` when there is nothing to say. Empty notes are not rendered.

`topic` must match an `id` in `topics.json`. If it does not, the phrase still
appears — under a chip labelled with the raw topic string — so a typo is
visible rather than a phrase that silently vanishes.

Write phrases in kana without kanji, like everything else here. Real Japanese
spells おげんきですか as お元気ですか, but a reader who cannot yet read kana
gains nothing from the kanji and loses the practice.

## topics.json — the headings the phrases are filed under

```json
{ "id": "farewell", "title": "Leaving", "ja": "わかれ" }
```

A topic with no phrases in it is not shown, so adding one here first is
harmless.

## kana.json — the wall chart, the character flashcards, and the test

The gojūon, and unlikely to need changing: it is a closed set. `learnedHiragana`
and `learnedKatakana` drive the ring that marks what you already know and the
flashcard deck above, and are the two fields worth editing as you go. On a
flashcard the ring means both kana, since the card can ask in either.

`obsolete` marks ゐ and ゑ, retired in the 1946 reform. They appear greyed on
the chart and are left out of the cards and the test.

## What is still in code

Only two lists, and neither grows with the material:

- the four kana groups — base, dakuten, handakuten, yōon — in `characters.ts`,
  which is the fixed shape of the writing system
- the sections themselves, in `types.ts`, which is navigation rather than
  content
