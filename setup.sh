#!/usr/bin/env bash
# OpenClaw Setup Script
# Run once after cloning. Sets up workspace, SQLite database, and oc-db CLI.
# Usage: ./setup.sh [--openclaw-home /path/to/.openclaw]

set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
OPENCLAW_HOME="${OPENCLAW_HOME:-$HOME/.openclaw}"
DB_PATH="$OPENCLAW_HOME/openclaw.db"

# Parse flags
while [[ $# -gt 0 ]]; do
  case $1 in
    --openclaw-home) OPENCLAW_HOME="$2"; DB_PATH="$OPENCLAW_HOME/openclaw.db"; shift 2 ;;
    *) echo "Unknown argument: $1"; exit 1 ;;
  esac
done

# ── Colors ────────────────────────────────────────────────────────────────────

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "  ${GREEN}✓${NC}  $*"; }
note() { echo -e "  ${YELLOW}→${NC}  $*"; }

echo ""
echo "  OpenClaw Setup"
echo "  OPENCLAW_HOME: $OPENCLAW_HOME"
echo ""

# ── Preflight ────────────────────────────────────────────────────────────────

missing=()
command -v python3  &>/dev/null || missing+=("python3")
command -v sqlite3  &>/dev/null || missing+=("sqlite3")

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "Error: missing required tools: ${missing[*]}"
  echo "Install them and re-run setup."
  exit 1
fi
ok "python3 and sqlite3 found"

# ── Workspace directories ─────────────────────────────────────────────────────

WORKSPACE="$OPENCLAW_HOME/workspace"

dirs=(
  "$WORKSPACE/agents/nicole"
  "$WORKSPACE/agents/max"
  "$WORKSPACE/agents/leo"
  "$WORKSPACE/agents/zara"
  "$WORKSPACE/agents/kai"
  "$WORKSPACE/agents/aria"
  "$WORKSPACE/agents/reed"
  "$WORKSPACE/agents/sage"
  "$WORKSPACE/agents/dylon"
  "$WORKSPACE/agents/hana"
  "$WORKSPACE/skills/the-sniper"
  "$WORKSPACE/skills/ema-crossover"
  "$WORKSPACE/skills/rsi-reversal"
  "$WORKSPACE/skills/vwap-reversion"
  "$WORKSPACE/skills/the-accountant"
  "$WORKSPACE/skills/the-commander"
  "$WORKSPACE/skills/the-comparator"
  "$WORKSPACE/skills/the-gatekeeper"
  "$WORKSPACE/skills/the-historian"
  "$WORKSPACE/skills/the-prospector"
  "$WORKSPACE/skills/the-researcher"
)

for d in "${dirs[@]}"; do
  mkdir -p "$d"
done
ok "Workspace directories created"

# ── Agent SOUL + TOOLS files ──────────────────────────────────────────────────

agents=(nicole main aria reed sage max leo zara kai dylon hana)
# agent name → repo folder name
declare -A agent_folder=(
  [nicole]="main" [main]="main"
  [aria]="aria" [reed]="reed" [sage]="sage"
  [max]="max" [leo]="leo" [zara]="zara" [kai]="kai"
  [dylon]="dylon" [hana]="hana"
)
declare -A agent_ws=(
  [nicole]="nicole" [main]="nicole"
  [aria]="aria" [reed]="reed" [sage]="sage"
  [max]="max" [leo]="leo" [zara]="zara" [kai]="kai"
  [dylon]="dylon" [hana]="hana"
)

for agent in aria reed sage max leo zara kai dylon hana; do
  folder="${agent_folder[$agent]}"
  ws="${agent_ws[$agent]}"
  src="$REPO_DIR/agents/$folder/agent"
  dst="$WORKSPACE/agents/$ws"
  for f in SOUL.md TOOLS.md; do
    if [[ -f "$src/$f" && ! -f "$dst/$f" ]]; then
      cp "$src/$f" "$dst/$f"
    fi
  done
done

# Nicole (main) soul → nicole workspace
src="$REPO_DIR/agents/main/agent"
for f in SOUL.md TOOLS.md; do
  [[ -f "$src/$f" && ! -f "$WORKSPACE/agents/nicole/$f" ]] && cp "$src/$f" "$WORKSPACE/agents/nicole/$f"
done
ok "Agent SOUL and TOOLS files installed"

# ── Templates ─────────────────────────────────────────────────────────────────

