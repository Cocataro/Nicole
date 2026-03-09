# MAX — STRATEGY NOTES

Strategy: The Sniper (Range Breakout & Trend Following)
Last calibration: [ISO-8601 date]
Calibrated by: Nicole (weekly strategy update)

---

## Current Rules

All rules are defined in the skill file:
`/home/pgre/.openclaw/workspace/skills/the-sniper/SKILL.md`

This file tracks calibration changes, performance notes, and adjustments
approved by Nicole based on Hana's weekly performance analysis.

---

## Active Calibration Notes

No calibrations yet — strategy running with default parameters.

**Default parameters:**
- Trend filter: 20 SMA above 50 SMA on 1-hour chart (longs only unless Paul authorizes shorts)
- RSI entry range: 40–60 on 1-hour chart
- Volume filter: above 20-period average on setup candle
- Max stake: 10% of bankroll (3-of-3 consensus), 5–7% (2-of-3)
- Stop: most recent swing low on 1-hour chart, min 1.5% from entry, max 5% from entry
- Target: next meaningful resistance level, min 1.5:1 R:R
- Trailing stop: breakeven at +3%, trail 2% below peak at +5%
- Max hold: 72 hours

---

## Change Log

| Date | Change | Confidence | Approved By |
|---|---|---|---|

No changes yet.

---

## Performance Notes

| Date | Observation | Action |
|---|---|---|

No observations yet — insufficient data.

---

## Known Market Conditions Where This Strategy Underperforms

- Choppy/ranging markets: SMA crossovers produce false signals
- Low volume environments: breakouts fail without follow-through
- News-driven reversals: fundamental events override technical setups
- RSI extremes at entry: extended price (RSI > 60) or weakening (RSI < 40)

When 20/50 SMA is flat with no clear slope: pause and notify Nicole.
When BTC is making lower lows on daily: reduce size, increase selectivity.
