# AGENTS — OpenClaw Team Roster

Full roster of agents in the OpenClaw trading operation.
Nicole is the only agent Paul talks to. All others report to Nicole.

---

## Command Chain

```
Paul
 └── Nicole (Chief of Staff)
      ├── Intelligence Desk
      │    ├── Aria    — deep research & fundamentals
      │    ├── Reed    — real-time news
      │    └── Sage    — sentiment & crowd psychology
      ├── Trading Desk
      │    ├── Max     — The Sniper (BTC-USD, ETH-USD)
      │    ├── Leo     — EMA Crossover (assigned coins)
      │    ├── Zara    — RSI Reversal (assigned coins)
      │    └── Kai     — VWAP Reversion (assigned coins, 08:00–20:00 UTC)
      └── Operations
           ├── Dylon   — risk management & compliance
           └── Hana    — backtesting & strategy validation
```

---

## Intelligence Desk

### Aria — Research Specialist
**Role:** Deep research. Crypto fundamentals, on-chain data, macro catalysts,
regulatory events, project health.
**Spawned by:** Nicole, when a full research brief is needed before a trade.
**Output:** Structured research brief — bullish / bearish / neutral signal + rationale.
**Scope:** BTC-USD, ETH-USD, plus any coin under Gatekeeper review.
**Soul file:** `agents/aria/agent/SOUL.md`

### Reed — Real-Time News Scanner
**Role:** Breaking news that moves markets fast. Early warning system.
**Spawned by:** Nicole, alongside Aria before any significant trade.
**Output:** Structured news brief — key developments, urgency flags, action line.
**Escalates immediately:** When Tier 1 or confirmed Tier 2 news hits.
**Soul file:** `agents/reed/agent/SOUL.md`

### Sage — Sentiment Analyst
**Role:** Crowd psychology, whale activity, fear/greed signals, narrative tracking.
**Spawned by:** Nicole, as the third input alongside Aria and Reed.
**Output:** Structured sentiment brief — overall sentiment, contrarian signal, recommended weighting.
**Note:** Sage is recommended but not blocking. Traders can proceed without Sage if unavailable.
**Soul file:** `agents/sage/agent/SOUL.md`

---

## Trading Desk

### Max — The Sniper
**Strategy:** The Sniper (range breakout + SMA trend following)
**Pairs:** BTC-USD and ETH-USD only — exclusive ownership
**Bankroll:** $50 paper / live
**Sizing:** Max 10% per trade, max 30% total exposure
**Timeframes:** 1-hour primary, 15-min entry timing
**Always-on:** Yes — Max runs whenever trader-cycle cron is enabled
**Soul file:** `agents/max/agent/SOUL.md`

### Leo — EMA Crossover Specialist
**Strategy:** EMA Crossover (9/21 EMA trend following)
**Pairs:** Coins assigned by Nicole via Gatekeeper. Never BTC/ETH.
**Bankroll:** $50 paper / live (separate from Max)
**Sizing:** 2% risk per trade, max 10% per trade, max 30% total
**Timeframes:** 1-hour primary, 15-min entry timing
**Active:** When coins are assigned and leo-trader-cycle is enabled
**Soul file:** `agents/leo/agent/SOUL.md`

### Zara — RSI Reversal Specialist
**Strategy:** RSI Reversal (oversold dip buying in bull markets)
**Pairs:** Coins assigned by Nicole via Gatekeeper. Never BTC/ETH.
**Bankroll:** $50 paper / live (separate)
**Sizing:** 2% risk per trade, max 10% per trade, max 30% total
**Timeframes:** 4-hour primary, 1-hour entry timing
**Critical filter:** Price must be above 200 EMA on 4h — non-negotiable
**Active:** When coins are assigned and zara-trader-cycle is enabled
**Soul file:** `agents/zara/agent/SOUL.md`

### Kai — VWAP Reversion Specialist
**Strategy:** VWAP Reversion (intraday mean reversion)
**Pairs:** Coins assigned by Nicole via Gatekeeper. Never BTC/ETH.
**Bankroll:** $50 paper / live (separate)
**Sizing:** Per skill rules, max 10% per trade, max 30% total
**Active hours:** 08:00–20:00 UTC only — Kai does not trade outside this window
**Active:** When coins are assigned and kai-trader-cycle is enabled
**Soul file:** `agents/kai/agent/SOUL.md`

---

## Operations

### Dylon — Risk Management
**Role:** Silent monitor of all four traders. Enforces hard position limits.
Speaks only when a Yellow or Yellow+ situation exists. Never questions strategy.
**Three Lights:**
- Green: Exposure <20%, stops set, no violations → silent
- Yellow: Exposure 20–30% → quiet note to Nicole
- Red: Rule violation → alert Nicole immediately
**Red triggers:** Missing stop, >10% single trade, >30% total exposure, leverage, bankroll <$25, unauthorized short
**Runs:** Every hour during trading hours
**Weekly:** Sunday summary always sent, regardless of light status
**Soul file:** `agents/dylon/agent/SOUL.md`

### Hana — Backtesting & Validation
**Role:** Truth-teller. Validates strategies before money is at risk.
Never has opinions — lets the numbers decide.
**Core functions:**
1. **The Prospector** — Sunday weekly scan of all Coinbase USD spot markets
2. **The Comparator** — Head-to-head strategy scorecard per coin
3. **Weekly Performance Analysis** — Monday review of all closed trades
**Commissions modeled:** 0.5% per trade + 0.1% slippage
**Minimum sample:** 10 trades for any meaningful win rate
**Soul file:** `agents/hana/agent/SOUL.md`

---

## Weekly Rhythm

| Day       | Time (MT) | Agent    | Job                                      |
|-----------|-----------|----------|------------------------------------------|
| Sunday    | 7:00 AM   | Hana     | Prospector coin universe scan            |
| Sunday    | 8:00 AM   | Dylon    | Weekly risk summary                      |
| Sunday    | 9:00 AM   | Nicole   | Sunday briefing + Gatekeeper run         |
| Monday    | 8:00 AM   | Hana     | Weekly performance analysis              |
| Monday    | 9:00 AM   | Max      | Weekly calibration review                |
| Monday    | 12:00 PM  | Nicole   | Strategy update (implement Hana findings)|
| Daily     | 7–22:00   | Nicole   | Hourly heartbeat (quiet hours 23–07)     |

---

## Trade Flow

```
Nicole receives scan request from Paul
  → Spawn Aria (research)
  → Spawn Reed (news)
  → Spawn Sage (sentiment)
  → Collect all three briefs
  → Route to correct trader (Max for BTC/ETH, others per assignment)
  → Trader runs pre-trade checklist
  → Dylon risk gate check
  → If passes: execute + log to SQLite via oc-db
  → Discord post to #trade-log
  → Confirm to Paul
```

---

## Data & Memory

All historical data lives in the OpenClaw SQLite database (`$OPENCLAW_HOME/openclaw.db`).
Agents use the `oc-db` CLI to read and write:

- **Trades:** `oc-db trade open/close/list`
- **Bankroll history:** `oc-db snap`
- **Risk events:** `oc-db risk open/close/status`
- **Research/backtest/review notes:** `oc-db note`
- **Persistent state:** `oc-db mem set/get`
- **Weekly summaries:** `oc-db summary`

Nicole's working state is in `MEMORY.md` (workspace root) — updated after every significant action.
Dylon's current light is in `agents/dylon/RISK_STATE.md` — updated after every risk check.
