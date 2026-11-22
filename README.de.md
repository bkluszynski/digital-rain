# digital-rain

[English](README.md) · **Deutsch**

Ein dunkles, grünes Code-Regen-Theme für Claude Code (Desktop- und Mobile-App), das den Verbrauch der Sitzung im Hintergrund und in einem schmalen Streifen über dem Prompt anzeigt.

## Was die Mod zeigt

- **Hintergrund:** Grüner Zeichenregen in drei Tiefenebenen fällt in einen „Datensee". Der Pegel des Sees entspricht dem Füllstand des Kontextfensters; ab 70 % wird er gelb, ab 90 % rot. Gepunktete Linien markieren 25, 50, 75 und 100 %.
- **Streifen über dem Prompt:** je ein schmaler Balken für
  - **KONTEXT** – Prozent und Tokens,
  - **5 STD** – das 5-Stunden-Limit mit Reset-Uhrzeit,
  - **WOCHE** – das Wochenlimit mit Reset-Zeitpunkt,
  - **KOSTEN** – die geschätzten Kosten der Sitzung.
- **Farben:** schwarz-grüne Flächen, weißer Text, Grün für Akzente. Das Theme ist nur für den Dark-Mode gemacht.

Die Beschriftungen folgen der Systemsprache: Deutsch auf einem deutschen System, sonst Englisch (CONTEXT, 5 H, WEEK, COST). Reset-Zeiten nutzen das Uhrzeitformat und die Wochentagsnamen des Systems.

Die Limit-Balken erscheinen nur mit einem Abo, das diese Fenster meldet. Die Kosten sind eine lokale Schätzung zum Listenpreis und keine Abrechnung; innerhalb eines Abos wird dieser Betrag nicht berechnet.

Terminal und Editor-Erweiterungen zeichnen keine Themes; dort zeigt die Mod nichts an.

## Installation

Am Prompt einer Terminal-Sitzung von Claude Code:

```
/plugin install digital-rain --marketplace bkluszynski/digital-rain
```

Danach mit `y` den Marketplace hinzufügen und einen Geltungsbereich wählen.

Aus einer Shell:

```
claude plugin install digital-rain --marketplace bkluszynski/digital-rain
```

In der Desktop-App, wo `/plugin` nicht läuft: auf **+** neben dem Eingabefeld klicken, dann **Plugins**, **Add marketplace** mit `bkluszynski/digital-rain`, dann **Add plugin**.

## Entwicklung

```
claude plugin validate .
claude plugin test .
```

`hooks/scene.ts` baut die beiden SVG-Szenen (Hintergrund und Streifen), `hooks/register.tsx` setzt das Theme und speist die Messwerte ein.

## Lizenz

[MIT](LICENSE). `hooks/make-colors.js` und `hooks/make-colors.d.ts` stammen unverändert aus dem Mod-Baukasten von Claude Code und fallen nicht unter diese Lizenz.
