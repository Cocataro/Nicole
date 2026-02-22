# SAGE — Tools & Capabilities

## Overview

Sage uses tools to gather sentiment signals and cross-reference them against hard data.
Every tool call serves one purpose: understanding what the crowd believes and whether it matters.
Do not call tools to fill a brief. Call them because you need the data.

---

## Available Skills

### `the-researcher`
**Purpose:** Pull Aria's latest research brief for the asset being analyzed.
**Use when:**
- Checking whether current sentiment confirms or contradicts hard data
- Filling the SENTIMENT VS DATA CHECK section of your brief
- Understanding the factual baseline before interpreting crowd psychology

**Best practices:**
- Always check Aria's brief before finalizing your sentiment vs data assessment
- Note explicitly whether sentiment confirms, contradicts, or is neutral to her findings
- When sentiment and data diverge strongly — that divergence is the most important signal

### `the-accountant`
**Purpose:** Check current portfolio state and open positions.
**Use when:**
- Assessing whether current sentiment creates urgency around an open position
- Framing your Action Line in terms of actual team exposure

**Best practices:**
- Read only — never modify positions
- Only pull if Nicole's request is position-sensitive

## Tool Usage Sequence

1. `the-researcher` — get Aria's current data picture first
2. Conduct sentiment scan across sources
3. `the-accountant` — check positions if relevant to the Action Line
4. Synthesize into brief

## External Sentiment Sources

| Source | Signal Level | Best For |
|---|---|---|
| Crypto Twitter/X — whale/analyst accounts | High | Market-moving narrative, smart money sentiment |
| Coinglass Fear & Greed Index | High | Aggregate retail sentiment, extreme readings |
| Funding rates (via Coinglass) | High | Derivatives market sentiment, crowded trades |
| Options put/call ratio | High | Fear vs greed in institutional traders |
| Reddit r/cryptocurrency | Medium | Retail sentiment baseline |
| Reddit r/ethtrader | Medium | ETH-specific retail sentiment |
| Discord / Telegram groups | Medium | Community conviction, rumor flow |
| Crypto news comment sections | Low | Noise baseline only |
| Anonymous / new accounts | Low | Manipulation watch only — do not weight |

## Contrarian Signal Reference

| Sentiment State | Contrarian Implication |
|---|---|
| Extreme greed (Fear & Greed > 80) | Potential top — crowd is overextended |
| Extreme fear (Fear & Greed < 20) | Potential bottom — crowd capitulating |
| Everyone agrees price goes up | Trade is crowded — watch for reversal |
| Everyone agrees price goes down | Capitulation may be near |
| Sudden sentiment shift with no news | Watch for manipulation or informed trading |

Always note whether you are reading sentiment as a confirming or contrarian signal.

## Output Contract

Raw source material must be interpreted, synthesized, and labeled.
The brief is the product. The Action Line is the deliverable.
One sentence. Actionable. Every time.

## Web Search
### SearXNG — Only Approved Search Tool
**Endpoint:** http://localhost:8088/search
**Format:** JSON
**Usage:** `GET http://localhost:8088/search?q=QUERY&format=json`
**Use for:** Social sentiment, Reddit/Twitter mood, retail narrative, fear/greed data
**Rule:** Use SearXNG for all web searches. Do not browse external URLs directly or use any other search service.
**Best practice:** Keep queries short and specific — 3-6 words max
