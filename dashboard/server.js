'use strict';

const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const { spawnSync } = require('child_process');

const PORT      = 4200;
const OC_HOME   = process.env.OPENCLAW_HOME || '/home/pgre/.openclaw';
const WORKSPACE = path.join(OC_HOME, 'workspace', 'agents');
const CRON_FILE = path.join(OC_HOME, 'cron', 'jobs.json');
const MEMORY_FILE = path.join(OC_HOME, 'workspace', 'MEMORY.md');
const DB_FILE   = path.join(OC_HOME, 'openclaw.db');
const STATIC    = path.join(__dirname, 'static');

const TRADERS = {
  max:  { name: 'Max',  emoji: '📈', strategy: 'The Sniper' },
  leo:  { name: 'Leo',  emoji: '↗️',  strategy: 'EMA Crossover' },
  zara: { name: 'Zara', emoji: '🔄', strategy: 'RSI Reversal' },
  kai:  { name: 'Kai',  emoji: '🎯', strategy: 'VWAP Reversion' },
};

// ── SQLite helper ─────────────────────────────────────────────────────────────

function dbQuery(sql) {
  if (!fs.existsSync(DB_FILE)) return [];
  const res = spawnSync('sqlite3', ['-json', DB_FILE, sql], { timeout: 5000 });
  if (res.status !== 0 || !res.stdout) return [];
  try {
    const text = res.stdout.toString().trim();
    return text ? JSON.parse(text) : [];
  } catch { return []; }
}

// ── Parsers ───────────────────────────────────────────────────────────────────

function parseTradeState(traderId) {
  const filePath = path.join(WORKSPACE, traderId, 'TRADE_STATE.md');
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines   = content.split('\n');

  const data = {
    id: traderId,
    ...TRADERS[traderId],
    bankroll: 0,
    unrealized_pnl: 0,
    realized_pnl: 0,
    total_pnl: 0,
    win_rate: null,
    total_trades: 0,
    positions: [],
    position_count: 0,
    last_updated: null,
    paused: false,
    close_all: false,
    mode: 'paper',
    platform: 'Coinbase',
  };

  let inPositions = false;
  let currentPos  = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith('Mode:')) {
      data.mode = line.slice(5).trim();
    } else if (line.startsWith('Platform:')) {
      data.platform = line.slice(9).trim();
    } else if (line.startsWith('Bankroll:') || line.startsWith('Cash:')) {
      data.bankroll = parseFloat(line.split(':')[1].trim().replace(/[$,]/g, '')) || 0;
    } else if (line.startsWith('Unrealized P')) {
      data.unrealized_pnl = parseFloat(line.split(':')[1]?.trim().replace(/[$,]/g, '') || '0') || 0;
    } else if (line.startsWith('Realized P')) {
      data.realized_pnl = parseFloat(line.split(':')[1]?.trim().replace(/[$,]/g, '') || '0') || 0;
    } else if (line.startsWith('Win Rate:')) {
      const v = line.split(':')[1]?.trim().replace(/%|—/g, '').trim();
      data.win_rate = v ? parseFloat(v) : null;
    } else if (line.startsWith('Total Trades:')) {
      const v = line.split(':')[1]?.trim().replace(/—/g, '').trim();
      data.total_trades = v ? parseInt(v, 10) : 0;
    } else if (line.startsWith('Last Updated:')) {
      data.last_updated = line.slice(13).trim();
    } else if (line.startsWith('Paused:')) {
      data.paused = line.slice(7).trim().toLowerCase() === 'true';
    } else if (line.startsWith('CloseAll:')) {
      data.close_all = line.slice(9).trim().toLowerCase() === 'true';
    } else if (line.startsWith('Open Positions:')) {
      const rest = line.slice(15).trim().toLowerCase();
      inPositions = rest !== 'none.' && rest !== 'none' && rest !== '';
    } else if (inPositions && line.startsWith('- ')) {
      if (currentPos) data.positions.push(currentPos);
      currentPos = { label: line.slice(2).trim() };
    } else if (inPositions && currentPos && line.includes(':')) {
      const [k, ...v] = line.split(':');
      currentPos[k.trim()] = v.join(':').trim();
    }
  }
  if (currentPos && inPositions) data.positions.push(currentPos);

  data.position_count = data.positions.length;
  data.total_pnl = +(data.unrealized_pnl + data.realized_pnl).toFixed(2);

  // Enrich from SQLite if available
  const dbPnl = dbQuery(`SELECT total_pnl, wins, losses, win_rate_pct FROM trader_pnl WHERE trader='${traderId}'`);
  if (dbPnl.length > 0) {
    data.db_total_pnl  = dbPnl[0].total_pnl;
    data.db_wins       = dbPnl[0].wins;
    data.db_losses     = dbPnl[0].losses;
    data.db_win_rate   = dbPnl[0].win_rate_pct;
    data.db_total_trades = (dbPnl[0].wins || 0) + (dbPnl[0].losses || 0);
  }

  return data;
}

