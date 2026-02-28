# KAI — Tools & Capabilities

## Overview

Kai's tools exist for one purpose: executing disciplined VWAP Reversion trades during
active hours and maintaining an accurate ledger. Every tool call must serve a specific
trade decision or position management action. One strategy. Active hours only. Every coin.

---

## Available Skills

### `vwap-reversion`
**Purpose:** Kai's core trading strategy. Pre-trade checklist, VWAP calculation,
entry criteria, time gate enforcement, position sizing, stop placement, and exit rules.
**Use for:** Every single trade decision, entry, and exit. This skill is law.
**Skill file:** `skills/vwap-reversion/SKILL.md`

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

Kai fetches real price data from Coinbase Advanced Trade API.
Paper mode means no order execution — data fetching is always real.

| Endpoint | Use |
|---|---|
| `GET /api/v3/brokerage/market/product_book` | Current order book and best bid/ask |
| `GET /api/v3/brokerage/market/candles` | OHLCV candles (1h and 15m) for VWAP calculation |
| `GET /api/v3/brokerage/market/ticker` | Current price and 24h stats |

**Auth:** API key from `COINBASE_API_KEY_NAME` and `COINBASE_PRIVATE_KEY` in secrets.env
(used for data access even in paper mode)

**Pairs in scope:** Only coins in WATCHLIST.md Section A assigned by Nicole via Gatekeeper.
Never trade BTC-USD or ETH-USD (those belong to Max).

**Active hours hard gate:** 08:00–20:00 UTC only.
Check UTC time before every cycle. If outside window — exit immediately, no action.

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
| `STRATEGY.md` | VWAP Reversion rules and calibration notes |
| `WEEKLY_REVIEW.md` | Weekly P&L summary |
| `WEEKLY_CALIBRATION.md` | Agent input quality, time gate discipline notes |

**Workspace path:** `/home/pgre/.openclaw/workspace/agents/kai/`

---

## Obsidian Logging Paths

| Log Type | Path |
|---|---|
| Trade entries | `/home/pgre/obsidian/vault/trading/trade-log/kai/` |
| Open positions | `/home/pgre/obsidian/vault/trading/positions/kai/` |
| Weekly reviews | `/home/pgre/obsidian/vault/trading/weekly-reviews/kai/` |

Filename format: `YYYY-MM-DD-description.md`

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
- Coin, direction, entry price, VWAP at entry, target, stop
- Stake amount and % of bankroll
- Entry time (UTC) — confirm it falls within 08:00–20:00 window
- Agent consensus (Aria / Reed / Sage signals)
- 2–3 sentence rationale
- Explicit note: positions expire at 20:00 UTC if not closed

Every P&L report to Nicole must include:
- Open positions with current prices and unrealized P&L
- Positions closed since last report with outcome
- Bankroll remaining
- Win rate (trades with enough data)
- Time gate compliance rate (how often the time gate was respected)
