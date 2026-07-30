# OVERVIEW

## Fundamentals

| Type | One symbol = | Example |
| --- | --- | --- |
| Alphabet | one phoneme (single consonant or vowel) | k + a → "ka" |
| Syllabary | one syllable (in Japanese, one mora) | か → "ka" |
| Logography | one word/morpheme (meaning) | 山 → "mountain" |

Every script trades an **entry fee** against a **running cost**:

- **Entry fee** — symbols you must memorize before you can read anything at all.
  Paid once.
- **Running cost** — symbols it takes to write one word. Paid on every word,
  forever.

| Type | Entry fee | Running cost |
| --- | --- | --- |
| Alphabet | 26 shapes | high — many letters per word |
| Syllabary | 92 shapes (both kana) | medium |
| Logography | 2,136 shapes (jōyō kanji) | low — 1–2 characters per word |

A cheaper entry fee means a higher running cost. The same Japanese word in two
scripts — not two languages:

```
katakana  →  k-a-t-a-k-a-n-a   8 letters  (alphabet)
          →  カ タ カ ナ         4 kana     (syllabary)
```

The entry fee buys recognition speed: a fluent reader sees 図書館 as a shape and
the meaning arrives with no sounding-out in between.

### The three units

Phoneme, syllable, morpheme — each is the smallest unit of something different:

| Unit | Smallest unit of | Example |
| --- | --- | --- |
| **Phoneme** | sound that changes meaning | `cat` = /k/ /æ/ /t/ — swap /k/ for /b/ and you get `bat` |
| **Syllable** | pronunciation, built around a vowel | `water` = wa·ter, two beats of the mouth |
| **Morpheme** | meaning | `cats` = `cat` + plural `-s`, two pieces of meaning |

One word measured all three ways:

```
cats  →  4 phonemes    k · æ · t · s
      →  1 syllable    cats
      →  2 morphemes   cat + plural
```

Phonemes and syllables measure **sound**; morphemes measure **meaning** — two
different axes, not one ladder. That is the real split between the script types:
alphabets and syllabaries both encode sound, only at different grain sizes,
while logographies encode meaning instead. It is why kanji alone cannot write
Japanese grammar, and why kana had to exist.

### Character or letter?

**Character** is the general term for any written symbol. **Letter** is specific
to alphabets, where one symbol is one phoneme. Kanji and kana are characters,
never letters — only romaji has letters.

| Symbol | Term |
| --- | --- |
| 漢字 kanji | character (logograph) |
| ひらがな, カタカナ | character (syllabogram) |
| a–z romaji | letter |

## History

Japanese had no writing at all until Chinese characters arrived. Every script
below exists to patch the mismatch between a writing system built for Chinese
and a language shaped nothing like it.

| When | What | How |
| --- | --- | --- |
| ~5th c. | **Kanji** arrive from China, via the Korean peninsula | Imported wholesale. Scribes first wrote in Classical Chinese — a foreign language — the way medieval Europe wrote in Latin. |
| ~8th c. | **Man'yōgana** | The key invention: use a kanji for its *sound* only, discarding its meaning, so Japanese grammar could finally be written. Named for the *Man'yōshū*, c. 759. |
| ~9th c. | **Hiragana**, **Katakana** | Man'yōgana worn down into simpler shapes by two different shortcuts. |
| 16th c. | **Romaji** | European missionaries transcribing Japanese by ear into Latin letters. |

Nobody invented the kana — they eroded out of man'yōgana over roughly two
centuries of scribes cutting corners. Two habits, two results, often from the
same source character:

```
            加  ("add", read ka)
           ╱                  ╲
   written fast,          left piece
   whole, cursive          clipped off
        ↓                       ↓
        か                      カ
    hiragana                katakana
```

Cursive whole → round and flowing; clipped fragment → angular. That is the
entire visual difference between the two kana sets. Hiragana is associated with
the Heian court women who wrote the era's major literature in it (*The Tale of
Genji*, c. 1000) while Chinese remained the prestige script for men — hence its
old name 女手 *onnade*, "women's hand." Katakana came instead from Buddhist
monks, as clipped margin notes for reading Chinese sutras aloud in Japanese.

The split bought something nobody planned: dense shapes carry content, sparse
shapes carry grammar. A reader parses the structure of a sentence before reading
any word in it — which is how Japanese manages without spaces between words.

**Kanji carry two kinds of reading**, because Japan already had spoken words
before the characters arrived:

| | 山 | 水 | Source |
| --- | --- | --- | --- |
| **on'yomi** | san | sui | approximated Chinese pronunciation |
| **kun'yomi** | yama | mizu | the native Japanese word that already existed |

**Romaji sits at a different level** from the other three — it is how Japanese is
*transcribed*, not how it is written. The mapping is clean because nearly every
mora is consonant+vowel, but it works in one direction only: kana cannot write
consonant clusters (`strengths` → ストレングス). Jesuit-era romanization spells
日本 as *Nifon*, freezing a 16th-century pronunciation of は closer to /fa/.

