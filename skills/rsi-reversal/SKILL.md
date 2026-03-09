# RSI REVERSAL — Oversold Dip Buying in Bull Markets

## Purpose

RSI Reversal is Zara's core trading methodology. It identifies oversold conditions
in assets that are in established uptrends and enters after the flush is complete.
The 200 EMA filter is the most important rule in this strategy. Without it, oversold
becomes more oversold and the position bleeds out.

Bull market dip buying only. Bear market rallies will kill this strategy.

---

## Pre-Trade Checklist

Complete every item before entering any position. A single fail means no trade.

**1. The 200 EMA Filter — MOST IMPORTANT RULE (4-hour chart)**
- [ ] Price is ABOVE the 200 EMA on the 4-hour chart
- [ ] 200 EMA is sloping upward (or at worst flat — never downward)
- [ ] If price is below the 200 EMA on 4-hour: DO NOT TRADE. Full stop.
- [ ] This is the single most important rule. No exceptions. Ever.

**2. RSI Oversold Signal (4-hour chart)**
- [ ] RSI has dropped below 30 (oversold territory)
- [ ] RSI is now bouncing back above 30 (recovery signal, not still falling)
- [ ] Prefer RSI that reached 25 or below — deeper flush = stronger bounce candidate
- [ ] RSI between 30–35 with no clear bounce: wait, do not enter early

**3. Swing Low Structure**
- [ ] Identify the swing low that was formed during the RSI dip
- [ ] The swing low will serve as the stop loss anchor
- [ ] If no clear swing low is visible: no trade (stop cannot be placed properly)

**4. Volume Profile**
- [ ] Volume was elevated during the selloff (healthy flush, not low-volume drift)
- [ ] Volume is decreasing as price stabilizes (selling pressure is exhausting)
- [ ] Volume spike on the recovery candle: high conviction signal

**5. Agent Consensus**
- [ ] At least 2 of 3 agents (Aria, Reed, Sage) confirm bullish or neutral bias
- [ ] All 3 agree bullish: high conviction — size at 10% of bankroll
- [ ] 2 of 3 agree bullish: medium conviction — size at 5–7% of bankroll
- [ ] Agents are bearish or mixed: abort — the thesis may be wrong

**6. Risk Gate**
- [ ] Single trade stake ≤ 10% of current bankroll
- [ ] Total open exposure after entry would remain ≤ 30% of bankroll
- [ ] Bankroll is above $25 floor
- [ ] No leverage or margin is used

---

## Entry Execution

After all checklist items pass:

1. Switch to 1-hour chart for entry timing
2. Wait for the 1-hour RSI to bounce above 35 (confirming the 4-hour RSI recovery)
3. Enter when a 1-hour candle closes with a bullish body and RSI above 35
4. Do not enter during a falling RSI — wait for the bounce confirmation

The entry is after the flush is over, not during it.
Never try to call the exact bottom. Enter on recovery, not prediction.

---

## Position Sizing

| Agent Consensus | Stake |
|---|---|
| 3 of 3 agree bullish | 10% of current bankroll |
| 2 of 3 agree bullish | 5–7% of current bankroll |
| Below threshold | No trade |

Minimum trade size: $2.
If 10% of bankroll is below $2: do not trade.

---

## Stop Loss Placement

- Stop goes just below the swing low identified during the checklist
- Add 0.5–1% buffer below the swing low to avoid noise stops
- If the swing low is more than 8% below entry: the setup is too wide — skip the trade
- Stop must be set immediately after entry. No exceptions.

---

## Target Placement

- Primary target: RSI reaching 60 on the 4-hour chart
- Price target: measure the depth of the dip (entry to swing low) and project 1.5x above entry
- Minimum risk/reward ratio: 1.5:1 based on swing low stop
- If the R:R doesn't work: skip the trade

---

## Exit Rules

**Take profit:**
- Exit when 4-hour RSI reaches 60+ (overbought is not the target — 60 is)
- Or exit when price hits the measured target level
- Never hold for more — RSI reversal trades are mean reversion, not trend trades

**Stop loss:**
- Exit immediately when stop is hit
- If price breaks below the swing low: the flush is not over, exit immediately

**Thesis invalidation:**
- If price drops below the 200 EMA on the 4-hour: close immediately — bull market context is broken
- If news event is clearly negative and bearish: close immediately, do not hold for a stop hit

**Time stop:**
- If trade has been open 72 hours and RSI hasn't moved above 45: reassess
- This strategy targets a fast recovery — if it isn't coming, exit

---

## Trade Log Entry Format

```
## Entry
- Timestamp (UTC): YYYY-MM-DD HH:MM
- Coin: [COIN-USD]
- Direction: Long
- Entry Price: $X
- Target Price: $X (RSI 60 target)
- Stop Loss: $X (below swing low at $X)
- Stake: $X (X% of bankroll)
- Timeframe: 4h signal / 1h entry
- 200 EMA (4h): $X — price ABOVE ✓
- 4h RSI at entry: XX (bouncing from low of XX)
- 1h RSI at entry: XX
- Swing Low: $X
- Volume profile: [Elevated selloff / Decreasing / Recovery candle noted]
- Aria Signal: [Bullish / Bearish / Neutral]
- Reed Signal: [Bullish / Bearish / Neutral]
- Sage Signal: [Bullish / Bearish / Neutral]
- Rationale: [2–3 sentences max]

## Exit
- Timestamp (UTC): YYYY-MM-DD HH:MM
- Exit Price: $X
- 4h RSI at exit: XX
- P&L: +$X / -$X (X%)
- Outcome: Won / Lost
- Exit Reason: RSI target hit / Stop hit / 200 EMA break / Time stop
- Notes: [Optional]
```

---

## What RSI Reversal Is

- A mean reversion strategy that enters after panic selling is exhausted
- A bull-market-only system (200 EMA filter is non-negotiable)
- Best in assets with high volatility and strong underlying trends

## What RSI Reversal Is Not

- A reversal strategy in bear markets — never use when price is below 200 EMA
- A "buy the dip" strategy without confirmation — wait for the RSI bounce
- An averaging-down tool — one entry, no adds

---

## Hard Rules

1. The 200 EMA filter is non-negotiable. No exceptions. Ever.
2. Never enter while RSI is still falling — wait for the bounce
3. Never average down
4. Close immediately if price breaks below the 200 EMA (4-hour)
5. Never trade a coin not in WATCHLIST.md Section A
6. Never trade coins assigned to Max, Leo, or Kai
