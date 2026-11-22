import { atom, read, update } from 'claude-code'
import type {
  EngineInterface,
  Register,
  SessionContextUsage,
  SessionCost,
  SessionRateLimit,
  ThemeSetArgs,
} from 'claude-code'

import type { Usage } from '../types'
import { makeColors } from './make-colors.js'
import { backdropScene, describe, stripScene } from './scene'

const EMPTY: Usage = { percent: null, tokens: null, window: null, limits: [], usd: null }
const usage = atom({ plugin: 'digital-rain', key: 'usage' } as const, EMPTY, { shape: 'usage-4' })
// Its own value, so the backdrop redraws when the fill moves a whole point and not on every limit reading.
const level = atom({ plugin: 'digital-rain', key: 'level' } as const, -1, { shape: 'level-1' })

// Made for the dark: black-green surfaces, white words, green for what acts.
const { theme, problems } = makeColors({
  label: 'Digital rain',
  only: 'dark',
  roles: { accent: '#00d65a', danger: '#e5484d', success: '#3ecf6e', warning: '#e0a81c', pro: '#35c9b0' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#030a06',
        'surface-1': '#07140c',
        'surface-2': '#0b1c11',
        'surface-3': '#0f2416',
        'text-primary': '#f4f7f5',
        'text-secondary': '#cdd5d0',
        'text-muted': '#9aa6a0',
      },
    },
  },
})

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: 'rain', glass: { blur: 4, tint: '#030a06', opacity: 0.66 } },
}

// The windows in a steady order: five hours, the week, then any other the account reports.
function order(kind: string): string {
  return kind === 'five_hour' ? '0' : kind === 'seven_day' ? '1' : `2${kind}`
}

async function publish(
  $: EngineInterface,
  context: SessionContextUsage,
  rateLimits: readonly SessionRateLimit[],
  cost: SessionCost | undefined,
): Promise<void> {
  const next: Usage = {
    percent: context.percent ?? null,
    tokens: context.tokens ?? null,
    window: context.window,
    limits: rateLimits
      .map(one => ({ kind: one.kind, percent: one.percentUsed, resetsAt: one.resetsAt ?? null }))
      .sort((a, b) => order(a.kind).localeCompare(order(b.kind))),
    usd: cost?.usd ?? null,
  }
  const fill = next.percent === null ? -1 : Math.round(next.percent)

  await update($, usage, () => next)

  if ((await read($, level)) !== fill) {
    await update($, level, () => fill)
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    await $.theme.set(LOOK)
    // Clears the status line an earlier version of this mod wrote.
    $.ui.status(undefined)

    const now = await $.session.usage()
    await publish($, now.context, now.rateLimits, now.cost)

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    await publish($, e.context, e.rateLimits, e.cost)

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if (e.props.plugin !== 'digital-rain' || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    const fill = await read($, level)

    return (
      <Svg
        source={backdropScene(fill)}
        alt={
          fill < 0
            ? 'Green code rain falling into a shallow pool of code'
            : `Green code rain falling into a pool of code that stands at ${fill} percent, the context window's fill`
        }
        isInteractive
      />
    )
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    const now = await read($, usage)
    const strip = stripScene(now)

    // An image at its own size: a frame would take the band's whole height.
    return <Svg source={strip.source} alt={describe(now)} width={strip.width} height={strip.height} />
  })
}
