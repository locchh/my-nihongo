/**
 * The homepage picture, ported from the "Japanese scenic homepage" design:
 * sun, cloud banks, Fuji, a sakura branch with a bird on it, and petals.
 *
 * The geometry here is the design's, kept verbatim — these paths are drawn
 * artwork and nothing good comes of me adjusting the numbers. What changed in
 * the port is where the colours live: the design carried them inline, and here
 * every one that varies by time of day resolves to a CSS variable instead, so
 * the scene is built once and repainted by changing one attribute.
 *
 * The other change is the loops. The design used its own `<sc-for>` template
 * tag for petals and blossoms; those are generated here in TypeScript.
 */

/** Deterministic scatter — the same one the design used, so it looks identical. */
const rand = (seed: number): number => {
  const x = Math.sin(seed * 127.1) * 43758.5453
  return x - Math.floor(x)
}

/* ---------- sky ---------- */

/** Cloud banks: viewBox, the paths in it, and where the bank sits. */
const CLOUDS: { box: string; cls: string; paths: [string, number][] }[] = [
  {
    box: '0 0 400 90',
    cls: 'cloud cloud--a',
    paths: [
      ['M 20 78 C 8 78 2 70 2 62 C 2 52 10 46 20 46 C 22 30 36 18 54 18 C 66 6 86 2 102 10 C 112 0 132 -2 146 8 C 162 2 182 6 192 20 C 208 16 226 24 232 40 C 244 40 254 48 254 60 C 254 70 246 78 234 78 Z', 1],
      ['M 290 74 C 282 74 278 68 278 62 C 278 56 283 51 290 51 C 293 40 303 33 315 33 C 325 25 341 25 351 32 C 362 28 375 34 379 45 C 388 46 394 53 394 62 C 394 69 388 74 380 74 Z', 0.8],
    ],
  },
  {
    box: '0 0 260 70',
    cls: 'cloud cloud--b',
    paths: [
      ['M 22 62 C 10 62 4 55 4 48 C 4 40 11 35 20 35 C 23 22 35 13 50 13 C 60 3 78 1 91 9 C 104 3 121 8 128 21 C 141 19 154 27 158 39 C 168 40 174 47 174 55 C 174 61 169 62 162 62 Z', 1],
    ],
  },
  {
    box: '0 0 400 90',
    cls: 'cloud cloud--c',
    paths: [
      ['M 26 80 C 12 80 4 72 4 62 C 4 52 12 45 24 45 C 28 28 44 16 63 16 C 76 4 98 2 114 12 C 130 4 152 8 163 24 C 180 20 199 30 205 46 C 218 46 228 55 228 66 C 228 75 220 80 208 80 Z', 1],
      ['M 280 70 C 272 70 267 65 267 59 C 267 53 272 48 279 48 C 282 38 291 31 302 31 C 312 24 326 24 335 31 C 346 27 358 33 362 43 C 370 44 376 50 376 58 C 376 65 370 70 362 70 Z', 0.75],
    ],
  },
]

const sky = (): string =>
  `<div class="sun"></div>` +
  CLOUDS.map(
    ({ box, cls, paths }) => `
    <svg class="${cls}" viewBox="${box}" aria-hidden="true">
      ${paths.map(([d, o]) => `<path d="${d}" opacity="${o}"/>`).join('')}
    </svg>`,
  ).join('')

/* ---------- the mountain ---------- */

/** The ridge, summit notches and all. Drawn art — do not tidy the numbers. */
const RIDGE =
  'M -140 660 C 140 610 340 480 480 320 C 560 226 630 100 656 62 L 664 60 L 678 48 ' +
  'L 692 54 L 706 44 L 722 50 L 736 42 L 752 52 L 766 48 L 778 58 L 784 62 ' +
  'C 810 100 880 226 960 320 C 1100 480 1300 610 1580 660 Z'

