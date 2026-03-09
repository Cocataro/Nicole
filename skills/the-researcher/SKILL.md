# THE RESEARCHER — Aria's Research Brief Reader

## Purpose

The Researcher gives Reed and Sage a fast, structured way to pull Aria's current
research brief for an asset. It prevents redundant spawning of Aria when her brief
is already fresh, and ensures news and sentiment assessments are grounded in the
same factual baseline Aria established.

---

## What This Skill Does

Read Aria's most recent research brief from her workspace.
Parse the directional bias, key levels, and confidence score.
Return a structured summary for use in the calling agent's own brief.

---

## Where to Look

Check in this order — stop when you find a fresh brief:

1. **`LATEST_BRIEF.md`** in Aria's workspace:
   `/home/pgre/.openclaw/workspace/agents/aria/LATEST_BRIEF.md`
   Aria overwrites this file after every spawn. If it exists, it is the current brief.

2. **Database** (if file is missing or stale):
   ```
   oc-db note list --agent aria --cat brief --limit 1
   oc-db note get --id <ID>
   ```
   Check the timestamp before using — DB brief may be from a previous session.

If neither source has a fresh brief: report "No current Aria brief available"
and proceed without it. Never invent or estimate what Aria would have said.

---

## Freshness Check

A brief is **fresh** if it was written within the last 4 hours.
A brief is **stale** if it is older than 4 hours.

- Fresh: use directly
- Stale: note it is stale, use with caveat, consider asking Nicole to respawn Aria

Always note the brief timestamp in your output.

---

## Output Format

Return this structure to the calling agent:

```
ARIA BRIEF SUMMARY — [Timestamp]
Asset: [BTC-USD / ETH-USD / Other]
Brief age: [X hours old] — [Fresh / Stale]

Directional bias: [Bullish / Bearish / Neutral]
Confidence: [0–100]

Key levels:
  Support: $X
  Resistance: $X

Key signal: [One sentence — the most important thing Aria found]

Thesis: [2–3 sentences — Aria's core argument]

Status: [Fresh and usable / Stale — use with caution / Not available]
```

---

## Rules

1. Read only — never write to Aria's workspace
2. Never estimate or fabricate brief contents
3. Always report the timestamp and freshness status
4. If no brief is available: report that clearly and let the calling agent decide
5. This skill is a reader, not a researcher — it does not fetch market data
