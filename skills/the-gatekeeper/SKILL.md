# THE GATEKEEPER — Watchlist Promotion Protocol

## Purpose

The Gatekeeper is Nicole's decision framework for managing what coins get
promoted from Pending to Active across all four trader watchlists.

It runs every Sunday after Hana's Prospector scan and Dylon's risk summary are complete.
Promotions are reviewed — not automatic. Paul approves Tier 2 promotions.
Tier 1 coins Nicole can approve without Paul if conditions are met.

---

## Execution Order

Run in this order every Sunday:

1. Read Hana's Prospector report from the database:
   `oc-db note list --agent hana --cat prospector --limit 1` → then `oc-db note get --id <ID>`
2. Read Dylon's weekly risk summary from the database:
   `oc-db summary list --reporter dylon --limit 1` → then `oc-db summary get --id <ID>`
3. Read all four trader WATCHLIST.md files — identify Pending section contents
4. Run the Gatekeeper evaluation (steps below)
5. Compile the Sunday briefing for Paul
6. Wait for Paul's response before executing any watchlist changes

---

## Step 1: Evaluate All Pending Coins

For each coin in Pending across all four watchlists:

**Promotion criteria:**

| Tier | Criteria | Action |
|---|---|---|
| Tier 1 | Score ≥ 1.5, Sharpe ≥ 0.8, Win% ≥ 55%, Drawdown < 15% | Recommend auto-promote |
| Tier 2 | Score ≥ 1.0, Sharpe ≥ 0.5 | Flag for Paul approval |
| Stale | Added more than 28 days ago and not promoted | Expire and remove |

**Additional checks before recommending promotion:**
- [ ] Current market conditions still match the backtest period character
- [ ] No major negative news about the coin in the last 7 days (check Reed)
- [ ] The assigned trader's total coin count would not exceed reasonable limits
- [ ] The assigned trader's bankroll is sufficient for another position
- [ ] Dylon's risk summary shows Green or Yellow (never promote into Red)

If Dylon's weekly summary shows Red for the assigned trader: hold all promotions for that trader.

---

## Step 2: Evaluate Active Coins for Demotion

For each coin in Active (Section A) across all four watchlists:

**Demotion triggers:**

| Trigger | Action |
|---|---|
| Coin has produced 3+ consecutive losing trades | Flag for review |
| Coin's realized P&L is negative after 10+ trades | Flag for review |
| Hana's performance analysis shows strategy is degrading | Flag for review |
| Coin has had no valid setup in 30+ days | Flag as inactive |

Nicole decides whether to demote — she does not auto-demote.
Paul approves demotions on request.

---

## Step 3: Compile the Sunday Briefing

Structure for Paul:

```
SUNDAY BRIEFING — YYYY-MM-DD

RISK STATUS
[Dylon's light: Green / Yellow / Red]
[One sentence — overall risk health going into the week]

COIN SCAN RESULTS
Hana scanned X coins this week.
Tier 1 candidates (auto-promote eligible): X coins
Tier 2 candidates (need your approval): X coins

PROMOTION RECOMMENDATIONS

Auto-promote (Tier 1):
• [COIN-USD] → [Trader] (Score X.XX, Sharpe X.XX, Win% XX%)
  [One sentence on why this coin looks good]

Needs approval (Tier 2):
• [COIN-USD] → [Trader] (Score X.XX, Sharpe X.XX, Win% XX%)
  [One sentence on the case for and any concerns]

Expiring (stale, no action needed):
• [COIN-USD] — added [date], removing from Pending

DEMOTION FLAGS (if any)
• [COIN-USD] on [Trader]'s list: [reason]
  [Recommendation: demote / continue monitoring]

PENDING YOUR APPROVAL
[List coins that need Paul's sign-off before Nicole acts]
```

---

## Step 4: Execute After Paul Responds

**On Paul's approval:**
- Move approved Tier 1 and Tier 2 coins from Pending to Active in the relevant WATCHLIST.md
- Remove expired entries from Pending
- Execute any approved demotions (move from Active to removed, note reason)
- Confirm to Paul: "Done — [X] coins promoted, [X] expired, [X] demoted"

**On Paul's rejection:**
- Keep coin in Pending with a note: "Held — Paul [date]"
- Try again on next week's Sunday scan

**WATCHLIST.md Active section format:**
```
## Section A — Active (Authorized for Trading)

| Coin | Strategy | Promoted | Score | Notes |
|---|---|---|---|---|
| SOL-USD | The Sniper | 2026-02-23 | 1.82 | Strong momentum setup |
```

---

## Rules

1. Never promote a coin to Active without Paul's approval (Tier 2) or explicit criteria met (Tier 1)
2. Never promote into a Red risk environment for the assigned trader
3. Never promote BTC-USD or ETH-USD through the Gatekeeper — Max always has those
4. Remove stale Pending entries automatically (no approval needed for expiry)
5. All changes are logged — what was promoted, what was expired, what was demoted, and why
6. The Gatekeeper runs after Hana and Dylon complete their reports — never before

---

## Logging

Log every Gatekeeper decision to the database:
```
oc-db note --agent nicole --cat strategy-change \
  --title "Gatekeeper YYYY-MM-DD" \
  --content "Reviewed: X coins. Promoted: [list]. Expired: [list]. Held: [list]. Paul input: [notes]."
```