# Global templates
[[ -f "$REPO_DIR/templates/MEMORY.md"    && ! -f "$WORKSPACE/MEMORY.md"    ]] && cp "$REPO_DIR/templates/MEMORY.md"    "$WORKSPACE/MEMORY.md"
[[ -f "$REPO_DIR/templates/HEARTBEAT.md" && ! -f "$WORKSPACE/HEARTBEAT.md" ]] && cp "$REPO_DIR/templates/HEARTBEAT.md" "$WORKSPACE/HEARTBEAT.md"

# Per-agent templates
for agent in max leo zara kai dylon; do
  src_dir="$REPO_DIR/templates/agents/$agent"
  dst_dir="$WORKSPACE/agents/$agent"
  if [[ -d "$src_dir" ]]; then
    for f in "$src_dir"/*.md; do
      fname="$(basename "$f")"
      [[ ! -f "$dst_dir/$fname" ]] && cp "$f" "$dst_dir/$fname"
    done
  fi
done
ok "Templates installed"

# ── Skills ────────────────────────────────────────────────────────────────────

skills=(the-sniper ema-crossover rsi-reversal vwap-reversion \
        the-accountant the-commander the-comparator \
        the-gatekeeper the-historian the-prospector the-researcher)

for skill in "${skills[@]}"; do
  src="$REPO_DIR/skills/$skill/SKILL.md"
  dst="$WORKSPACE/skills/$skill/SKILL.md"
  [[ -f "$src" && ! -f "$dst" ]] && cp "$src" "$dst"
done
ok "Skills installed"

# ── SQLite database ───────────────────────────────────────────────────────────

if [[ ! -f "$DB_PATH" ]]; then
  sqlite3 "$DB_PATH" < "$REPO_DIR/db/schema.sql"
  ok "SQLite database created: $DB_PATH"
else
  # Apply schema to existing DB (idempotent due to IF NOT EXISTS)
  sqlite3 "$DB_PATH" < "$REPO_DIR/db/schema.sql"
  ok "SQLite database already exists — schema verified"
fi

# ── oc-db CLI ─────────────────────────────────────────────────────────────────

OC_DB="$REPO_DIR/db/oc-db"
chmod +x "$OC_DB"

installed=false
# Try ~/.local/bin first (no sudo needed)
LOCAL_BIN="$HOME/.local/bin"
if [[ -d "$LOCAL_BIN" ]] || mkdir -p "$LOCAL_BIN" 2>/dev/null; then
  ln -sf "$OC_DB" "$LOCAL_BIN/oc-db" && installed=true
fi

# Fall back to /usr/local/bin if we have write access
if [[ "$installed" == false ]] && [[ -w /usr/local/bin ]]; then
  ln -sf "$OC_DB" /usr/local/bin/oc-db && installed=true
fi

if [[ "$installed" == true ]]; then
  ok "oc-db linked to PATH"
else
  note "Add $REPO_DIR/db to your PATH to use oc-db globally:"
  note "  echo 'export PATH=\"$REPO_DIR/db:\$PATH\"' >> ~/.bashrc"
fi

# ── Initial bankroll snapshots ────────────────────────────────────────────────

# Seed starting bankroll for all four traders if DB is freshly created
SNAP_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM bankroll_snapshots;")
if [[ "$SNAP_COUNT" == "0" ]]; then
  for trader in max leo zara kai; do
    OPENCLAW_HOME="$OPENCLAW_HOME" python3 "$OC_DB" snap --trader "$trader" --balance 50.00 2>/dev/null || true
  done
  ok "Starting bankroll seeded (\$50 per trader)"
fi

# ── Cron import ───────────────────────────────────────────────────────────────

if command -v openclaw &>/dev/null; then
  if openclaw cron import "$REPO_DIR/cron/jobs.json" 2>/dev/null; then
    ok "Cron jobs imported"
  else
    note "Cron import failed — import manually: openclaw cron import $REPO_DIR/cron/jobs.json"
  fi
else
  note "openclaw not in PATH — import cron jobs manually when ready:"
  note "  openclaw cron import $REPO_DIR/cron/jobs.json"
fi

# ── .env check ────────────────────────────────────────────────────────────────

SECRETS="$OPENCLAW_HOME/secrets.env"
if [[ ! -f "$SECRETS" ]]; then
  note "No secrets.env found. Copy and fill in API keys before going live:"
  note "  cp $REPO_DIR/.env.example $SECRETS"
fi

# ── Summary ───────────────────────────────────────────────────────────────────

echo ""
echo "  Setup complete."
echo ""
echo "  Database:    $DB_PATH"
echo "  Workspace:   $WORKSPACE"
echo "  Dashboard:   cd dashboard && node server.js"
echo "  Test oc-db:  oc-db pnl"
echo ""
