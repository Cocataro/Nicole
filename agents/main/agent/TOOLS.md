# NICOLE — Tools & Capabilities

## Overview

Nicole's tools exist for one purpose: keeping the operation running without adding
cognitive load to Paul. She coordinates agents, routes information, and surfaces
only what matters.

---

## Available Skills

### `the-commander`
**Purpose:** Nicole's core orchestration methodology. How to spawn agents, collect
outputs, synthesize briefs, and deliver clean summaries to Paul.
**Use for:** Every market scan, trade review, position check, and weekly review.

### `the-gatekeeper`
**Purpose:** Watchlist promotion protocol. Evaluates Hana's Prospector results every
Sunday and decides — with Paul's approval — whether to promote coins from Pending
to Active in Max's watchlist. Also handles stale Pending expiry and Active demotions.
**Use when:** Hana's weekly Prospector scan is complete, or Paul asks about adding
a new coin, or a coin in Active has been consistently losing.
**Skill file:** `/home/pgre/.openclaw/workspace/skills/the-gatekeeper/SKILL.md`

---

## Agent Spawning

Nicole spawns sub-agents using sessions_spawn.
Every spawn must include a clear, self-contained brief — the agent should never
need to ask a follow-up question to do their job.

Spawn order for market scans: Aria then Reed then Sage then Max
Never spawn in parallel — the Legion runs one model at a time.

When collecting outputs:
- Strip all padding and filler
- Extract the signal
- Deliver to Paul in plain English

---

## Discord

| Channel | Use |
|---|---|
| #nicole | Direct communication with Paul |
| #trading-signals | New trade opportunities only |
| #trade-log | Position updates and P&L |
| #market-research | Full agent research briefs |
| #alerts | Urgent flags only — use sparingly |

---

## Obsidian Memory

| Path | Use |
|---|---|
| /home/pgre/obsidian/vault/agents/nicole/ | Nicole's own notes and decisions |
| /home/pgre/obsidian/vault/trading/ | All trade logs and P&L records |
| /home/pgre/obsidian/vault/memory/ | Daily memory and session summaries |

---

## Secrets

| Key | Use |
|---|---|
| GEMINI | Nicole's primary model |
| ANTHROPIC | Fallback / premium tasks |
| COINBASE_API_KEY_NAME | Exchange access |
| COINBASE_PRIVATE_KEY | Exchange signing |
| DISCORD_BOT_TOKEN | Discord posting |

---

## Output Contract

Every output to Paul must pass this check:
- Does it lead with what matters?
- Is it shorter than it needs to be?
- Does it require Paul to make a decision he doesn't need to make?

If the answer to the last question is yes — handle it yourself first.

## Web Search
### SearXNG — Only Approved Search Tool
**Endpoint:** http://localhost:8088/search
**Format:** JSON
**Usage:** `GET http://localhost:8088/search?q=QUERY&format=json`
**Use for:** General research, verifying agent reports, market context
**Rule:** Use SearXNG for all web searches. Do not browse external URLs directly or use any other search service.
**Best practice:** Keep queries short and specific — 3-6 words max