/** The lit western flank, laid over the body as a wash. */
const LIT =
  'M -140 660 C 140 610 340 480 480 320 C 560 226 630 100 656 62 L 664 60 L 678 48 ' +
  'L 692 54 L 706 44 L 712 42 C 686 130 640 260 576 380 C 500 520 320 620 100 660 Z'

/** The shaded eastern flank. */
const SHADE =
  'M 784 62 C 810 100 880 226 960 320 C 1100 480 1300 610 1580 660 L 1080 660 ' +
  'C 1000 520 900 330 800 120 Z'

/** The snow cap: a smooth upper edge, and a lower edge of hanging tongues. */
const SNOW =
  'M 552 250 C 592 160 630 88 658 60 L 666 54 L 680 42 L 694 48 L 708 38 L 724 44 ' +
  'L 738 36 L 754 46 L 768 42 L 780 52 L 782 60 C 810 88 848 160 888 250 ' +
  'L 866 288 L 850 254 L 832 322 L 815 262 L 797 348 L 780 270 L 762 378 L 744 268 ' +
  'L 726 336 L 709 256 L 691 306 L 674 250 L 656 282 L 638 246 L 618 274 L 600 248 ' +
  'L 580 266 L 564 244 Z'

/** The shaded half of the cap. */
const SNOW_SHADE =
  'M 724 44 L 738 36 L 754 46 L 768 42 L 780 52 L 782 60 C 810 88 848 160 888 250 ' +
  'L 866 288 L 850 254 L 832 322 L 815 262 L 797 348 L 780 270 L 762 378 L 744 268 ' +
  'L 726 336 L 712 260 L 714 140 Z'

/**
 * How much of the summit is cut away, in art units.
 *
 * Cropping the viewBox rather than letting the container do it is what makes
 * the truncation constant. Left to `slice`, how much is hidden depends on the
 * shape of the window: a wide one is scaled by its width and loses a lot off
 * the top, while a tall narrow one is scaled by its height and loses nothing
 * at all — so the peak appeared and disappeared as the window changed. Taking
 * it out of the coordinate system hides it at every size.
 *
 * It pairs with the height of `.fuji`: the two are set so the cropped box and
 * the container share an aspect ratio, which is what stops `slice` adding a
 * second, window-dependent crop on top of this one.
 */
const HIDE_SUMMIT = 127

/** Two birds in the distance, off to the east. */
const FAR_BIRDS = 'M 950 70 q 9 -11 18 0 q 9 -11 18 0 M 1050 38 q 8 -10 16 0 q 8 -10 16 0'

const mountain = (): string => `
  <div class="fuji">
    <svg viewBox="0 ${HIDE_SUMMIT} 1440 ${660 - HIDE_SUMMIT}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="fuji-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" class="fuji-body-top"/>
          <stop offset="1" class="fuji-body-bottom"/>
        </linearGradient>
      </defs>
      <path class="far-birds" d="${FAR_BIRDS}"/>
      <path class="fuji-body" d="${RIDGE}"/>
      <path class="fuji-lit" d="${LIT}"/>
      <path class="fuji-shade" d="${SHADE}"/>
      <path class="fuji-snow" d="${SNOW}"/>
      <path class="fuji-snow-shade" d="${SNOW_SHADE}"/>
    </svg>
  </div>`

/* ---------- the branch, and what is sitting on it ---------- */

