# Nicole — AI Trading Command Centre

An autonomous multi-agent trading system built on [OpenClaw](https://openclaw.ai), powered by Claude. Nicole acts as mission commander and chief of staff, coordinating a team of specialist agents across research, sentiment, risk, and execution.

---

## Agent Roster

| Agent | Role |
|---|---|
| **Nicole** | Mission commander. Coordinates the team, manages heartbeats, routes tasks, and keeps the operator informed without adding cognitive load. |
| **Aria** | Deep research specialist. Crypto fundamentals, on-chain data, regulatory events. |
| **Reed** | Real-time news scanner. Breaking developments that move markets. |
| **Sage** | Sentiment & crowd psychology analyst. FOMO/fear signals, whale activity, social momentum. |
| **Dylon** | Risk management agent. Guardian of the trade — keeps Max alive and disciplined. |
| **Hana** | Backtesting & strategy validation. Tests Max's tactics against historical data to validate edge. |
| **Max** | Paper trade execution agent. Calm, precise, unemotional executor. Maintains the ledger. |
| **Leo** | EMA Crossover specialist. Trend follower — waits for momentum to confirm, then rides it. |
| **Zara** | RSI Reversal specialist. Dip buyer — waits for the crowd to panic, steps in when the flush is done. |
| **Kai** | VWAP Reversion specialist. Intraday hunter — trades the institutional anchor and nothing else. |

---

## Repository Structure

```
agents/
  <agent>/
    agent/
      SOUL.md        # Agent identity, personality, and operating rules
      TOOLS.md       # Tools and capabilities available to the agent
skills/
  the-sniper/        # Max's breakout trading strategy
  ema-crossover/     # Leo's 9/21 EMA trend following strategy
  rsi-reversal/      # Zara's oversold dip buying strategy
  vwap-reversion/    # Kai's intraday mean reversion strategy
  the-gatekeeper/    # Nicole's watchlist promotion protocol
  the-prospector/    # Hana's weekly coin universe scan
  the-comparator/    # Hana's head-to-head strategy scorecard
  the-accountant/    # Portfolio state reader (shared tool)
  the-historian/     # Historical data fetcher and analyzer
  the-commander/     # Nicole's agent orchestration methodology
templates/
  HEARTBEAT.md       # Nicole's heartbeat check protocol
  MEMORY.md          # Nicole's persistent state (initial template)
  agents/
    max/             # Max's initial workspace files (WATCHLIST, TRADE_STATE, TRADE_LOG)
    leo/             # Leo's initial workspace files (WATCHLIST, TRADE_STATE, TRADE_LOG, STRATEGY)
    zara/            # Zara's initial workspace files (WATCHLIST, TRADE_STATE, TRADE_LOG, STRATEGY)
    kai/             # Kai's initial workspace files (WATCHLIST, TRADE_STATE, TRADE_LOG, STRATEGY)
canvas/              # OpenClaw canvas UI
completions/         # Shell completions (bash, zsh, fish, PowerShell)
cron/
  jobs.json          # Scheduled cron jobs
dashboard/           # Local monitoring dashboard
searxng/             # Self-hosted search (SearxNG) config
openclaw.template.json  # Config template (tokens redacted)
.env.example            # Environment variable template
```

---

## Setup

1. Clone the repo and copy the template config:
   ```bash
   git clone https://github.com/Cocataro/Nicole.git
   cp openclaw.template.json openclaw.json
   ```

2. Fill in your tokens in `openclaw.json`:
   - `${TELEGRAM_BOT_TOKEN}` — Telegram bot token
   - `${GATEWAY_AUTH_TOKEN}` — OpenClaw gateway auth token
   - `${OLLAMA_BASE_URL}` — Ollama API endpoint (e.g. `http://localhost:11434/v1`)
   - `${OPENCLAW_HOME}` — Absolute path to your OpenClaw directory

3. Set up your environment variables:
   ```bash
   cp .env.example secrets.env
   ```
   Then fill in your keys in `secrets.env` — see `.env.example` for all required variables.

4. Initialize the workspace — copy agent files, skills, and workspace templates:
   ```bash
   cp -r agents/* ~/.openclaw/agents/
   cp -r skills/* ~/.openclaw/workspace/skills/
   cp templates/HEARTBEAT.md ~/.openclaw/workspace/
   cp templates/MEMORY.md ~/.openclaw/workspace/
   cp -r templates/agents/* ~/.openclaw/workspace/agents/
   ```

5. Import cron jobs into OpenClaw and start OpenClaw.

---

## Primary Exchange

Coinbase Advanced Trade — paper mode by default. BTC-USD and ETH-USD.