The competing modern systems disagree because they optimize for opposite things.
Hepburn (1867) is built around English pronunciation and collapses じ/ぢ to `ji`;
Nihon-shiki (1885) and Kunrei-shiki (1937) are built around the kana grid and
keep them as `zi`/`di`. The same split makes し・ち・つ・ふ read *shi, chi, tsu,
fu* in Hepburn but *si, ti, tu, hu* in Kunrei.

## The four scripts

| Script | Type | Shapes | Carries |
| --- | --- | --- | --- |
| **Hiragana** | Syllabary | 46 | native words, and all grammar — particles, verb endings |
| **Katakana** | Syllabary | 46 | loanwords, onomatopoeia, emphasis |
| **Kanji** | Logography | 2,136 jōyō | content words — nouns, verb and adjective stems |
| **Romaji** | Alphabet | 26 | transcription, and typing: `nihongo` → にほんご → 日本語 |

### Kana: the mora and the 46

Kana is not strictly syllabic. Its unit is the **mora** — a unit of timing.
Every kana is one mora, except the small ゃゅょ, which merge with the preceding
kana into a single mora. っ and ん are each a mora of their own.

Morae and syllables do not count the same:

| Word | Morae | Syllables |
| --- | --- | --- |
| にほん Nihon | 3 — に・ほ・ん | 2 |
| きって kitte | 3 — き・っ・て | 2 |
| とうきょう Tōkyō | 4 — と・う・きょ・う | 2 |

Japanese rhythm is counted in morae: haiku's 5-7-5 counts morae, not syllables.
Romaji flattens this — "Tokyo" hides four beats.

Both kana sets number 46 because they render this same inventory: あ↔ア, か↔カ,
all the way down. The count comes from the 五十音 *gojūon* grid, 5 vowels × 10
consonant rows:

| | a | i | u | e | o |
| --- | --- | --- | --- | --- | --- |
| — | あ ア | い イ | う ウ | え エ | お オ |
| k | か カ | き キ | く ク | け ケ | こ コ |
| s | さ サ | し シ | す ス | せ セ | そ ソ |
| t | た タ | ち チ | つ ツ | て テ | と ト |
| n | な ナ | に ニ | ぬ ヌ | ね ネ | の ノ |
| h | は ハ | ひ ヒ | ふ フ | へ ヘ | ほ ホ |
| m | ま マ | み ミ | む ム | め メ | も モ |
| y | や ヤ | — | ゆ ユ | — | よ ヨ |
| r | ら ラ | り リ | る ル | れ レ | ろ ロ |
| w | わ ワ | — | — | — | を ヲ |

```
 50  grid slots
 −5  sounds that do not exist (yi, ye, wi, wu, we)
 +1  ん, which has no vowel and sits outside the grid
 ───
 46
```

(ゐ *wi* and ゑ *we* did exist; both were retired in the 1946 spelling reform.)

Past those 46 shapes, the remaining sounds come from **rules**, not from new
characters:

| Rule | Effect | Adds |
| --- | --- | --- |
| ゛ dakuten | voices it — か→が, は→ば | 20 |
| ゜ handakuten | は row → ぱ row | 5 |
| small ゃゅょ | き + ゃ → きゃ | 33 |

So the entry fee is 46 shapes plus 3 rules per set — not 104 separate characters.

### Hiragana or katakana?

The two kana are 1:1 twins over the same 46 sounds. Which set a word takes is a
property of the word itself, not of its position in the sentence.

That is where the tempting comparison to uppercase and lowercase breaks. It
holds for the shapes, but not for the usage. You can recase an English word
freely — cat, Cat, CAT are all still the same correct word. You cannot re-kana
one: コーヒー written as こーひー is not a style choice, it looks broken. For
usage the closer analogy is *italics*, which English also reserves for foreign
words. The exception is emphasis, where the two line up exactly — だめ → ダメ
works like "no" → "NO".

### Borrowing into katakana

Romaji and katakana are mirror images — each projects one sound system onto the
other's script. What they produce differs. Romaji writes Japanese in foreign
clothes: `nihongo` is not an English word. Katakana does the opposite, and
naturalizes foreign words into Japanese. コンピューター is not English written
in kana; it is a Japanese word, with Japanese morae, used by Japanese speakers
speaking Japanese.

A foreign word enters Japanese by being forced through the mora system. Three
rules:

1. **Use the sound, not the spelling** — `knife` → ナイフ, the silent k vanishes.
2. **Give every stranded consonant a vowel** — `u` by default, but `o` after t
   and d, because *tu* and *du* would distort into *tsu* and *zu*.
3. **Swap the sounds Japanese does not have:**

| English | Becomes | Example |
| --- | --- | --- |
| l and r | r | light, right → both ライト |
| v | b | video → ビデオ |
| th | s or z | three → スリー |

```
strike  →  s · t · r+ai · k  →  ストライク    one syllable in, five morae out
```

This decodes katakana reliably; it does **not** reliably generate it. Established
loanwords are conventional and often clipped — スマホ (smartphone), パソコン
(personal computer) — and many are 和製英語 *wasei-eigo*, English-shaped words
that are not English: マンション is an apartment, バイキング is a buffet.

So katakana teaches Japanese vocabulary, not English. Learn "computer" as
コンピューター and an English speaker may not recognize it — a problem common
enough to have its own name, カタカナ英語.
