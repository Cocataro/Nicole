# LEO — STRATEGY NOTES

Strategy: EMA Crossover (9/21 EMA)
Last calibration: [ISO-8601 date]
Calibrated by: Nicole (weekly strategy update)

---

## Current Rules

All rules are defined in the skill file:
`/home/pgre/.openclaw/workspace/skills/ema-crossover/SKILL.md`

This file tracks calibration changes, performance notes, and adjustments
approved by Nicole based on Hana's weekly performance analysis.

---

## Active Calibration Notes

No calibrations yet — strategy running with default parameters.

**Default parameters:**
- EMAs: 9 and 21 on 1-hour chart
- Trend filter: 50 EMA slope (must be rising for longs)
- RSI filter: 45–70 at entry for longs
- Volume filter: above 20-period average on crossover candle
- Max stake: 10% of bankroll (3-of-3 consensus), 5–7% (2-of-3)
- Stop: below most recent swing low on 15-minute chart (max 4% from entry)
- Target: measured move (50 EMA to crossover distance projected from entry)
- Min R:R: 1.5:1

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

- Ranging/choppy markets: EMA crossovers whipsaw constantly
- Low volatility: insufficient follow-through after entry
- News-driven reversals: fundamental event overrides technical setup

When market conditions suggest ranging: pause the Leo cycle and notify Nicole.
