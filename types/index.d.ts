/** One rate-limit window as the gauge draws it. */
export type Limit = {
  kind: string
  /** 0 to 100, past it on an exceeded limit. */
  percent: number
  /** ISO 8601, null where the engine names no reset. */
  resetsAt: string | null
}

/** The figures the strip above the prompt draws; null until the engine has one. */
export type Usage = {
  /** Context window fill, 0 to 100. */
  percent: number | null
  tokens: number | null
  window: number | null
  limits: Limit[]
  /** Session cost in US dollars, an estimate; null where the host keeps no ledger. */
  usd: number | null
}

declare module 'claude-code' {
  interface PluginState {
    'digital-rain': {
      usage: Shaped<Usage>
      /** The context fill the backdrop last drew, a whole percentage; -1 before a reading. */
      level: Shaped<number>
    }
  }
}