function parseTradeLog(traderId) {
  const filePath = path.join(WORKSPACE, traderId, 'TRADE_LOG.md');
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, 'utf8');
  const trades  = [];

  const tradeBlocks = content.split(/^## Trade #\d+/m).slice(1);
  for (const block of tradeBlocks) {
    const entryMatch = block.match(/### Entry\n([\s\S]*?)(?=### Exit|$)/);
    const exitMatch  = block.match(/### Exit\n([\s\S]*?)(?=$)/);

    const trade = { trader: TRADERS[traderId]?.name || traderId };

    const parseSection = (text) => {
      if (!text) return;
      for (const raw of text.split('\n')) {
        const line = raw.trim();
        if (line.startsWith('- ') && line.includes(':')) {
          const ci = line.indexOf(':');
          trade[line.slice(2, ci).trim()] = line.slice(ci + 1).trim();
        }
      }
    };

    parseSection(entryMatch?.[1]);
    parseSection(exitMatch?.[1]);

    if (trade['Timestamp (UTC)'] || trade['Date Opened']) {
      trade._hasExit = !!exitMatch;
      trades.push(trade);
    }
  }

  return trades;
}

function getDylonStatus() {
  // Primary: read from Dylon's workspace RISK_STATE.md (written by oc-db)
  const riskFile = path.join(WORKSPACE, 'dylon', 'RISK_STATE.md');
  if (fs.existsSync(riskFile)) {
    try {
      const content = fs.readFileSync(riskFile, 'utf8');
      const match   = content.match(/^Light:\s*(Green|Yellow|Red)/im);
      if (match) return match[1];
    } catch {}
  }

  // Fallback: query SQLite for open risk events
  const rows = dbQuery("SELECT light FROM risk_events WHERE resolved=0 ORDER BY created_at DESC LIMIT 10");
  if (rows.length === 0) return 'Green';
  const lights = rows.map(r => r.light?.toLowerCase());
  if (lights.includes('red'))    return 'Red';
  if (lights.includes('yellow')) return 'Yellow';
  return 'Green';
}

function getDylonDetails() {
  // Per-trader lights from RISK_STATE.md
  const riskFile = path.join(WORKSPACE, 'dylon', 'RISK_STATE.md');
  const details  = { max: 'Green', leo: 'Green', zara: 'Green', kai: 'Green', overall: 'Green' };

  if (fs.existsSync(riskFile)) {
    try {
      const content = fs.readFileSync(riskFile, 'utf8');
      for (const trader of Object.keys(TRADERS)) {
        const re = new RegExp(`^${trader}:\\s*(Green|Yellow|Red)`, 'im');
        const m  = content.match(re);
        if (m) details[trader] = m[1];
      }
      const overall = content.match(/^Light:\\s*(Green|Yellow|Red)/im);
      if (overall) details.overall = overall[1];
    } catch {}
  }

  // Enrich with open event counts from SQLite
  const open = dbQuery("SELECT trader, light, violation FROM open_risk");
  for (const row of open) {
    if (TRADERS[row.trader]) {
      const current = details[row.trader]?.toLowerCase();
      const incoming = row.light?.toLowerCase();
      const rank = { green: 0, yellow: 1, red: 2 };
      if ((rank[incoming] || 0) > (rank[current] || 0)) {
        details[row.trader] = row.light.charAt(0).toUpperCase() + row.light.slice(1);
      }
    }
  }

  return details;
}

function readMemory() {
  if (!fs.existsSync(MEMORY_FILE)) return null;
  try { return fs.readFileSync(MEMORY_FILE, 'utf8'); } catch { return null; }
}

// ── State writer ──────────────────────────────────────────────────────────────

function setTradeStateField(traderId, field, value) {
  const filePath = path.join(WORKSPACE, traderId, 'TRADE_STATE.md');
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, 'utf8');
  const re     = new RegExp(`^${field}:.*$`, 'm');
  const newLine = `${field}: ${value}`;

  content = re.test(content) ? content.replace(re, newLine) : content.trimEnd() + '\n' + newLine + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

// ── API handlers ──────────────────────────────────────────────────────────────

function handleStatus(res) {
  const traders = Object.keys(TRADERS).map(id => parseTradeState(id)).filter(Boolean);
  const dyDetails = getDylonDetails();
  const summary = {
    total_bankroll:  +traders.reduce((s, t) => s + t.bankroll, 0).toFixed(2),
    total_pnl:       +traders.reduce((s, t) => s + t.total_pnl, 0).toFixed(2),
    total_positions: traders.reduce((s, t) => s + t.position_count, 0),
    dylon_status:    dyDetails.overall,
    dylon_details:   dyDetails,
  };
  sendJson(res, { traders, summary, updated_at: new Date().toISOString() });
}

function handleTrades(res) {
  // Try SQLite first (richer data)
  const dbTrades = dbQuery(
    "SELECT id,trader,pair,side,size_usd,entry_price,exit_price,pnl,pnl_pct,strategy,status,aria_signal,reed_signal,sage_signal,rationale,opened_at,closed_at FROM trades ORDER BY opened_at DESC LIMIT 50"
  );
  if (dbTrades.length > 0) {
    sendJson(res, dbTrades);
    return;
  }

  // Fall back to parsing TRADE_LOG.md files
  const all = Object.keys(TRADERS).flatMap(id => parseTradeLog(id));
  all.sort((a, b) => {
    const ta = a['Timestamp (UTC)'] || a['Date Opened'] || '';
    const tb = b['Timestamp (UTC)'] || b['Date Opened'] || '';
    return tb.localeCompare(ta);
  });
  sendJson(res, all.slice(0, 50));
}

function handleHistory(res, query) {
  const params  = new URLSearchParams(query || '');
  const trader  = params.get('trader');
  const days    = parseInt(params.get('days') || '30', 10);

  let sql = `
    SELECT trader, DATE(recorded_at) AS day,
           AVG(balance) AS avg_balance, MAX(balance) AS peak, MIN(balance) AS low
    FROM bankroll_snapshots
    WHERE recorded_at >= DATE('now', '-${days} days')
  `;
  if (trader && TRADERS[trader]) sql += ` AND trader='${trader}'`;
  sql += ` GROUP BY trader, DATE(recorded_at) ORDER BY trader, day`;

  const rows = dbQuery(sql);
  sendJson(res, rows);
}

function handleRisk(res) {
  const events  = dbQuery("SELECT * FROM open_risk ORDER BY created_at DESC");
  const details = getDylonDetails();
  sendJson(res, { overall: details.overall, traders: details, open_events: events });
}

function handleCrons(res) {
  if (!fs.existsSync(CRON_FILE)) { sendJson(res, []); return; }
  try {
    const data = JSON.parse(fs.readFileSync(CRON_FILE, 'utf8'));
    const now  = Date.now();
    const jobs = (data.jobs || []).map(j => ({
      id:               j.id,
      name:             j.name,
      description:      j.description || '',
      enabled:          !!j.enabled,
      scheduleKind:     j.schedule?.kind || '',
      cronExpr:         j.schedule?.expr || '',
      everyMs:          j.schedule?.everyMs || null,
      tz:               j.schedule?.tz || '',
      model:            j.payload?.model || '',
      lastStatus:       j.state?.lastStatus || null,
      lastRunAtMs:      j.state?.lastRunAtMs || null,
      lastDurationMs:   j.state?.lastDurationMs || null,
      lastError:        j.state?.lastError || null,
      nextRunAtMs:      j.state?.nextRunAtMs || null,
      consecutiveErrors: j.state?.consecutiveErrors || 0,
      msUntilNext:      j.state?.nextRunAtMs ? Math.max(0, j.state.nextRunAtMs - now) : null,
    }));
    sendJson(res, jobs);
  } catch (e) {
    sendJson(res, { error: e.message }, 500);
  }
}

function handleMemory(res) {
  const content = readMemory();
  sendJson(res, { content, exists: content !== null });
}

function handlePause(res, traderId, paused) {
  if (!TRADERS[traderId]) { sendJson(res, { error: 'unknown trader' }, 404); return; }
  setTradeStateField(traderId, 'Paused', paused ? 'true' : 'false');
  sendJson(res, { ok: true, trader: traderId, paused });
}

function handleCloseAll(res, traderId) {
  if (!TRADERS[traderId]) { sendJson(res, { error: 'unknown trader' }, 404); return; }
  setTradeStateField(traderId, 'CloseAll', 'true');
  setTradeStateField(traderId, 'Paused', 'true');
  sendJson(res, { ok: true, trader: traderId, close_all: true });
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────

function sendJson(res, data, status = 200) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
  });
  res.end(body);
}

