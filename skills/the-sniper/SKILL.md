# THE SNIPER — Range Breakout & Trend Following Strategy

## Purpose

The Sniper is Max's core trading methodology. It identifies momentum setups using
SMA crossovers, RSI confirmation, and volume validation. The goal is to catch the
early stage of a confirmed trend move — not to predict reversals, not to catch bottoms.
Wait for confirmation. Size conservatively. Let the trade prove itself.

---

## Pre-Trade Checklist

Complete every item before entering any position. A single fail means no trade.

**1. Trend Filter (1-hour chart)**
- [ ] 20 SMA is above 50 SMA → bullish bias (look for longs only)
- [ ] 20 SMA is below 50 SMA → bearish bias (look for shorts only, with Paul authorization)
- [ ] SMAs are converging with no clear crossover → no trade

**2. RSI Filter (1-hour chart)**
- [ ] RSI is between 40 and 60 at entry
- [ ] RSI above 60: asset is extended — skip, do not chase
- [ ] RSI below 40: asset may be weakening — skip unless clear bounce setup
- [ ] RSI diverging from price: flag as medium conviction, reduce size

**3. Volume Confirmation (1-hour chart)**
- [ ] Current candle volume is above the 20-period average volume
- [ ] Volume spike > 2x average on the setup candle: high conviction, proceed
- [ ] Volume below average: low conviction — skip or reduce to minimum size

**4. Agent Consensus**
- [ ] At least 2 of 3 agents (Aria, Reed, Sage) agree on directional bias
- [ ] All 3 agree: high conviction — size at full 10% of bankroll
- [ ] 2 of 3 agree: medium conviction — size at 5–7% of bankroll
- [ ] 1 of 3 or 0 of 3 agree: no trade

**5. Risk Gate (check with Dylon)**
- [ ] Single trade stake ≤ 10% of current bankroll
- [ ] Total open exposure after entry would remain ≤ 30% of bankroll
- [ ] Bankroll is above $25 floor
- [ ] No leverage or margin is used

---

## Entry Execution

After all checklist items pass:

1. Switch to 15-minute chart
2. Wait for a clean confirmation candle in the direction of the trade:
   - Bullish: 15-min candle closes above recent resistance with body > 50% of range
   - Bearish: 15-min candle closes below recent support with body > 50% of range
3. Enter at close of confirmation candle (or limit order just inside the level)
4. Never enter on the first test of a level — wait for the bounce and re-test

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

- Place stop at the most recent swing low (long) or swing high (short) on the 1-hour chart
- Stop must be below/above a meaningful structural level — not arbitrary
- Minimum stop distance: 1.5% from entry (to avoid noise)
- Maximum stop distance: 5% from entry (wider stops require smaller size, not wider stops)
- If the right stop is > 5% away: skip the trade — the setup is too wide for the bankroll

After entry: set stop immediately. No exceptions.
Report stop level to Dylon via TRADE_STATE.md.

---

## Target Placement

- Primary target: next meaningful resistance level (long) or support level (short) on 1-hour
- Minimum risk/reward ratio: 1.5:1
- If the next level doesn't offer 1.5:1 R:R — skip the trade
- Secondary target: hold half position to next major level if primary is hit cleanly

---

## Exit Rules

**Take profit:**
- Exit at primary target or when price reaches resistance and shows reversal signals
- Never hold past a major resistance level hoping for more

**Stop loss:**
- Exit immediately when stop is hit — no averaging down, no second chances
- If price approaches stop but hasn't hit it: hold if thesis is intact

**Time stop:**
- If trade has been open 24 hours with no progress toward target: reassess
- If direction is no longer supported by at least 2 of 3 agents: close the position
- Maximum hold time: 72 hours

**Trailing stop:**
- Once trade is up 3%: move stop to breakeven
- Once trade is up 5%: trail stop 2% below highest price reached

---

## Trade Log Entry Format

```
## Entry
- Timestamp (UTC): YYYY-MM-DD HH:MM
- Pair: BTC-USD
- Direction: Long
- Entry Price: $X
- Target Price: $X
- Stop Loss: $X
- Stake: $X (X% of bankroll)
- Timeframe: 1h signal / 15m entry
- 20 SMA: $X | 50 SMA: $X | RSI: XX | Volume: X vs Xavg
- Aria Signal: Bullish (confidence XX)
- Reed Signal: Neutral (no major news)
- Sage Signal: Bullish (sentiment score +XX)
- Rationale: [2–3 sentences max]

## Exit
- Timestamp (UTC): YYYY-MM-DD HH:MM
- Exit Price: $X
- P&L: +$X / -$X (X%)
- Outcome: Won / Lost
- Exit Reason: Target hit / Stop hit / Time stop / Thesis invalidated
- Notes: [Optional — what worked or didn't]
```

---

## What The Sniper Is

- A momentum strategy that waits for confirmation before entry
- A disciplined system that sizes based on conviction
- A trend-follower that never fights the tape

## What The Sniper Is Not

- A reversal strategy — do not use to catch falling knives
- A scalping strategy — minimum 4-hour hold intended
- A prediction tool — entry is after confirmation, not before

---

## Hard Rules

1. Never enter without completing the full checklist
2. Never enter without a stop set
3. Never average down on a losing position
4. Never move stop further away from entry
5. Never hold a position through a major news event without reevaluating thesis
6. Never trade a coin not in WATCHLIST.md Section A
