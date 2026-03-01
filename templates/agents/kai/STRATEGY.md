# KAI — STRATEGY NOTES

Strategy: VWAP Reversion (intraday mean reversion)
Last calibration: [ISO-8601 date]
Calibrated by: Nicole (weekly strategy update)

---

## Current Rules

All rules are defined in the skill file:
`/home/pgre/.openclaw/workspace/skills/vwap-reversion/SKILL.md`

This file tracks calibration changes, performance notes, and adjustments
approved by Nicole based on Hana's weekly performance analysis.

---

## Active Calibration Notes

No calibrations yet — strategy running with default parameters.

**Default parameters:**
- VWAP: calculated from 00:00 UTC daily using 1-hour candles
- Signal threshold: 1+ standard deviation from VWAP (prefer 2 SD)
- Active hours: 08:00–20:00 UTC (hard gate — no exceptions)
- Volume filter: session volume above average (institutional participation required)
- Max stake: 10% of bankroll (2 SD signal), 5–7% (1–2 SD signal)
- Stop: at 2 SD band or 2% from entry (whichever is tighter)
- Target: VWAP itself (primary), opposite SD band (high conviction only)
- Min R:R: 1.2:1 (tighter than other strategies — intraday multiple trade potential)
- Time stop: 20:00 UTC — ALL positions closed regardless of P&L

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

## Trending Day Detection Rules

A "trending day" overrides VWAP reversion logic. Stop entering new positions when:
- Price has moved > 2% from VWAP AND
- Sustained in one direction for 2+ consecutive hours

On a trending day: close open positions, enter no new trades, wait for tomorrow.
Log each trending day detected.

---

## Known Market Conditions Where This Strategy Underperforms

- Strong trending markets: VWAP chasing causes losses
- Low volume days: VWAP is easily distorted, thin spreads
- Overnight sessions (outside 08:00–20:00 UTC): institutional anchor absent
- Major news events that create sustained directional moves
