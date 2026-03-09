# VWAP REVERSION — Intraday Mean Reversion Strategy

## Purpose

VWAP Reversion is Kai's core trading methodology. It exploits the tendency of
price to revert to the Volume Weighted Average Price during high-volume trading
sessions. Institutions use VWAP as a benchmark — when price deviates significantly,
institutional order flow often pushes it back.

Active hours only: 08:00–20:00 UTC.
VWAP resets at 00:00 UTC — recalculate from scratch each trading day.
Never hold positions overnight. The thesis expires when VWAP resets.

---

## VWAP Calculation

VWAP = Cumulative (Price × Volume) / Cumulative Volume

Recalculate from 00:00 UTC using 1-hour candles for the current session.
For each candle: typical price = (High + Low + Close) / 3

Standard deviation bands:
- Upper band 1: VWAP + 1 SD
- Lower band 1: VWAP - 1 SD
- Upper band 2: VWAP + 2 SD
- Lower band 2: VWAP - 2 SD

---

## Pre-Trade Checklist

Complete every item before entering any position. A single fail means no trade.

**1. Time Gate — HARD REQUIREMENT**
- [ ] Current UTC time is between 08:00 and 20:00
- [ ] If outside this window: DO NOT TRADE. Exit immediately, no action.
- [ ] This is non-negotiable. VWAP is unreliable outside active hours.

**2. Price Deviation From VWAP (1-hour chart)**
- [ ] Price has deviated significantly from VWAP — minimum 1 standard deviation
- [ ] For longs: price is at or below VWAP - 1 SD (oversold relative to VWAP)
- [ ] For shorts: price is at or above VWAP + 1 SD (overbought relative to VWAP)
- [ ] 2 SD deviation: high conviction signal (price rarely stays here long)
- [ ] Less than 1 SD deviation: skip — insufficient edge

**3. Volume Profile**
- [ ] Session volume is above average (institutional participation is needed for VWAP to matter)
- [ ] Low volume days: skip — VWAP is easily distorted and reverts slowly if at all
- [ ] Volume is not in a sustained directional trend (not a strong trending day)

**4. Market Context**
- [ ] Price is not in a strong sustained trend away from VWAP (trending days reject VWAP)
- [ ] Multiple touches of VWAP during the session: confirms VWAP is acting as anchor
- [ ] If price has not touched VWAP since open: may be a trending day — use caution

**5. Agent Consensus**
- [ ] At least 2 of 3 agents (Aria, Reed, Sage) are not strongly bearish (for longs)
- [ ] No major negative news event that could sustain a directional move
- [ ] If agents are strongly directional against the trade: skip

**6. Risk Gate**
- [ ] Single trade stake ≤ 10% of current bankroll
- [ ] Total open exposure after entry would remain ≤ 30% of bankroll
- [ ] Bankroll is above $25 floor
- [ ] No leverage or margin is used

---

## Entry Execution

After all checklist items pass:

1. Confirm the 1-hour candle has closed at or beyond the 1 SD level
2. Switch to 15-minute chart for entry timing
3. Wait for a 15-minute candle to close that shows price starting to revert toward VWAP
4. Enter on the first 15-minute close that is moving back toward VWAP
5. Never enter while price is still moving away from VWAP

---

## Position Sizing

| Deviation | Stake |
|---|---|
| 2 SD or more (high conviction) | 10% of bankroll |
| 1–2 SD with volume confirmation | 5–7% of bankroll |
| Less than 1 SD | No trade |

Minimum trade size: $2.

---

## Stop Loss Placement

- For longs: stop just below the 2 SD lower band (beyond this = strong downtrend, not reversion)
- For shorts: stop just above the 2 SD upper band
- Alternative: stop at 2% below entry for longs / 2% above entry for shorts (use whichever is tighter)
- Stop must be set immediately after entry. No exceptions.

---

## Target Placement

- Primary target: VWAP itself (the mean)
- Secondary target: opposite SD band (only for high conviction 2 SD setups)
- Minimum risk/reward ratio: 1.2:1 (tighter than other strategies — intraday, multiple trades possible)

---

## Exit Rules

**Take profit:**
- Exit at VWAP for primary target
- For 2 SD setups: exit half at VWAP, trail stop on remainder

**Stop loss:**
- Exit immediately when stop is hit
- If price reaches the 2 SD level against you: thesis is wrong, close immediately

**Time stop — NON-NEGOTIABLE:**
- All positions MUST be closed by 20:00 UTC
- If a position is still open at 19:45 UTC: close it, do not wait for target
- VWAP resets at midnight UTC — holding overnight means the anchor is gone

**Trending day detection:**
- If price has moved more than 2% from VWAP and continues in one direction for 2+ hours:
  this is a trending day, not a reversion day — stop entering new trades
- Close any open positions and wait for tomorrow

---

## Trade Log Entry Format

```
## Entry
- Timestamp (UTC): YYYY-MM-DD HH:MM
- Coin: [COIN-USD]
- Direction: Long
- Entry Price: $X
- VWAP at entry: $X
- Deviation: -X SD below VWAP
- Target Price: $X (VWAP)
- Stop Loss: $X (at 2 SD or 2% stop)
- Stake: $X (X% of bankroll)
- Timeframe: 1h signal / 15m entry
- Session volume vs average: Xvol vs Yavg
- Aria Signal: [Bullish / Bearish / Neutral / No strong view]
- Reed Signal: [Bullish / Bearish / Neutral / No major news]
- Sage Signal: [Bullish / Bearish / Neutral]
- Rationale: [2–3 sentences max]

## Exit
- Timestamp (UTC): YYYY-MM-DD HH:MM
- Exit Price: $X
- VWAP at exit: $X
- P&L: +$X / -$X (X%)
- Outcome: Won / Lost
- Exit Reason: VWAP target hit / Stop hit / Time stop at 20:00 UTC / Trending day exit
- Notes: [Optional]
```

---

## What VWAP Reversion Is

- An intraday mean reversion strategy anchored to institutional order flow
- Best in high-volume sessions with liquid assets
- A systematic approach with time-bound risk (all positions expire at 20:00 UTC)

## What VWAP Reversion Is Not

- A trend-following strategy — do not use on strong trending days
- A multi-day holding strategy — never hold overnight
- Suitable for low-volume assets where VWAP is not a meaningful anchor

---

## Hard Rules

1. Time gate is non-negotiable: 08:00–20:00 UTC only. Outside this window: no action.
2. Close ALL positions by 20:00 UTC. No exceptions.
3. Never hold overnight — VWAP resets and the thesis expires.
4. Never enter on a trending day (price sustained > 2% from VWAP for 2+ hours).
5. Never trade a coin not in WATCHLIST.md Section A.
6. Never trade coins assigned to Max, Leo, or Zara.
