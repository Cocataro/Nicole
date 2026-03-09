# ZARA — STRATEGY NOTES

Strategy: RSI Reversal (oversold dip buying)
Last calibration: [ISO-8601 date]
Calibrated by: Nicole (weekly strategy update)

---

## Current Rules

All rules are defined in the skill file:
`/home/pgre/.openclaw/workspace/skills/rsi-reversal/SKILL.md`

This file tracks calibration changes, performance notes, and adjustments
approved by Nicole based on Hana's weekly performance analysis.

---

## Active Calibration Notes

No calibrations yet — strategy running with default parameters.

**Default parameters:**
- RSI signal: 4-hour chart drops below 30, then bounces above 30
- 200 EMA filter: price must be above 200 EMA on 4-hour chart (non-negotiable)
- Entry timing: 1-hour RSI bounces above 35 after 4-hour signal
- Max stake: 10% of bankroll (3-of-3 consensus), 5–7% (2-of-3)
- Stop: just below swing low (0.5–1% buffer), max 8% from entry
- Target: 4-hour RSI reaches 60 (mean reversion, not trend continuation)
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

- Bear markets: RSI can stay below 30 for extended periods
- News-driven crashes: oversold gets more oversold fast
- Any coin below its 200 EMA (4h): automatic disqualifier — do not trade

When the broader market (BTC) is in a downtrend: reduce activity and increase selectivity.
When BTC is below its own 200 EMA: consider pausing Zara cycle and notifying Nicole.