/** Limb, forks and thorns. The whole bough in one group of filled shapes. */
const LIMB: [string, string][] = [
  ['bough', 'M 0 10 L 90 22 C 150 30 210 46 270 70 L 340 100 C 420 134 500 176 570 226 L 640 282 C 680 316 710 344 730 372 L 722 382 C 700 354 668 326 630 294 L 560 240 C 492 192 414 152 336 118 L 266 88 C 208 64 150 48 88 40 L 0 32 Z'],
  ['bough-lit', 'M 0 14 L 90 26 C 150 34 208 50 266 73 L 336 103 C 412 137 490 178 558 227 L 556 233 C 488 185 412 145 333 111 L 264 81 C 207 58 150 42 89 34 L 0 26 Z'],
  ['twig', 'M 296 82 C 340 58 392 40 450 32 C 490 26 526 24 556 26 L 555 34 C 526 33 492 35 454 41 C 398 49 348 66 304 90 Z'],
  ['twig-lit', 'M 466 38 C 486 24 510 14 538 8 L 540 15 C 514 21 492 30 472 44 Z'],
  ['twig', 'M 428 142 C 452 176 470 212 480 250 C 486 272 489 292 489 308 L 481 308 C 480 293 477 274 471 253 C 461 217 444 183 420 150 Z'],
  ['twig-lit', 'M 470 230 C 486 244 498 262 506 282 L 499 285 C 491 266 480 250 465 237 Z'],
  ['twig', 'M 596 250 C 624 232 656 220 692 214 L 694 222 C 660 228 630 239 604 257 Z'],
  ['twig-lit', 'M 218 78 C 232 96 242 114 248 134 L 240 136 C 234 118 224 100 211 84 Z'],
  ['twig-lit', 'M 148 42 C 162 32 178 24 196 20 L 198 27 C 181 31 166 38 154 48 Z'],
  ['twig', 'M 352 106 l 11 16 l -8 5 z M 520 196 l 13 12 l -7 7 z M 660 300 l 12 14 l -8 5 z M 250 66 l -8 -16 l 8 -3 z'],
]

/** Where the blossoms sit on the bough, as percentages of its box. */
const SPOTS: [number, number][] = [
  [20, 9], [33, 16], [47, 25], [60, 36], [71, 48], [79, 63],
  [42, 11], [52, 7], [61, 5], [59, 2],
  [51, 34], [54, 48], [72, 41], [77, 39], [27, 22], [21, 4],
]

/*
 * Everything on the bough is measured in one unit: percent of the branch's
 * width. The box is 62 of those units tall, because that is its padding ratio.
 *
 * Sizing the blossoms this way rather than in pixels is what makes the layout
 * hold together — bird, blossoms and speech box then scale as one, so a
 * clearance checked at any width is a clearance at every width.
 */
const BOX_H = 62

/** The design's blossom sizes were pixels at this branch width. */
const REF_W = 695

/**
 * Rectangles nothing may grow into: the bird, and the box it speaks from.
 * Derived from their CSS placement — the bird sits at left 58% / top 62.5%
 * with a width of 9%, and the box hangs above and to its left.
 */
const RESERVED: { x0: number; y0: number; x1: number; y1: number }[] = [
  { x0: 52, y0: 28.5, x1: 64, y1: 41 },
  { x0: 32.5, y0: 13, x1: 65, y1: 28.5 },
]

const clashes = (x0: number, y0: number, w: number): boolean =>
  RESERVED.some((r) => x0 < r.x1 && x0 + w > r.x0 && y0 < r.y1 && y0 + w > r.y0)

/**
 * Five petals round a pale centre.
 *
 * Blossoms that would land on the bird or its speech box are dropped rather
 * than nudged: the bough is dense enough that one missing flower reads as
 * nothing at all, while a flower behind the bird's head reads as a mistake.
 */
const blossoms = (): string =>
  SPOTS.map(([l, t], i) => {
    const w = (20 + rand(i + 3) * 20) / (REF_W / 100)
    // The bough is drawn flipped, so a spot's screen position is measured from
    // the bottom of the box, not the top.
    const y0 = BOX_H - (t / 100) * BOX_H - w
    return { l, t, w, y0, rot: rand(i + 9) * 360 }
  })
    .filter(({ l, y0, w }) => !clashes(l, y0, w))
    .map(({ l, t, w, rot }) => {
      const petals = [0, 72, 144, 216, 288]
        .map((a) => `<span class="blossom__petal" style="transform: rotate(${a}deg)"></span>`)
        .join('')
      return `
      <span class="blossom" style="
        left: ${l}%; top: ${t}%;
        width: ${w.toFixed(2)}cqw; height: ${w.toFixed(2)}cqw;
        transform: rotate(${rot.toFixed(0)}deg)">${petals}<span class="blossom__eye"></span></span>`
    })
    .join('')

