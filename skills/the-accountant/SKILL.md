# THE ACCOUNTANT — Portfolio State Reader

## Purpose

The Accountant is a read-only tool for pulling current portfolio state from all
active traders. It aggregates bankroll, open positions, exposure, and P&L across
all four traders. No writing. No modifying. Look and report.

Any agent with access to this skill can use it.

---

## Data Sources — Priority Order

**Primary: SQLite database via oc-db** (authoritative, persistent)
**Fallback: TRADE_STATE.md files** (real-time scratchpad — use if DB rows are stale)

Use both. When they conflict, trust the DB for closed trade P&L and trust
TRADE_STATE.md for open positions that may not yet be written to the DB.

---

## Step 1 — Query the Database

Run these commands:

```
# Overall P&L per trader
oc-db pnl

# All currently open positions
oc-db trade list --status open

# Latest bankroll snapshot per trader
oc-db query "SELECT trader, balance, unrealized_pnl, recorded_at FROM bankroll_snapshots WHERE id IN (SELECT MAX(id) FROM bankroll_snapshots GROUP BY trader)"
```

---

## Step 2 — Read TRADE_STATE.md Files (Reconciliation Check)

Cross-check against each trader's TRADE_STATE.md for positions opened since the
last DB snapshot:

| Trader | File Path |
|---|---|
| Max | `/home/pgre/.openclaw/workspace/agents/max/TRADE_STATE.md` |
| Leo | `/home/pgre/.openclaw/workspace/agents/leo/TRADE_STATE.md` |
| Zara | `/home/pgre/.openclaw/workspace/agents/zara/TRADE_STATE.md` |
| Kai | `/home/pgre/.openclaw/workspace/agents/kai/TRADE_STATE.md` |

If a TRADE_STATE.md file does not exist: report that trader as "No data" for the
live scratchpad — use DB data only.

**TRADE_STATE.md Format:**

```
Mode: paper
Platform: Coinbase
Bankroll: $50.00
Unrealized P&L: $0.00
Realized P&L: $0.00
Win Rate: —
Last Updated: YYYY-MM-DD HH:MM UTC
Paused: false
CloseAll: false

Open Positions:
- BTC-USD Long
  Entry: $XX,XXX
  Stake: $X
  Stop: $XX,XXX
  Target: $XX,XXX
  Opened: YYYY-MM-DD
```

Parse each field carefully. Never estimate a missing value — report it as missing.

---

## Output Format

When called, produce this summary:

```
PORTFOLIO STATE — [Timestamp UTC]
Source: SQLite DB + TRADE_STATE.md reconciliation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MAX (The Sniper)
  Bankroll:     $XX.XX   [from latest snapshot]
  Unrealized:   +$X.XX   [from TRADE_STATE.md]
  Realized:     +$X.XX   [from DB: oc-db pnl]
  Total P&L:    +$X.XX
  Exposure:     XX% (X open positions)
  DB Win Rate:  XX% (N trades)
  Mode:         Paper / Live
  Status:       Active / Paused

LEO (EMA Crossover)
  [same fields]

ZARA (RSI Reversal)
  [same fields]

KAI (VWAP Reversion)
  [same fields]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMBINED
  Total bankroll:     $XXX.XX
  Total unrealized:   +$X.XX
  Total realized:     +$X.XX
  Total P&L:          +$X.XX
  Combined exposure:  XX%
  Total DB trades:    X (X won, X lost, X% win rate)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DATA FRESHNESS
  DB last trade:      [timestamp or "none"]
  TRADE_STATE.md:     [Last Updated from each file]
  Reconciliation:     [Match / Discrepancy — describe if different]
```

---

## Exposure Calculation

Exposure = Sum of all open stakes / Bankroll × 100

Pull open stakes from `oc-db trade list --status open` (sum the `size` column per trader).
Cross-reference with TRADE_STATE.md open positions.

Flag any trader where exposure exceeds 30% — this is Dylon's Red threshold.

---

## Rules

1. Read only — never write to any file or database
2. Never estimate missing values — report gaps explicitly
3. DB is the source of truth for realized P&L and trade history
4. TRADE_STATE.md is the source of truth for real-time open position scratchpad
5. When both sources agree: report as normal
6. When they conflict: report both values and flag the discrepancy

---

## Common Use Cases

**Pre-trade check (traders):** Call before entering any position to verify exposure limits.
Use `oc-db trade list --status open` for current exposure.

**Dylon monitoring:** Call every hour during trading hours to check all traders.
Key query: `oc-db query "SELECT trader, SUM(size) as exposure FROM trades WHERE status='open' GROUP BY trader"`

**Nicole heartbeat:** Call to get current P&L for the heartbeat report.
Use `oc-db pnl` for the authoritative realized P&L numbers.

**Aria/Sage context:** Call to frame research in terms of current team exposure.
