# THE PROSPECTOR — Weekly Coin Universe Scan

## Purpose

The Prospector is Hana's weekly scan protocol. Every Sunday it pulls all active
Coinbase USD spot markets, filters for liquidity, fetches 6 months of real candle
data per coin, backtests all four strategies per coin using the-comparator,
scores and ranks the results, and routes Tier 1 and Tier 2 coins to the
appropriate trader watchlists.

This is the primary input for the Gatekeeper protocol.
Everything must use real Coinbase API data. No simulated candles.

---

## Step-by-Step Protocol

### Step 1: Pull All Active Coinbase USD Spot Markets

**Endpoint:**
```
GET https://api.coinbase.com/api/v3/brokerage/products
```

Filter for:
- `quote_currency_id = USD`
- `status = online`
- Not delisted or disabled

Output: list of all active COIN-USD trading pairs.

---

### Step 2: Liquidity Filter

Remove coins that don't meet minimum liquidity requirements:

| Filter | Minimum Threshold |
|---|---|
| 24h volume (USD) | $5,000,000 |
| Number of active markets | Listed on Coinbase for > 90 days |

Pull 24h volume via:
```
GET https://api.coinbase.com/api/v3/brokerage/market/product_book?product_id={product_id}
```

Or check ticker for volume data.

After filtering: typically 30–60 coins remain. Never test coins that don't meet
liquidity minimums — slippage will make backtest results meaningless.

Remove from consideration:
- BTC-USD and ETH-USD (already assigned to Max — do not include in Prospector)
- Any coin already in Active (Section A) of any trader's WATCHLIST.md

---

### Step 3: Fetch Historical Data

For each coin passing the filter:
- 6 months of 1-hour candles (preferred: 12 months where available)
- Use the-historian to fetch and validate data quality
- Skip coins with significant data gaps (> 5% of candles missing)

Data quality check:
- [ ] No gaps longer than 2 consecutive hours
- [ ] Volume data present on every candle
- [ ] No obvious price errors

---

### Step 4: Backtest All Four Strategies Per Coin

For each coin, run the-comparator with all four strategies:
- The Sniper
- EMA Crossover
- RSI Reversal
- VWAP Reversion

Record the composite score for each strategy.
Identify the winning strategy (highest score) for each coin.
Note the Tier classification from the-comparator output.

---

### Step 5: Score and Rank Results

Create a master ranking:

```
PROSPECTOR RESULTS — Week of YYYY-MM-DD
Coins scanned: XX
Coins passing liquidity filter: XX
Coins with sufficient data: XX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TIER 1 — AUTO-PROMOTE CANDIDATES
(Score ≥ 1.5, Sharpe ≥ 0.8, Win Rate ≥ 55%)

1. [COIN-USD] → [TRADER] (Score: X.XX, Sharpe: X.XX, Win%: XX%, Drawdown: X.X%)
2. [COIN-USD] → [TRADER]
[...]

TIER 2 — CONDITIONAL PROMOTE CANDIDATES
(Score ≥ 1.0, Sharpe ≥ 0.5)

1. [COIN-USD] → [TRADER]
[...]

TIER 3 — DO NOT PROMOTE
(Below Tier 2 thresholds — noted for reference)

Summary: X Tier 1, X Tier 2, X Tier 3

NOTABLE FINDINGS
[Any unusual results, potential overfitting flags, data quality issues]
```

---

### Step 6: Route to Trader WATCHLIST.md (Pending Section)

For Tier 1 and Tier 2 coins, add to the appropriate trader's WATCHLIST.md Pending section:

**WATCHLIST.md format (Pending section):**
```
## Section B — Pending (Awaiting Gatekeeper Approval)

| Coin | Best Strategy | Score | Sharpe | Win% | Drawdown | Tier | Added |
|---|---|---|---|---|---|---|---|
| SOL-USD | The Sniper | 1.82 | 1.1 | 62% | 8.3% | 1 | 2026-02-23 |
```

Route each coin to the trader whose strategy scored highest for that coin:
- The Sniper → Max's WATCHLIST.md
- EMA Crossover → Leo's WATCHLIST.md
- RSI Reversal → Zara's WATCHLIST.md
- VWAP Reversion → Kai's WATCHLIST.md

Do not add Tier 3 coins to any WATCHLIST.md.

**Stale entry expiry:** Remove any Pending entries older than 28 days that have not
been promoted to Active. The market conditions that produced those scores have changed.

---

### Step 7: Save and Report

Save the full Prospector report to:
```
/home/pgre/obsidian/vault/trading/backtests/YYYY-MM-DD-prospector-scan.md
```

Post a one-paragraph summary to Discord `#market-research`:
- Number of coins scanned
- Number of Tier 1 and Tier 2 candidates found
- Top 3 candidates by score
- Notable findings

Send full ranked results to Nicole.
Nicole runs the Gatekeeper to decide what to promote.

---

## Rules

1. Real Coinbase API data only — never simulate candles
2. Apply commissions (0.5%) and slippage (0.1%) in all backtests
3. Remove BTC-USD and ETH-USD from scope — they belong to Max regardless
4. Remove coins already in Active from scope — they're already deployed
5. Skip coins with insufficient data or poor data quality
6. Flag all overfitting concerns from the-comparator output
7. Never promote coins directly — route to Pending and let the Gatekeeper decide
