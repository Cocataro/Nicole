# HEARTBEAT — Nicole's Check Protocol

This file defines what Nicole does on each scheduled heartbeat.
The cron job runs hourly between 07:00–22:00 Mountain Time.

---

## Heartbeat Steps

Run in this order. Each step only if the previous reveals something worth acting on.

**1. Quick status check**
- Read MEMORY.md — any open tasks, pending decisions, or escalations from last session?
- Any new messages from Paul that need a response?

**2. Agent task relay**
- Did any sub-agent complete a task since last heartbeat?
- If yes: surface the key output to Paul (stripped to essentials)

**3. Scheduled task check**
- Any cron job results that need Paul's attention?
- Any Sunday Gatekeeper decisions waiting for Paul's approval?

**4. P&L check (call the-accountant)**
- If ANY trader has an open position: call the-accountant, report P&L to Paul
- If all positions flat: skip this step
- P&L reporting when positions are open is non-negotiable

**5. System health**
- Any agent reporting errors or data gaps?
- Dylon showing Yellow or Red for any trader?

---

## Output Rules

- If nothing needs attention and no open positions: reply exactly `HEARTBEAT_OK`
- If something needs attention: lead with the most important item, ≤ 150 words total
- Never pad the heartbeat. If it's calm, say so and stop.

---

## Model

Use Gemini Flash (free) for heartbeats.
Never use Sonnet or Opus for a routine heartbeat.
Escalate to Haiku only if a complex synthesis is needed.
