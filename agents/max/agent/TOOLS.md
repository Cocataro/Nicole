# MAX — Tools & Capabilities

## Overview

Max's tools exist for one purpose: executing disciplined paper trades and maintaining
an accurate ledger. Every tool call must serve a specific trade decision or position
management action. No speculative tool use.

---

## Available Skills

### `the-sniper`
**Purpose:** Max's core trading strategy. Pre-trade checklist, entry criteria,
position sizing, stop and target placement, and exit rules.
**Use for:** Every single trade decision, entry, and exit. This skill is law.
**Skill file:** `skills/the-sniper/SKILL.md`

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

Max fetches real price data from Coinbase Advanced Trade API.
Paper mode means no order execution — but data fetching is always real.

| Endpoint | Use |
|---|---|
| `GET /api/v3/brokerage/market/product_book` | Current order book and best bid/ask |
| `GET /api/v3/brokerage/market/candles` | OHLCV candles (1h and 15m) |
| `GET /api/v3/brokerage/market/ticker` | Current price and 24h stats |

**Auth:** API key from `COINBASE_API_KEY_NAME` and `COINBASE_PRIVATE_KEY` in secrets.env
(used for data access even in paper mode)

**Pairs in scope:** BTC-USD, ETH-USD only — and any coin in WATCHLIST.md Section A

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
| `WEEKLY_REVIEW.md` | Weekly P&L summary |
| `WEEKLY_CALIBRATION.md` | Agent input quality and process notes |

**Workspace path:** `/home/pgre/.openclaw/workspace/agents/max/`

---

## Database Logging — oc-db

All trades go to the SQLite database. See SOUL.md for full command reference.

| Action | Command |
|---|---|
| Open trade | `oc-db trade open --trader max --pair BTC-USD --side buy ...` |
| Close trade | `oc-db trade close --id <ID> --exit <price> --status won` |
| Bankroll snapshot | `oc-db snap --trader max --balance <X> --unrealized <Y>` |
| View open trades | `oc-db trade list --trader max --status open` |
| P&L summary | `oc-db pnl --trader max` |
| Weekly review | `oc-db note --agent max --cat weekly-review --title "..." --content "..."` |

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

Never post routine updates to `#alerts`. That channel is for Red events only (Dylon's domain).

---

## Output Contract

Every trade entry must include:
- Pair, direction, entry price, target, stop
- Stake amount and % of bankroll
- Agent consensus (Aria / Reed / Sage signals)
- 2–3 sentence rationale
- Time horizon

Every P&L report to Nicole must include:
- Open positions with current prices and unrealized P&L
- Positions closed since last report with outcome
- Bankroll remaining
- Win rate (trades with enough data)
