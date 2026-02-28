# THE ACCOUNTANT — Portfolio State Reader

## Purpose

The Accountant is a read-only tool for pulling current portfolio state from all
active trader workspaces. It aggregates bankroll, open positions, exposure,
and P&L across all four traders. No writing. No modifying. Look and report.

Any agent with access to this skill can use it.
Results are as current as the trader's last TRADE_STATE.md update.

---

## Data Sources

The Accountant reads from TRADE_STATE.md files in each trader's workspace:

| Trader | File Path |
|---|---|
| Max | `/home/pgre/.openclaw/workspace/agents/max/TRADE_STATE.md` |
| Leo | `/home/pgre/.openclaw/workspace/agents/leo/TRADE_STATE.md` |
| Zara | `/home/pgre/.openclaw/workspace/agents/zara/TRADE_STATE.md` |
| Kai | `/home/pgre/.openclaw/workspace/agents/kai/TRADE_STATE.md` |

If a file does not exist: report that trader as "No data" — do not invent values.

---

## TRADE_STATE.md Format

Each trader maintains their TRADE_STATE.md in this format:

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
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MAX (The Sniper)
  Bankroll:     $XX.XX
  Unrealized:   +$X.XX
  Realized:     +$X.XX
  Total P&L:    +$X.XX
  Exposure:     XX% (X open positions)
  Mode:         Paper / Live
  Status:       Active / Paused

LEO (EMA Crossover)
  Bankroll:     $XX.XX
  [same fields]

ZARA (RSI Reversal)
  Bankroll:     $XX.XX
  [same fields]

KAI (VWAP Reversion)
  Bankroll:     $XX.XX
  [same fields]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMBINED
  Total bankroll:     $XXX.XX
  Total unrealized:   +$X.XX
  Total realized:     +$X.XX
  Total P&L:          +$X.XX
  Combined exposure:  XX%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Exposure Calculation

Exposure = Sum of all open stakes / Bankroll × 100

Calculate per trader and combined.
Flag any trader where exposure exceeds 30% — this is Dylon's Red threshold.

---

## Rules

1. Read only — never write to any TRADE_STATE.md file
2. Never estimate missing values — report gaps explicitly
3. Never combine data from different timestamps as if it's simultaneous
4. Note the "Last Updated" timestamp for each trader in your output
5. If a trader's file is missing: report "No data available" for that trader

---

## Common Use Cases

**Pre-trade check (traders):** Call before entering any position to verify exposure limits.

**Dylon monitoring:** Call every hour during trading hours to check light status across all traders.

**Nicole heartbeat:** Call to get current P&L for the heartbeat report.

**Aria/Sage context:** Call to frame research in terms of current team exposure.
