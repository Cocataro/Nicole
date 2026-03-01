# THE HISTORIAN — Historical Data & Backtesting Tool

## Purpose

The Historian is used by Aria and Hana to retrieve historical OHLCV data from
the Coinbase API, calculate base rates, identify analogous historical setups,
and validate support/resistance levels with real price history.

No simulated data. No estimated candles. Real API data only.
If the API call fails: halt and report the gap. Do not substitute synthetic values.

---

## Coinbase API — Historical Candles

**Endpoint:**
```
GET https://api.coinbase.com/api/v3/brokerage/products/{product_id}/candles
```

**Parameters:**
| Parameter | Values | Notes |
|---|---|---|
| `granularity` | `ONE_MINUTE`, `FIVE_MINUTE`, `FIFTEEN_MINUTE`, `THIRTY_MINUTE`, `ONE_HOUR`, `TWO_HOUR`, `SIX_HOUR`, `ONE_DAY` | Use ONE_HOUR for most analysis |
| `start` | Unix timestamp (seconds) | Start of the range |
| `end` | Unix timestamp (seconds) | End of the range |

**Auth:** Not required for public market data endpoints.

**Response format (array of candles):**
```json
[
  {
    "start": "unix_timestamp",
    "low": "price",
    "high": "price",
    "open": "price",
    "close": "price",
    "volume": "volume"
  }
]
```

**Note:** API returns maximum 300 candles per call. For longer periods, paginate:
- End = desired end time
- Start = End - (300 × granularity_seconds)
- Repeat, shifting the window back

---

## Data Quality Check

Before using any dataset, verify:
- [ ] No gaps longer than 2 hours in hourly data
- [ ] No obviously incorrect prices (spikes of > 20% in a single candle)
- [ ] Volume data is non-zero on every candle
- [ ] Dataset covers the full requested time period

If data quality issues are found: note them explicitly in the output.
Do not silently use bad data.

---

## Standard Calculations

### Moving Averages
- SMA(n): Simple moving average of closing prices over n periods
- EMA(n): Exponential moving average (weight = 2/(n+1))

### RSI (14-period standard)
- Gain = Average of up closes over 14 periods
- Loss = Average of down closes over 14 periods
- RS = Gain / Loss
- RSI = 100 - (100 / (1 + RS))

### VWAP (session-based)
- Reset at 00:00 UTC each day
- Typical price = (High + Low + Close) / 3
- VWAP = Cumulative(typical_price × volume) / Cumulative(volume)

### Bollinger Bands (20-period, 2 SD)
- Middle = SMA(20)
- Upper = SMA(20) + 2 × SD(20)
- Lower = SMA(20) - 2 × SD(20)

---

## Base Rate Calculation

For any setup or event:

1. Define the setup precisely (e.g., "RSI drops below 30 while price is above 200 EMA")
2. Search the full dataset for all occurrences
3. For each occurrence: measure outcome at T+4h, T+24h, T+72h
4. Report: N occurrences, win rate %, average gain on wins, average loss on losses

Minimum sample size: 10 occurrences for any base rate to be reportable.
Below 10: report "insufficient sample size" — do not publish a rate.

---

## Support/Resistance Identification

- Identify price levels where price reversed direction at least twice
- Stronger levels: 3+ touches with significant volume
- Label each level with: price, number of touches, date of most recent touch, volume at touches

Never fabricate levels. Every level must be visible in the actual price history.

---

## Output Format (for Hana backtests)

```
DATA SUMMARY
Period:       YYYY-MM-DD to YYYY-MM-DD
Asset:        [COIN-USD]
Granularity:  1-hour candles
Total candles: XXXX
Data quality: [Clean / Minor gaps noted / Significant issues]

PRICE CONTEXT
Open:   $X (period start)
Close:  $X (period end)
High:   $X (date)
Low:    $X (date)
Return: +/- X%

KEY LEVELS IDENTIFIED
Resistance: $X (X touches), $X (X touches)
Support:    $X (X touches), $X (X touches)
```

---

## Rules

1. Real data only — never substitute estimates or synthetic candles
2. Always note the data source and time range in output
3. Flag any data quality issues explicitly
4. Minimum 10-occurrence sample for any base rate claim
5. Never report a support/resistance level that isn't in the actual price data
