'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT      = 4200;
const OC_HOME   = process.env.OPENCLAW_HOME || '/home/pgre/.openclaw';
const WORKSPACE = path.join(OC_HOME, 'workspace', 'agents');
const CRON_FILE = path.join(OC_HOME, 'cron', 'jobs.json');
const MEMORY_FILE = path.join(OC_HOME, 'workspace', 'MEMORY.md');
const STATIC    = path.join(__dirname, 'static');

const TRADERS = {
  max:  { name: 'Max',  emoji: '📈', strategy: 'The Sniper' },
  leo:  { name: 'Leo',  emoji: '↗️',  strategy: 'EMA Crossover' },
  zara: { name: 'Zara', emoji: '🔄', strategy: 'RSI Reversal' },
  kai:  { name: 'Kai',  emoji: '🎯', strategy: 'VWAP Reversion' },
};

// ── Parsers ──────────────────────────────────────────────────

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
  return data;
}

function parseTradeLog(traderId) {
  const filePath = path.join(WORKSPACE, traderId, 'TRADE_LOG.md');
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, 'utf8');
  const trades  = [];

  // Each trade block starts with ## Trade #N, contains ### Entry and ### Exit
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
  const riskDir = path.join(OC_HOME, '..', 'obsidian', 'vault', 'trading', 'risk-log');
  if (!fs.existsSync(riskDir)) return 'Green';
  try {
    const files = fs.readdirSync(riskDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse();
    for (const f of files.slice(0, 1)) {
      const content = fs.readFileSync(path.join(riskDir, f), 'utf8');
      if (/\bRed\b/.test(content))    return 'Red';
      if (/\bYellow\b/.test(content)) return 'Yellow';
    }
  } catch {}
  return 'Green';
}

function readMemory() {
  if (!fs.existsSync(MEMORY_FILE)) return null;
  try { return fs.readFileSync(MEMORY_FILE, 'utf8'); } catch { return null; }
}

// ── State writer ──────────────────────────────────────────────

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

// ── API handlers ──────────────────────────────────────────────

function handleStatus(res) {
  const traders = Object.keys(TRADERS).map(id => parseTradeState(id)).filter(Boolean);
  const summary = {
    total_bankroll:  +traders.reduce((s, t) => s + t.bankroll, 0).toFixed(2),
    total_pnl:       +traders.reduce((s, t) => s + t.total_pnl, 0).toFixed(2),
    total_positions: traders.reduce((s, t) => s + t.position_count, 0),
    dylon_status:    getDylonStatus(),
  };
  sendJson(res, { traders, summary, updated_at: new Date().toISOString() });
}

function handleTrades(res) {
  const all = Object.keys(TRADERS).flatMap(id => parseTradeLog(id));
  all.sort((a, b) => {
    const ta = a['Timestamp (UTC)'] || a['Date Opened'] || '';
    const tb = b['Timestamp (UTC)'] || b['Date Opened'] || '';
    return tb.localeCompare(ta);
  });
  sendJson(res, all.slice(0, 50));
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

// ── HTTP helpers ──────────────────────────────────────────────

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

// ── Router ────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (req.method === 'POST') {
    let m;
    if ((m = url.match(/^\/api\/trader\/(\w+)\/pause$/)))     handlePause(res, m[1], true);
    else if ((m = url.match(/^\/api\/trader\/(\w+)\/resume$/))) handlePause(res, m[1], false);
    else if ((m = url.match(/^\/api\/trader\/(\w+)\/close-all$/))) handleCloseAll(res, m[1]);
    else { res.writeHead(404); res.end(); }
    return;
  }

  if (url === '/api/status')   handleStatus(res);
  else if (url === '/api/trades')  handleTrades(res);
  else if (url === '/api/crons')   handleCrons(res);
  else if (url === '/api/memory')  handleMemory(res);
  else if (url === '/' || url === '/index.html') serveFile(res, path.join(STATIC, 'index.html'));
  else if (url === '/manifest.json')             serveFile(res, path.join(STATIC, 'manifest.json'));
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
  console.log(`   On Android: open URL in Chrome → Menu → Add to Home Screen\n`);
});