/** The bird. Its colours are its own — it is not lit by the sky. */
const bird = (): string => `
  <svg class="bird" viewBox="0 0 100 100" aria-hidden="true">
    <path fill="#58a6de" d="M 4 70 C 8 60 14 50 24 42 C 30 22 50 12 68 16 C 80 12 90 18 90 28 C 92 34 90 40 86 44 C 86 64 72 82 50 86 C 34 89 16 84 8 74 C 6 73 4 72 4 70 Z"/>
    <path fill="#f6ecdf" d="M 50 86 C 68 82 80 68 84 52 C 72 44 58 48 52 60 C 47 70 46 80 50 86 Z"/>
    <path fill="#f0b45c" d="M 58 38 C 48 30 32 32 22 42 C 12 52 6 62 4 68 C 16 66 34 60 46 52 C 52 48 56 44 58 38 Z"/>
    <path fill="#e8795f" d="M 46 52 C 34 60 16 66 4 68 C 8 72 18 74 30 70 C 40 66 48 60 52 54 Z"/>
    <path stroke="#a8d4f0" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="6 7"
          d="M 40 22 q 6 -3 12 -2 M 56 28 q 5 1 8 5 M 60 18 q 5 0 9 3 M 10 76 q 8 1 16 -2 M 62 64 q -2 6 -6 10"/>
    <circle cx="76" cy="26" r="3" fill="#241a12"/>
    <circle cx="70" cy="33" r="3.4" fill="#ec9fae"/>
    <path fill="#3a2620" d="M 86 22 C 94 24 98 28 99 31 C 96 34 90 35 84 34 C 81 30 82 25 86 22 Z"/>
    <path stroke="#33241c" stroke-width="2.6" stroke-linecap="round" fill="none"
          d="M 56 87 l 2 7 l 7 3 m -7 -3 l -5 4 M 68 84 l 2 8 l 7 3 m -7 -3 l -5 4"/>
  </svg>`

/*
 * The bough is drawn flipped, which is how the design gets a limb that sweeps
 * up out of the corner from a path that descends. The bird is deliberately
 * outside that flip — it perches, it does not hang.
 */
const branch = (say: Saying): string => `
  <div class="branch">
    <div class="branch__flip">
      <svg viewBox="0 0 900 558" aria-hidden="true">
        ${LIMB.map(([cls, d]) => `<path class="${cls}" d="${d}"/>`).join('')}
      </svg>
      ${blossoms()}
    </div>
    ${bird()}
    <div class="say">
      <p class="say__ja" lang="ja">${say.ja}</p>
      <p class="say__en">${say.en}</p>
    </div>
  </div>`

/* ---------- petals ---------- */

const PETALS = 18

/**
 * Two nested elements per petal: the outer one falls at a constant rate, the
 * inner one sways on its own clock. One element cannot do both without the
 * sway restarting every time the fall does.
 */
const petals = (): string =>
  Array.from({ length: PETALS }, (_, i) => {
    const left = rand(i + 1) * 100
    const size = 9 + rand(i + 7) * 9
    const fall = 9 + rand(i + 13) * 12
    const sway = 3 + rand(i + 31) * 3
    return `
      <span class="petal" style="
        left: ${left.toFixed(2)}%;
        width: ${size.toFixed(1)}px; height: ${(size * 0.82).toFixed(1)}px;
        animation-duration: ${fall.toFixed(2)}s;
        animation-delay: -${(rand(i + 21) * fall).toFixed(2)}s">
        <span class="petal__blade" style="
          opacity: ${(0.55 + rand(i + 41) * 0.4).toFixed(2)};
          animation-duration: ${sway.toFixed(2)}s"></span>
      </span>`
  }).join('')

export interface Saying {
  ja: string
  en: string
}

export const renderScene = (say: Saying): string =>
  `${sky()}${mountain()}${branch(say)}<div class="petals" aria-hidden="true">${petals()}</div>`
