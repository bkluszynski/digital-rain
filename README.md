# digital-rain

**English** · [Deutsch](README.de.md)

A dark, green code-rain theme for Claude Code (desktop and mobile apps) that shows the session's usage in the backdrop and in a slim strip above the prompt.

## What it shows

- **Backdrop:** green glyph rain in three depth layers falls into a "data pool". The pool's level is the fill of the context window; it turns amber from 70 % and red from 90 %. Dotted lines mark 25, 50, 75 and 100 %.
- **Strip above the prompt:** one slim bar each for
  - **CONTEXT** – context window, percent and tokens,
  - **5 H** – the five-hour limit with its reset time,
  - **WEEK** – the weekly limit with its reset time,
  - **COST** – the session's estimated cost.
- **Colors:** black-green surfaces, white text, green for accents. The theme is made for dark mode only.

The labels follow the system language: German on a German system (KONTEXT, 5 STD, WOCHE, KOSTEN), English everywhere else (CONTEXT, 5 H, WEEK, COST). Reset times use the system's clock format and weekday names.

The limit bars appear only on a subscription that reports these windows. The cost is a local estimate at list price, not a bill; inside a subscription that amount is not charged.

Terminals and editor extensions draw no themes, so the mod shows nothing there.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install digital-rain --marketplace bkluszynski/digital-rain
```

Then answer `y` to add the marketplace and pick a scope.

From a shell:

```
claude plugin install digital-rain --marketplace bkluszynski/digital-rain
```

In the desktop app, where `/plugin` does not run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `bkluszynski/digital-rain`, then **Add plugin**.

## Development

```
claude plugin validate .
claude plugin test .
```

`hooks/scene.ts` builds the two SVG scenes (backdrop and strip); `hooks/register.tsx` sets the theme and feeds in the readings.

## License

[MIT](LICENSE). `hooks/make-colors.js` and `hooks/make-colors.d.ts` are copied unchanged from Claude Code's mod kit and are not covered by this license.
