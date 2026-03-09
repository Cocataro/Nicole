-- OpenClaw SQLite Schema
-- Replaces Obsidian for all historical logging, stats, and agent memory
-- Database lives at: $OPENCLAW_HOME/openclaw.db
-- Initialize with: sqlite3 openclaw.db < schema.sql

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ─────────────────────────────────────────────
-- TRADES
-- Complete trade ledger across all four traders
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS trades (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  trader        TEXT    NOT NULL,          -- max | leo | zara | kai
  pair          TEXT    NOT NULL,          -- BTC-USD | ETH-USD | SOL-USD etc.
  side          TEXT    NOT NULL,          -- buy | sell
  size_usd      REAL    NOT NULL,
  entry_price   REAL    NOT NULL,
  exit_price    REAL,
  stop_loss     REAL,
  take_profit   REAL,
  status        TEXT    NOT NULL DEFAULT 'open',  -- open | won | lost | cancelled
  strategy      TEXT,                      -- the-sniper | ema-crossover | rsi-reversal | vwap-reversion
  pnl           REAL,
  pnl_pct       REAL,
  aria_signal   TEXT,                      -- bullish | bearish | neutral
  reed_signal   TEXT,
  sage_signal   TEXT,
  rationale     TEXT,
  mode          TEXT    NOT NULL DEFAULT 'paper', -- paper | live
  opened_at     TEXT    NOT NULL,          -- ISO8601 UTC
  closed_at     TEXT,
  notes         TEXT
);

CREATE INDEX IF NOT EXISTS idx_trades_trader  ON trades(trader);
CREATE INDEX IF NOT EXISTS idx_trades_status  ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_opened  ON trades(opened_at);

-- ─────────────────────────────────────────────
-- BANKROLL SNAPSHOTS
-- Taken after every trade + daily at 8am
-- Used for P&L sparklines in the dashboard
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bankroll_snapshots (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  trader         TEXT    NOT NULL,
  balance        REAL    NOT NULL,
  unrealized_pnl REAL    NOT NULL DEFAULT 0,
  recorded_at    TEXT    NOT NULL           -- ISO8601 UTC
);

CREATE INDEX IF NOT EXISTS idx_snap_trader  ON bankroll_snapshots(trader);
CREATE INDEX IF NOT EXISTS idx_snap_time    ON bankroll_snapshots(recorded_at);

-- ─────────────────────────────────────────────
-- RISK EVENTS
-- Dylon's Yellow and Red flags
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS risk_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  trader      TEXT    NOT NULL,
  light       TEXT    NOT NULL,             -- yellow | red
  violation   TEXT    NOT NULL,
  resolved    INTEGER NOT NULL DEFAULT 0,   -- 0=open 1=resolved
  created_at  TEXT    NOT NULL,
  resolved_at TEXT,
  notes       TEXT
);

CREATE INDEX IF NOT EXISTS idx_risk_trader   ON risk_events(trader);
CREATE INDEX IF NOT EXISTS idx_risk_resolved ON risk_events(resolved);

-- ─────────────────────────────────────────────
-- AGENT NOTES
-- Replaces all Obsidian vault markdown files:
--   backtests, performance analysis, research briefs,
--   weekly reviews, strategy changes
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agent_notes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  agent      TEXT    NOT NULL,   -- aria | reed | sage | hana | dylon | nicole | max | leo | zara | kai
  category   TEXT    NOT NULL,   -- research | news | sentiment | backtest | prospector |
                                 -- performance | weekly-review | strategy-change | weekly-risk
  title      TEXT    NOT NULL,
  content    TEXT    NOT NULL,
  asset      TEXT,               -- BTC-USD | ETH-USD etc. if applicable
  trader     TEXT,               -- if note is trader-specific
  created_at TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notes_agent    ON agent_notes(agent);
CREATE INDEX IF NOT EXISTS idx_notes_category ON agent_notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_created  ON agent_notes(created_at);

-- ─────────────────────────────────────────────
-- AGENT MEMORY
-- Key-value persistent state per agent
-- Replaces MEMORY.md for structured data
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agent_memory (
  agent      TEXT NOT NULL,
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (agent, key)
);

-- ─────────────────────────────────────────────
-- WEEKLY SUMMARIES
-- Compiled by Dylon (risk) and Hana (performance)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS weekly_summaries (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  reporter           TEXT    NOT NULL,   -- dylon | hana
  trader             TEXT    NOT NULL,   -- max | leo | zara | kai | all
  week_ending        TEXT    NOT NULL,   -- YYYY-MM-DD
  report_type        TEXT    NOT NULL,   -- risk | performance | review
  content            TEXT    NOT NULL,
  starting_bankroll  REAL,
  ending_bankroll    REAL,
  pnl                REAL,
  win_count          INTEGER,
  loss_count         INTEGER,
  max_drawdown_pct   REAL,
  created_at         TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_weekly_reporter ON weekly_summaries(reporter);
CREATE INDEX IF NOT EXISTS idx_weekly_week     ON weekly_summaries(week_ending);

-- ─────────────────────────────────────────────
-- HEARTBEATS
-- Nicole's hourly check-in log
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS heartbeats (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  status      TEXT NOT NULL,   -- ok | action
  summary     TEXT,
  recorded_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hb_time ON heartbeats(recorded_at);

-- ─────────────────────────────────────────────
-- VIEWS — convenience for agents and dashboard
-- ─────────────────────────────────────────────

-- Current open trades
CREATE VIEW IF NOT EXISTS open_trades AS
  SELECT * FROM trades WHERE status = 'open' ORDER BY opened_at DESC;

-- Per-trader P&L summary
CREATE VIEW IF NOT EXISTS trader_pnl AS
  SELECT
    trader,
    COUNT(*)                                    AS total_trades,
    SUM(CASE WHEN status = 'won'  THEN 1 ELSE 0 END) AS wins,
    SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) AS losses,
    ROUND(SUM(CASE WHEN pnl IS NOT NULL THEN pnl ELSE 0 END), 2) AS total_pnl,
    ROUND(
      CAST(SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) AS REAL) /
      NULLIF(SUM(CASE WHEN status IN ('won','lost') THEN 1 ELSE 0 END), 0) * 100,
    1) AS win_rate_pct
  FROM trades
  GROUP BY trader;

-- Latest bankroll per trader
CREATE VIEW IF NOT EXISTS latest_bankroll AS
  SELECT trader, balance, unrealized_pnl, recorded_at
  FROM bankroll_snapshots
  WHERE id IN (
    SELECT MAX(id) FROM bankroll_snapshots GROUP BY trader
  );

-- Open risk events
CREATE VIEW IF NOT EXISTS open_risk AS
  SELECT * FROM risk_events WHERE resolved = 0 ORDER BY created_at DESC;

-- Daily bankroll history (last 30 days) for sparklines
CREATE VIEW IF NOT EXISTS daily_bankroll AS
  SELECT
    trader,
    DATE(recorded_at) AS day,
    AVG(balance)      AS avg_balance,
    MAX(balance)      AS peak,
    MIN(balance)      AS low
  FROM bankroll_snapshots
  WHERE recorded_at >= DATE('now', '-30 days')
  GROUP BY trader, DATE(recorded_at)
  ORDER BY trader, day;
