import type { Limit, Usage } from '../types'

const GLYPHS = 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789'
// The mod is told no language, so the labels follow the system's: German there, English anywhere else.
const WORDS = Intl.DateTimeFormat().resolvedOptions().locale.startsWith('de')
  ? { context: 'KONTEXT', fiveHours: '5 STD', week: 'WOCHE', cost: 'KOSTEN', estimate: 'Schätzung · Sitzung' }
  : { context: 'CONTEXT', fiveHours: '5 H', week: 'WEEK', cost: 'COST', estimate: 'estimate · session' }
const GREEN = '#22e06b'
const AMBER = '#f0b429'
const RED = '#ff5f5f'

// Seeded, so a redraw draws the same rain.
function prng(seed: number): () => number {
  let a = seed

  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function glyph(random: () => number): string {
  return GLYPHS[Math.floor(random() * GLYPHS.length)] ?? '0'
}

function tone(percent: number): string {
  return percent >= 90 ? RED : percent >= 70 ? AMBER : GREEN
}

// Three depths: far columns small, dim and slow, near ones large, bright and quick.
const DEPTHS = [
  { count: 14, size: 13, opacity: 0.3, seconds: 30, spread: 16 },
  { count: 14, size: 18, opacity: 0.55, seconds: 20, spread: 12 },
  { count: 10, size: 26, opacity: 0.9, seconds: 12, spread: 8 },
]

function rain(random: () => number): string {
  let out = ''

  for (const depth of DEPTHS) {
    for (let i = 0; i < depth.count; i += 1) {
      const x = Math.round(((i + 0.5) * 1600) / depth.count + (random() - 0.5) * 70)
      const length = 9 + Math.floor(random() * 14)
      const step = depth.size + 4
      const rest = 120 + Math.floor(random() * 900)
      const seconds = depth.seconds + Math.floor(random() * depth.spread)
      const delay = -Math.floor(random() * seconds)
      let glyphs = ''

      for (let g = 0; g < length; g += 1) {
        const isHead = g === length - 1
        const opacity = isHead ? 1 : (0.06 + (0.8 * g) / length).toFixed(2)

        glyphs += `<tspan x="0" dy="${step}" fill-opacity="${opacity}"${isHead ? ' fill="#e4ffec"' : ''}>${glyph(random)}</tspan>`
      }
      out += `<g transform="translate(${x} 0)" opacity="${depth.opacity}"><g class="c" transform="translate(0 ${rest})" style="animation-duration:${seconds}s;animation-delay:${delay}s"><text font-size="${depth.size}" y="${-length * step}">${glyphs}</text></g></g>`
    }
  }

  return out
}

// A closed wave from far left to far right, down past the foot: wide enough to slide a whole wavelength.
function wave(y: number, height: number, half: number): string {
  let d = `M-800 ${y}q${half / 2} ${-height} ${half} 0`

  for (let x = -800 + half; x < 2800; x += half) {
    d += `t${half} 0`
  }

  return `${d}V1100H-800Z`
}

/**
 * The backdrop: code rain falling into a pool of code whose surface stands at the
 * context window's fill. `level` is a whole percentage, or -1 before a reading.
 */
export function backdropScene(level: number): string {
  const random = prng(1999)
  const fill = Math.max(0, Math.min(100, level))
  const surface = Math.round(930 - fill * 8.1)
  const color = tone(fill)
  const label = level < 0 ? `${WORDS.context} –` : `${WORDS.context} ${fill}%`
  let marks = ''
  let rows = ''
  let labels = ''
  let ripples = ''

  for (const mark of [25, 50, 75, 100]) {
    const y = Math.round(930 - mark * 8.1)

    marks += `<path d="M0 ${y}H1600" stroke="#2c8a52" stroke-opacity="${mark > fill ? 0.32 : 0}" stroke-dasharray="2 12"/>`
  }

  const depth = 1000 - surface

  for (let y = surface + 36, row = 0; y < 1010 && row < 34; y += 32, row += 1) {
    let line = ''

    for (let g = 0; g < 84; g += 1) {
      line += glyph(random)
    }
    const opacity = (0.26 - (0.19 * (y - surface)) / depth).toFixed(2)

    rows += `<text class="${row % 2 === 0 ? 'sa' : 'sb'}" x="-80" y="${y}" fill-opacity="${opacity}">${line}</text>`
  }

  // One label, in the gap between the desktop app's sidebar and its conversation.
  labels += `<text x="262" y="${surface - 16}">${label}</text>`

  for (let i = 0; i < 5; i += 1) {
    const x = Math.round(120 + i * 330 + random() * 120)

    ripples += `<ellipse class="r" cx="${x}" cy="${surface + 3}" rx="${44 + i * 5}" ry="5" opacity="0" style="animation-delay:${(-i * 1.3).toFixed(1)}s"/>`
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">` +
    `<style>` +
    `.c{animation-name:fall;animation-timing-function:linear;animation-iteration-count:infinite}` +
    `@keyframes fall{from{transform:translateY(-40px)}to{transform:translateY(1700px)}}` +
    `.wa{animation:wl 19s linear infinite}@keyframes wl{to{transform:translateX(-440px)}}` +
    `.wb{animation:wr 12s linear infinite}@keyframes wr{from{transform:translateX(-320px)}to{transform:translateX(0px)}}` +
    `.sa{animation:slosh 17s ease-in-out infinite alternate}.sb{animation:slosh 23s ease-in-out infinite alternate-reverse}` +
    `@keyframes slosh{from{transform:translateX(-42px)}to{transform:translateX(42px)}}` +
    `.r{transform-box:fill-box;transform-origin:center;animation:rip 6.5s ease-out infinite}` +
    `@keyframes rip{0%{transform:scale(.08);opacity:.75}70%,100%{transform:scale(1);opacity:0}}` +
    `</style>` +
    `<defs>` +
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#010402"/><stop offset="1" stop-color="#04130a"/></linearGradient>` +
    `<linearGradient id="deep" gradientUnits="userSpaceOnUse" x1="0" y1="${surface}" x2="0" y2="1000"><stop offset="0" stop-color="${color}" stop-opacity=".20"/><stop offset="1" stop-color="${color}" stop-opacity=".03"/></linearGradient>` +
    `<clipPath id="above"><rect width="1600" height="${surface + 4}"/></clipPath>` +
    `<clipPath id="below"><rect y="${surface + 10}" width="1600" height="${depth}"/></clipPath>` +
    `</defs>` +
    `<rect width="1600" height="1000" fill="url(#sky)"/>` +
    marks +
    `<g clip-path="url(#above)"><g fill="#18c657" font-family="monospace" text-anchor="middle" opacity=".6">${rain(random)}</g></g>` +
    `<path class="wa" d="${wave(surface + 5, 10, 220)}" fill="${color}" fill-opacity=".06"/>` +
    `<g class="wb"><path d="${wave(surface, 7, 160)}" fill="url(#deep)" stroke="${color}" stroke-opacity=".16" stroke-width="7"/><path d="${wave(surface, 7, 160)}" fill="none" stroke="${color}" stroke-opacity=".9" stroke-width="1.4"/></g>` +
    `<g clip-path="url(#below)"><g fill="${color}" font-family="monospace" font-size="18" letter-spacing="11">${rows}</g></g>` +
    `<g fill="none" stroke="${color}" stroke-width="1.2">${ripples}</g>` +
    `<g fill="${color}" fill-opacity=".8" font-family="monospace" font-size="13" letter-spacing="2.5">${labels}</g>` +
    `</svg>`
  )
}

function short(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`
  }

  return tokens >= 1000 ? `${Math.round(tokens / 1000)}k` : String(tokens)
}

/** `five_hour` reads 5 STD or 5 H, `seven_day` WOCHE or WEEK, any other window its own name. */
export function limitLabel(kind: string): string {
  if (kind === 'five_hour') {
    return WORDS.fiveHours
  }

  if (kind === 'seven_day') {
    return WORDS.week
  }
  const rest = kind.startsWith('seven_day_') ? `${WORDS.week} · ${kind.slice(10)}` : kind

  return rest.replaceAll('_', ' ').toUpperCase()
}

// The reset as a clock time, never a countdown: the strip redraws only when a figure moves.
function reset(limit: Limit): string {
  const at = limit.resetsAt === null ? Number.NaN : Date.parse(limit.resetsAt)

  if (Number.isNaN(at)) {
    return ''
  }
  const date = new Date(at)
  // The system's own clock format and weekday names.
  const time = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

  return limit.kind === 'five_hour'
    ? `Reset ${time}`
    : `Reset ${date.toLocaleDateString(undefined, { weekday: 'short' })} ${time}`
}

// `value` stands in for the bar where a figure has no ceiling to fill.
type Gauge = { label: string; percent: number | null; note: string; value?: string }

function gauges(usage: Usage): Gauge[] {
  const context: Gauge = {
    label: WORDS.context,
    percent: usage.percent,
    note: usage.tokens !== null && usage.window !== null ? `${short(usage.tokens)} / ${short(usage.window)}` : '',
  }

  return [
    context,
    // The two windows every plan reports; the limits arrive with these first.
    ...usage.limits.slice(0, 2).map(limit => ({ label: limitLabel(limit.kind), percent: limit.percent, note: reset(limit) })),
    ...(usage.usd === null
      ? []
      : [{ label: WORDS.cost, percent: null, note: WORDS.estimate, value: `≈ $${usage.usd.toFixed(2)}` }]),
  ]
}

/** One line of words for the same figures: the strip's alt text. */
export function describe(usage: Usage): string {
  return gauges(usage)
    .map(one => `${one.label} ${one.value ?? (one.percent === null ? '–' : `${Math.round(one.percent)}%`)}`)
    .join(' · ')
}

const WIDTH = 168
const GAP = 22

/** The strip above the prompt: one slim bar per figure, a sheen passing along each. */
export function stripScene(usage: Usage): { source: string; width: number; height: number } {
  const all = gauges(usage)
  const width = all.length * WIDTH + (all.length - 1) * GAP
  let body = ''

  all.forEach((one, i) => {
    const x = i * (WIDTH + GAP)
    const percent = one.percent ?? 0
    const filled = Math.max(0, Math.min(WIDTH, (percent / 100) * WIDTH)).toFixed(1)
    const color = tone(percent)

    if (one.value !== undefined) {
      body +=
        `<text x="${x}" y="11" class="l">${one.label}</text>` +
        `<text x="${x}" y="25" class="c">${one.value}</text>` +
        `<text x="${x}" y="34" class="n">${one.note}</text>`

      return
    }

    body +=
      `<text x="${x}" y="11" class="l">${one.label}</text>` +
      `<text x="${x + WIDTH}" y="11" text-anchor="end" class="v" fill="${percent >= 70 ? color : '#f4f7f5'}">${one.percent === null ? '–' : `${Math.round(percent)}%`}</text>` +
      `<rect x="${x}" y="17" width="${WIDTH}" height="5" rx="2.5" fill="#1b2c21"/>` +
      `<clipPath id="g${i}"><rect x="${x}" y="17" width="${filled}" height="5" rx="2.5"/></clipPath>` +
      `<g clip-path="url(#g${i})"><rect x="${x}" y="17" width="${WIDTH}" height="5" fill="${color}"/><rect class="s" x="${x}" y="17" width="34" height="5" fill="#ffffff" opacity="0" style="animation-delay:${(i * 0.5).toFixed(1)}s"/></g>` +
      `<text x="${x}" y="34" class="n">${one.note}</text>`
  })

  const source =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="38" viewBox="0 0 ${width} 38">` +
    `<style>` +
    `.l{font-size:10px;letter-spacing:1.4px;fill:#a3aea7}.v{font-size:12px;font-weight:700}.c{font-size:12px;font-weight:700;fill:#f4f7f5}.n{font-size:9.5px;fill:#7f8b84}` +
    `.s{animation:sheen 4s ease-in-out infinite}@keyframes sheen{0%{transform:translateX(-34px);opacity:.55}55%,100%{transform:translateX(${WIDTH}px);opacity:.55}}` +
    `</style>` +
    `<g font-family="monospace">${body}</g></svg>`

  return { source, width, height: 38 }
}
