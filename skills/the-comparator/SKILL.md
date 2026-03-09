# THE COMPARATOR — Head-to-Head Strategy Scorecard

## Purpose

The Comparator runs all four approved trading strategies against the same asset
on the same historical dataset and determines which strategy produces the best
risk-adjusted returns. Used by Hana to make coin-to-trader routing decisions
for the Gatekeeper protocol.

The winner is deployed. The losers are noted for reference.
Data decides. Nothing else.

---

## Strategies Tested

| Strategy | Owner | Style |
|---|---|---|
| The Sniper | Max | Range breakout + trend following using SMA crossovers |
| EMA Crossover | Leo | 9/21 EMA trend following |
| RSI Reversal | Zara | Oversold dip buying in bull markets (4h RSI + 200 EMA filter) |
| VWAP Reversion | Kai | Intraday mean reversion during 08:00–20:00 UTC |

All four run on the same Coinbase OHLCV dataset.
All four use the same starting bankroll: $50 paper.
All four apply realistic position sizing (10% max stake, 30% max exposure).

---

## Data Requirements

- Asset: one Coinbase USD spot market
- Minimum test period: 6 months of 1-hour candles
- Preferred: 12 months when available
- Source: Coinbase Advanced Trade API via the-historian
- Data quality check: complete before running any strategy

---

## Simulation Rules

**Applies to all four strategies:**
- Starting bankroll: $50
- Max single trade: 10% of bankroll
- Max total exposure: 30% of bankroll
- Minimum trade size: $2
- Commissions: 0.5% per trade (Coinbase Maker/Taker estimate)
- Slippage: 0.1% per trade (conservative estimate)
- No leverage
- Paper trades only

**Strategy-specific rules:**
- The Sniper: apply 1h SMA crossover + RSI 40–60 + volume filter as defined in SKILL.md
- EMA Crossover: apply 9/21 crossover + 50 EMA slope filter as defined in SKILL.md
- RSI Reversal: apply 4h RSI < 30 bounce + 200 EMA filter as defined in SKILL.md
- VWAP Reversion: apply deviation signals during 08:00–20:00 UTC only as defined in SKILL.md

---

## Scoring Metrics

Calculate these for each strategy:

| Metric | Description |
|---|---|
| **Net Return** | Total P&L as % of starting bankroll |
| **Win Rate** | % of trades that were profitable |
| **Sharpe Ratio** | (Return − Risk-Free Rate) / SD of returns. Use 0% risk-free. |
| **Max Drawdown** | Largest peak-to-trough decline during the test period |
| **Profit Factor** | Gross profit / Gross loss |
| **Number of Trades** | Total entries during the period |
| **Average Trade Duration** | Mean holding time per trade |
| **Average Win** | Average P&L on winning trades |
| **Average Loss** | Average P&L on losing trades |

---

## Scoring Formula

Each strategy receives a composite score:

```
Score = (Sharpe Ratio × 0.35)
      + (Win Rate × 0.25)
      + (Profit Factor × 0.20)
      + (-Max Drawdown × 0.20)
```

Weights: Sharpe is king. Win rate matters. Drawdown is a penalty.

---

## Output Format

```
COMPARATOR RESULTS
Asset:        [COIN-USD]
Period:       YYYY-MM-DD to YYYY-MM-DD
Candles:      XXXX (1-hour)
Starting bankroll: $50.00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STRATEGY RESULTS

THE SNIPER (Max)
  Net Return:     +X.X%
  Win Rate:       XX%
  Sharpe Ratio:   X.XX
  Max Drawdown:   X.X%
  Profit Factor:  X.XX
  Trades:         XX
  Avg Duration:   Xh
  Score:          X.XX

EMA CROSSOVER (Leo)
  [same fields]

RSI REVERSAL (Zara)
  [same fields]

VWAP REVERSION (Kai)
  [same fields]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RANKING
  1st: [Strategy] — Score X.XX
  2nd: [Strategy] — Score X.XX
  3rd: [Strategy] — Score X.XX
  4th: [Strategy] — Score X.XX

VERDICT
  Recommended trader: [TRADER NAME]
  Reasoning: [2–3 sentences — what made the winner stand out]

CONFIDENCE
  [High / Medium / Low]
  Basis: [Sample size and data quality assessment]

ROUTING RECOMMENDATION
  Tier 1 (auto-promote): Score ≥ 1.5 AND Sharpe ≥ 0.8 AND Win Rate ≥ 55%
  Tier 2 (conditional promote): Score ≥ 1.0 AND Sharpe ≥ 0.5
  Tier 3 (do not promote): Below Tier 2 thresholds
```

---

## Overfitting Flags

Flag these situations explicitly in the output:

- Fewer than 20 trades in the winning strategy: insufficient sample — reduce confidence
- Win rate > 80%: likely overfitted to this period — flag as suspicious
- Max drawdown < 2%: unrealistically low — check for data gaps or logic errors
- Profit factor > 5: check for lookahead bias in the strategy logic

If overfitting is suspected: lower the confidence rating and note it clearly.

---

## Rules

1. Real candle data only — never simulate on synthetic or estimated candles
2. Apply commissions and slippage to every simulated trade
3. No lookahead bias — each trade decision must use only data available at entry time
4. Run all four strategies on the same dataset with the same parameters
5. Never route a coin to a trader based on a preference — only score
6. Flag all overfitting concerns explicitly
