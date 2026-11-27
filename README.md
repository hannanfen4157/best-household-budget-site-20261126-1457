# Homefront — Household Budget

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/hannanfen4157/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/hannanfen4157/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

A working household budget site that runs entirely from its own files — no build step, no network requests, desktop and phone. It follows one invented demo household, the Alvarez family of Columbus, Ohio, through November 2026: take-home pay $6,400 a month, $4,845 spent, $1,100 saved, $455 still ready to assign.

## What it does

- **Dashboard** (`#/`) — November at a glance: income, spending, saving and the savings rate (24.3%), a donut chart of spending by category, budget-vs-actual bars, a six-month income-vs-spending chart (select any bar to inspect that month), the latest expenses and the savings goals.
- **Budget Planner** (`#/planner`) — the November plan across 10 categories. Edit any planned amount inline, add a category, or delete one (two-step confirm); every total updates at once. A 50/30/20 check measures the month against the guideline.
- **Expense Tracker** (`#/expenses`) — all 37 November expenses. Search descriptions, filter by category, sort by date or amount, delete an entry, or add the expense you just made — the dashboard, planner and savings rate all move with it.
- **Savings Goals** (`#/goals`) — four goals ($16,070 saved toward $23,600): emergency fund, summer vacation, next car, holiday gifts. Add $50 or $100 to any goal, or start a new one.
- **Learn** (`#/learn`) — the 50/30/20 split with the household's real numbers, five habits that keep a budget working, U.S. benchmarks (Census median income $83,730 in 2024; BLS average spending $78,535 a year), and a five-step start.

## The figures

Every figure is invented sample data for the demo household, sized to public U.S. benchmarks cited on the Learn page. Each category's "spent" total is the exact sum of its transactions in `app/data.js`, so the planner, tracker and dashboard can never disagree. Your changes live only in the browser tab and reset on reload — nothing is uploaded anywhere.

## Run it

Serve `app/` with any static server and open `index.html`:

```sh
python3 -m http.server --directory app 8123
```

or, from this repository root:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`.

## Layout

| File | Job |
| --- | --- |
| `app/index.html` | Page shell: header, navigation, footer |
| `app/style.css` | The whole look: warm paper, deep green, one amber accent |
| `app/data.js` | The sample household: income, categories, 37 transactions, six-month trend, goals |
| `app/charts.js` | SVG chart builders (donut, trend bars, budget meters) and money formatting |
| `app/main.js` | Routing, rendering and every control: edit, add, delete, filter, sort |
| `main.ts` | The hand-in program |
| `vendor/makefun-frontend.ts` | The kit's dossier library, unchanged |
| `screenshots/` | Four real renders of the site (see `shots.json`) |

## License

MIT — see [LICENSE](LICENSE).
