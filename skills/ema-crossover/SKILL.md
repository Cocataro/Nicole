# EMA CROSSOVER — 9/21 EMA Trend Following Strategy

## Purpose

EMA Crossover is Leo's core trading methodology. It identifies trend initiation
using exponential moving average crossovers, confirmed by the 50 EMA slope and
volume. The goal is to enter early in a confirmed trend move and ride it.
Trending markets only. Choppy markets are the enemy of this strategy.

---

## Pre-Trade Checklist

Complete every item before entering any position. A single fail means no trade.

**1. Crossover Signal (1-hour chart)**
- [ ] 9 EMA has crossed above 21 EMA → bullish signal (long only)
- [ ] 9 EMA has crossed below 21 EMA → bearish signal (short only, with Paul authorization)
- [ ] Crossover happened within the last 3 candles — fresh signal only
- [ ] Crossover is clean (not a wick — candle body must be on the correct side)

**2. Trend Filter (50 EMA slope)**
- [ ] For longs: 50 EMA is sloping upward (rising, not flat)
- [ ] For shorts: 50 EMA is sloping downward
- [ ] 50 EMA is flat or unclear: skip — no trend to follow

**3. RSI Confirmation (1-hour chart)**
- [ ] For longs: RSI is between 45 and 70 at crossover (momentum but not extended)
- [ ] For shorts: RSI is between 30 and 55 at crossover
- [ ] RSI above 75 on a long signal: extended — skip, do not chase
- [ ] RSI below 25 on a short signal: oversold — skip

**4. Volume Confirmation**
- [ ] Volume on the crossover candle is above 20-period average
- [ ] Prefer crossovers with volume spike — higher conviction signal

**5. Agent Consensus**
- [ ] At least 2 of 3 agents (Aria, Reed, Sage) agree on directional bias
- [ ] All 3 agree: high conviction — size at 10% of bankroll
- [ ] 2 of 3 agree: medium conviction — size at 5–7% of bankroll
- [ ] Below 2 of 3: no trade

**6. Risk Gate**
- [ ] Single trade stake ≤ 10% of current bankroll
- [ ] Total open exposure after entry would remain ≤ 30% of bankroll
- [ ] Bankroll is above $25 floor
- [ ] No leverage or margin is used

---

## Entry Execution

After all checklist items pass:

1. Switch to 15-minute chart
2. Wait for a pullback candle after the crossover (do not enter on the crossover candle itself)
3. Enter when price bounces off the 9 EMA or 21 EMA on the 15-minute chart
4. This gives a lower-risk entry in the direction of the crossover

---

## Position Sizing

| Agent Consensus | Stake |
|---|---|
| 3 of 3 agree | 10% of current bankroll |
| 2 of 3 agree | 5–7% of current bankroll |
| Below threshold | No trade |

Minimum trade size: $2.
If 10% of bankroll is below $2: do not trade.

---

## Stop Loss Placement

- Place stop below the most recent swing low on the 15-minute chart (longs)
- Place stop above the most recent swing high (shorts)
- Alternatively: stop below the 21 EMA at entry time
- Stop must be set immediately after entry. No exceptions.
- Maximum stop distance: 4% from entry

---

## Target Placement

- Use measured move: height of the EMA setup (distance from 50 EMA to crossover point)
- Project that distance from entry
- Minimum risk/reward ratio: 1.5:1
- If the projection doesn't offer 1.5:1: skip the trade

---

## Exit Rules

**Take profit:**
- Exit at target or when the 9 EMA crosses back below the 21 EMA (trend reversal)
- Trail stop: once price is up 2R, move stop to breakeven
- Once price is up 3R, trail stop to 1R profit

**Stop loss:**
- Exit immediately when stop is hit — no averaging down

**Trend invalidation:**
- If the 9/21 EMA recrosses against your position: close immediately
- A failed crossover means the thesis is wrong — exit, don't hope

**Time stop:**
- If trade has been open 48 hours with no progress toward target: reassess
- If 50 EMA slope has flattened: the trend is stalling — reduce or close

---

## Trade Log Entry Format

```
## Entry
- Timestamp (UTC): YYYY-MM-DD HH:MM
- Coin: [COIN-USD]
- Direction: Long
- Entry Price: $X
- Target Price: $X
- Stop Loss: $X
- Stake: $X (X% of bankroll)
- Timeframe: 1h crossover / 15m entry
- 9 EMA: $X | 21 EMA: $X | 50 EMA slope: Rising | RSI: XX
- Aria Signal: [Bullish / Bearish / Neutral]
- Reed Signal: [Bullish / Bearish / Neutral]
- Sage Signal: [Bullish / Bearish / Neutral]
- Rationale: [2–3 sentences max]

## Exit
- Timestamp (UTC): YYYY-MM-DD HH:MM
- Exit Price: $X
- P&L: +$X / -$X (X%)
- Outcome: Won / Lost
- Exit Reason: Target hit / Stop hit / EMA recross / Time stop
- Notes: [Optional]
```

---

## What EMA Crossover Is

- A trend-following strategy that enters after momentum is confirmed
- A systematic approach with objective entry and exit signals
- Best in markets with clear directional momentum

## What EMA Crossover Is Not

- A range trading strategy — do not use in sideways markets
- A reversal system — never use to fade a trend
- A scalping tool — setups need time to develop

---

## Hard Rules

1. Never enter a crossover that is more than 3 candles old
2. Never enter if the 50 EMA is flat — there is no trend to follow
3. Never average down on a losing EMA Crossover position
4. Always exit when the 9/21 EMA recrosses against you
5. Never trade a coin not in WATCHLIST.md Section A
6. Never trade coins assigned to Max, Zara, or Kai
