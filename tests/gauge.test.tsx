import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'digital-rain',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 4,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 4 },
    view: {},
  },
} as const

const SCENE = {
  plugin: 'digital-rain',
  component: 'Backdrop',
  props: { scene: 'rain', plugin: 'digital-rain', glass: false },
} as const

test('the strip shows the context and every limit window, in a steady order', async ($, on) => {
  on('session.measure', (_, e) => ({ changed: e.changed }))

  await $.session.measure({
    context: { tokens: 84_000, window: 200_000, percent: 42 },
    rateLimits: [
      { kind: 'seven_day_fable', percentUsed: 12 },
      { kind: 'seven_day', percentUsed: 30.5, resetsAt: '2026-11-26T08:00:00Z' },
      { kind: 'five_hour', percentUsed: 73, resetsAt: '2026-11-22T15:30:00Z' },
    ],
    cost: { usd: 6.857 },
    changed: ['context', 'rateLimits', 'cost'],
  })

  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  const svg = await ui.find({ type: 'Svg' })

  expect(svg?.props.alt).toBe('KONTEXT 42% · 5 STD 73% · WOCHE 31% · KOSTEN ≈ $6.86')
  expect(svg?.props.source).toContain('84k / 200k')
  expect(svg?.props.source).toContain('Reset Do ')
  expect(svg?.props.height).toBe(38)
  expect(svg?.props.isInteractive).toBeUndefined()
  await ui.unmount()

  const scene = await $.ui.mount({ ...SCENE, surface: 'desktop' })
  expect((await scene.find({ type: 'Svg' }))?.props.source).toContain('KONTEXT 42%')
  await scene.unmount()
})

test('before any measurement the strip rests at a dash', async $ => {
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })

  expect((await ui.find({ type: 'Svg' }))?.props.alt).toBe('KONTEXT –')
  await ui.unmount()
})

test('the session start sets the look and seeds the strip', async ($, on) => {
  let look: unknown
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('theme.set', (_, e) => {
    look = e

    return { value: { isDrawn: true, requestId: 'r1' } }
  })
  on('session.usage', () => ({
    value: {
      startedAt: 0,
      context: { tokens: 500_000, window: 1_000_000, percent: 50 },
      rateLimits: [{ kind: 'five_hour', percentUsed: 8 }],
    },
  }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  expect(look).toMatchObject({ backdrop: { scene: 'rain' } })
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect((await ui.find({ type: 'Svg' }))?.props.alt).toBe('KONTEXT 50% · 5 STD 8%')
  await ui.unmount()
})

test('the backdrop draws the rain and its pool on desktop and mobile', async $ => {
  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...SCENE, surface })
    const source = (await ui.find({ type: 'Svg' }))?.props.source

    expect(source).toContain('@keyframes fall')
    expect(source).toContain('KONTEXT –')
    await ui.unmount()
  }
})
