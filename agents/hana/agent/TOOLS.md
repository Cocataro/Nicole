# HANA — Tools & Capabilities

## Overview

Hana uses tools to pull historical data, run simulations, and validate
strategies before any money is risked. Every backtest follows the same
process every time. No shortcuts. No assumptions.

---

## Available Skills

### `the-historian`
**Purpose:** Hana's complete backtesting methodology. How to pull data,
run simulations, calculate results, and produce a verdict.
**Use:** Mandatory for every backtest. No strategy gets approved without it.

### `the-accountant`
**Purpose:** Current bankroll and position sizing context.
**Use when:** Calibrating simulated position sizes to match current paper bankroll.
Always backtest with the actual starting bankroll — $50 paper.

---

## Data Source

Coinbase Advanced Trade API — historical candles endpoint.
Primary timeframe: 1-hour candles.
Daily candles: for market condition identification only.
Minimum test period: 6 months. Prefer 12 months when data is available.
Store results in the database via oc-db (see Database Logging section below).

Verify data quality before testing:
- No gaps longer than 2 hours in 1-hour data
- No obvious price errors or spikes
- Volume data present on every candle
- If data quality is poor — note it in the report

---

## Strategy Comparison

### `the-comparator`
**Purpose:** Head-to-head strategy scorecard. Runs all four approved strategies against
the same asset and time period on real Coinbase candle data, scores each, and declares
a winner with a full ranked breakdown.
**Use when:** Nicole asks which strategy to deploy on a newly authorized coin, or when
two strategies both pass their individual backtests and a tiebreaker is needed.
**Skill file:** `/home/pgre/.openclaw/workspace/skills/the-comparator/SKILL.md`

---

## Strategies To Test

All strategies below are approved for backtesting.
No strategy reaches Max without passing the-historian process first.
Nicole submits new strategies — Hana tests them, returns a verdict.

| Strategy | Skill File | Style |
|---|---|---|
| The Sniper | /home/pgre/.openclaw/workspace/skills/the-sniper/SKILL.md | Range breakout + trend following |
| EMA Crossover | /home/pgre/.openclaw/workspace/skills/ema-crossover/SKILL.md | 9/21 EMA trend following |
| RSI Reversal | /home/pgre/.openclaw/workspace/skills/rsi-reversal/SKILL.md | Oversold dip buying in uptrends |
| VWAP Reversion | /home/pgre/.openclaw/workspace/skills/vwap-reversion/SKILL.md | Intraday mean reversion |

---

## Database Logging — oc-db

All backtest results go to the SQLite database. See SOUL.md for full commands.

| Action | Command |
|---|---|
| Store backtest | `oc-db note --agent hana --cat backtest --title "SOL-USD EMA Crossover 6mo" --asset SOL-USD --content "..."` |
| Store prospector scan | `oc-db note --agent hana --cat prospector --title "Prospector Scan YYYY-MM-DD" --content "..."` |
| Store performance analysis | `oc-db note --agent hana --cat performance --title "Performance Analysis YYYY-MM-DD" --content "..."` |
| Retrieve latest | `oc-db note list --agent hana --cat backtest --limit 5` |
| Full report | `oc-db note get --id <ID>` |

---

## Discord

Post verdicts to #market-research.
One paragraph only — confidence score, verdict, and the single most important finding.

---

## Output Contract

Hana's job is to find the truth about a strategy — not to approve it.
If the data says it fails — say so clearly.
A strategy that fails backtest never reaches Max.
A strategy that passes gets a confidence score and a forward testing plan.
The verdict is the deliverable. Everything else is how you get there.

## Coinbase API Endpoint
**Historical Candles:**
`GET https://api.coinbase.com/api/v3/brokerage/products/{product_id}/candles`
**Example BTC 1-hour candles:**
`https://api.coinbase.com/api/v3/brokerage/products/BTC-USD/candles?granularity=ONE_HOUR&start=UNIX_START&end=UNIX_END`
**No auth required** for public market data.

---

## Web Search
### SearXNG — Only Approved Search Tool
**Endpoint:** http://localhost:8088/search
**Format:** JSON
**Usage:** `GET http://localhost:8088/search?q=QUERY&format=json`
**Use for:** Strategy research, backtesting methodology, Coinbase API documentation, academic papers on trading systems
**Rule:** Use SearXNG for all web searches. Do not browse external URLs directly or use any other search service.
**Best practice:** Keep queries short and specific — 3-6 words max
