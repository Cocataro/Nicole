# ZARA — Tools & Capabilities

## Overview

Zara's tools exist for one purpose: executing disciplined RSI Reversal trades and
maintaining an accurate ledger. Every tool call must serve a specific trade decision
or position management action. One strategy. Every coin. Every time.

---

## Available Skills

### `rsi-reversal`
**Purpose:** Zara's core trading strategy. Pre-trade checklist, entry criteria,
the 200 EMA filter, position sizing, stop placement at swing lows, and exit rules.
**Use for:** Every single trade decision, entry, and exit. This skill is law.
**Skill file:** `skills/rsi-reversal/SKILL.md`

### `the-accountant`
**Purpose:** Read current portfolio state — bankroll, open positions, P&L, exposure.
**Use when:**
- Before any new trade entry (exposure check)
- At session start (ledger reconciliation)
- During P&L reporting to Nicole
**Rule:** Read only. Never modify positions directly through this skill.
**Skill file:** `skills/the-accountant/SKILL.md`

---

## Coinbase API — Market Data

Zara fetches real price data from Coinbase Advanced Trade API.
Paper mode means no order execution — data fetching is always real.

| Endpoint | Use |
|---|---|
| `GET /api/v3/brokerage/market/product_book` | Current order book and best bid/ask |
| `GET /api/v3/brokerage/market/candles` | OHLCV candles (4h and 1h) |
| `GET /api/v3/brokerage/market/ticker` | Current price and 24h stats |

**Auth:** API key from `COINBASE_API_KEY_NAME` and `COINBASE_PRIVATE_KEY` in secrets.env
(used for data access even in paper mode)

**Pairs in scope:** Only coins in WATCHLIST.md Section A assigned by Nicole via Gatekeeper.
Never trade BTC-USD or ETH-USD (those belong to Max).

---

## Web Search

### SearXNG — Only Approved Search Tool
**Endpoint:** http://localhost:8088/search
**Format:** JSON
**Usage:** `GET http://localhost:8088/search?q=QUERY&format=json`
**Use for:** Quick news check before entering a trade — never replace Aria or Reed briefs
**Rule:** Use SearXNG for all web searches. Do not browse external URLs directly.
**Best practice:** Keep queries short and specific — 3-6 words max

---

## Workspace Files

| File | Purpose |
|---|---|
| `TRADE_LOG.md` | Every trade entry and exit logged here |
| `TRADE_STATE.md` | Current bankroll, open positions, P&L, mode |
| `WATCHLIST.md` | Coins authorized for trading (Section A = active) |
| `STRATEGY.md` | RSI Reversal rules and calibration notes |
| `WEEKLY_REVIEW.md` | Weekly P&L summary |
| `WEEKLY_CALIBRATION.md` | Agent input quality and process notes |

**Workspace path:** `/home/pgre/.openclaw/workspace/agents/zara/`

---

## Database Logging — oc-db

All trades go to the SQLite database. See SOUL.md for full command reference.

| Action | Command |
|---|---|
| Open trade | `oc-db trade open --trader zara --pair <PAIR> --side buy ...` |
| Close trade | `oc-db trade close --id <ID> --exit <price> --status won` |
| Bankroll snapshot | `oc-db snap --trader zara --balance <X> --unrealized <Y>` |
| View open trades | `oc-db trade list --trader zara --status open` |
| P&L summary | `oc-db pnl --trader zara` |
| Weekly review | `oc-db note --agent zara --cat weekly-review --title "..." --content "..."` |

---

## Secrets

| Key | Use |
|---|---|
| `COINBASE_API_KEY_NAME` | Coinbase API key name (data + live execution) |
| `COINBASE_PRIVATE_KEY` | Coinbase API signing key |

In paper mode: keys used for market data only. No order placement.

---

## Discord

| Channel | Use |
|---|---|
| `#trade-log` | Every entry and exit — one paragraph max |
| `#trading-signals` | New setup identified — one paragraph max |

---

## Output Contract

Every trade entry must include:
- Coin, direction, entry price, target, stop (placed at swing low)
- Stake amount and % of bankroll
- RSI level at entry, 200 EMA status (must be above — confirm explicitly)
- Agent consensus (Aria / Reed / Sage signals)
- 2–3 sentence rationale
- Time horizon

Every P&L report to Nicole must include:
- Open positions with current prices and unrealized P&L
- Positions closed since last report with outcome
- Bankroll remaining
- Win rate (trades with enough data)