function serveFile(res, filePath) {
  const types = { '.html': 'text/html', '.json': 'application/json', '.css': 'text/css', '.js': 'application/javascript' };
  const mime  = types[path.extname(filePath)] || 'text/plain';
  if (!fs.existsSync(filePath)) { res.writeHead(404); res.end('Not found'); return; }
  res.writeHead(200, { 'Content-Type': mime });
  res.end(fs.readFileSync(filePath));
}

// ── Router ────────────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const [urlPath, query] = req.url.split('?');

  if (req.method === 'POST') {
    let m;
    if ((m = urlPath.match(/^\/api\/trader\/(\w+)\/pause$/)))     handlePause(res, m[1], true);
    else if ((m = urlPath.match(/^\/api\/trader\/(\w+)\/resume$/))) handlePause(res, m[1], false);
    else if ((m = urlPath.match(/^\/api\/trader\/(\w+)\/close-all$/))) handleCloseAll(res, m[1]);
    else { res.writeHead(404); res.end(); }
    return;
  }

  if (urlPath === '/api/status')       handleStatus(res);
  else if (urlPath === '/api/trades')  handleTrades(res);
  else if (urlPath === '/api/history') handleHistory(res, query);
  else if (urlPath === '/api/risk')    handleRisk(res);
  else if (urlPath === '/api/crons')   handleCrons(res);
  else if (urlPath === '/api/memory')  handleMemory(res);
  else if (urlPath === '/' || urlPath === '/index.html') serveFile(res, path.join(STATIC, 'index.html'));
  else if (urlPath === '/manifest.json')                 serveFile(res, path.join(STATIC, 'manifest.json'));
  else { res.writeHead(404); res.end('Not found'); }
});

server.listen(PORT, '0.0.0.0', () => {
  const { execSync } = require('child_process');
  let tsIp = null;
  try { tsIp = execSync('tailscale ip -4 2>/dev/null', { timeout: 2000 }).toString().trim(); } catch {}

  console.log(`\n⚡ OpenClaw Dashboard running`);
  console.log(`   Local:     http://localhost:${PORT}`);
  if (tsIp) console.log(`   Tailscale: http://${tsIp}:${PORT}`);
  console.log(`\n   OPENCLAW_HOME: ${OC_HOME}`);
  console.log(`   DB:            ${DB_FILE}`);
  console.log(`   On Android: open URL in Chrome → Menu → Add to Home Screen\n`);
});
