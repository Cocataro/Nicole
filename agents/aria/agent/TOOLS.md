# ARIA — Tools & Capabilities

## Overview

Aria uses tools to gather, verify, and synthesize market intelligence.
Every tool call should serve a specific research question.
Do not call tools speculatively. Know what you're looking for before you look.

---

## Available Skills

### `the-historian`
**Purpose:** Retrieve historical price data, past market events, and pattern precedents.
**Use when:**
- Establishing base rates
- Identifying analogous past setups
- Validating support/resistance levels with historical context
- Building the BACKGROUND and BASE RATE sections of a brief

**Best practices:**
- Always specify the asset, time range, and metric clearly
- Note the data source and date range in your brief

---

### `the-accountant`
**Purpose:** Retrieve current portfolio state, position sizes, P&L, and bankroll status.
**Use when:**
- Framing a brief in terms of the team's current exposure
- Checking if the team already has a position in the asset being researched
- Assessing fit within the $50 paper bankroll

**Best practices:**
- Use at brief start if the research question is position-sizing sensitive
- Read only — do not modify positions

---

### `the-sniper`
**Purpose:** Current prices, order book snapshots, funding rates, open interest, recent large trades.
**Use when:**
- Getting current market price and 24h context
- Checking funding rate direction and magnitude
- Pulling open interest data
- Identifying unusual volume or large transactions

**Best practices:**
- Always note the exact timestamp of sniper data in your brief
- Funding rate + OI together tell a more complete story than either alone

---

## Tool Usage Sequence

For a typical research brief, follow this order:
1. `the-sniper` — current market state
2. `the-historian` — historical context and base rates
3. `the-accountant` — portfolio state if position-sizing is relevant
4. Synthesize into brief

---

## External Research Sources

| Source | Tier | Best For |
|---|---|---|
| Glassnode | 1 | On-chain: SOPR, MVRV, exchange flows |
| CryptoQuant | 1 | Exchange reserves, miner flows |
| Dune Analytics | 1 | Custom on-chain queries |
| Kaiko | 1 | Institutional trade and order book data |
| Coinglass | 2 | Futures OI, liquidation maps, funding rates |
| The Block | 2 | Institutional research |
| Messari | 2 | Asset fundamentals |
| CoinDesk / Reuters | 2 | News, regulatory developments |
| Crypto Twitter / social | 3 | Sentiment signals only |

---

## Output Contract

Raw tool output must be interpreted, contextualized, and cited.
Never paste raw tool output into a brief without processing it.
The brief is the product. The tools are how you build it.

## Web Search
### SearXNG — Only Approved Search Tool
**Endpoint:** http://localhost:8088/search
**Format:** JSON
**Usage:** `GET http://localhost:8088/search?q=QUERY&format=json`
**Use for:** Market research, on-chain data, macroeconomic analysis, academic sources
**Rule:** Use SearXNG for all web searches. Do not browse external URLs directly or use any other search service.
**Best practice:** Keep queries short and specific — 3-6 words max
