const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4200;
const WORKSPACE = '/home/pgre/.openclaw/workspace/agents';
const STATIC = path.join(__dirname, 'static');

const TRADERS = {
  max:  { name: 'Max',  emoji: '📈', strategy: 'The Sniper' },
  leo:  { name: 'Leo',  emoji: '↗️',  strategy: 'EMA Crossover' },
  zara: { name: 'Zara', emoji: '🔄', strategy: 'RSI Reversal' },
  kai:  { name: 'Kai',  emoji: '🎯', strategy: 'VWAP Reversion' },
};

// --- Parsers ---

function parseTradeState(traderId) {
  const filePath = path.join(WORKSPACE, traderId, 'TRADE_STATE.md');
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const data = {
    id: traderId,
    ...TRADERS[traderId],
    bankroll: 0,
    unrealized_pnl: 0,
    realized_pnl: 0,
    total_pnl: 0,
    win_rate: null,
    positions: [],
    position_count: 0,
    last_updated: null,
    paused: false,
    close_all: false,
    mode: 'paper',
    platform: 'Coinbase',
  };

  let inPositions = false;
  let currentPos = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith('Mode:')) {
      data.mode = line.slice(5).trim();
    } else if (line.startsWith('Platform:')) {
      data.platform = line.slice(9).trim();
    } else if (line.startsWith('Bankroll:') || line.startsWith('Cash:')) {
      const val = line.split(':')[1].trim().replace(/[$,]/g, '');
      data.bankroll = parseFloat(val) || 0;
    } else if (line.startsWith('Open Positions:')) {
      const rest = line.slice(15).trim().toLowerCase();
      inPositions = rest !== 'none' && rest !== '';
      if (rest && rest !== 'none') inPositions = true;
    } else if (line.startsWith('Unrealized P')) {
      const val = line.split(':')[1]?.trim().replace(/[$,]/g, '') || '0';
      data.unrealized_pnl = parseFloat(val) || 0;
    } else if (line.startsWith('Realized P')) {
      const val = line.split(':')[1]?.trim().replace(/[$,]/g, '') || '0';
      data.realized_pnl = parseFloat(val) || 0;
    } else if (line.startsWith('Win Rate:')) {
      const val = line.split(':')[1]?.trim().replace(/%|—/g, '').trim();
      data.win_rate = val ? parseFloat(val) : null;
    } else if (line.startsWith('Last Updated:')) {
      data.last_updated = line.slice(13).trim();
    } else if (line.startsWith('Paused:')) {
      data.paused = line.slice(7).trim().toLowerCase() === 'true';
    } else if (line.startsWith('CloseAll:')) {
      data.close_all = line.slice(9).trim().toLowerCase() === 'true';
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
  const trades = [];

  // Split into blocks by ## Entry or ## Exit
  const blocks = content.split(/^## (Entry|Exit)/m);
  for (let i = 1; i < blocks.length; i += 2) {
    const type = blocks[i].trim();
    const body = blocks[i + 1] || '';
    const trade = { type, trader: TRADERS[traderId]?.name || traderId };

    for (const raw of body.split('\n')) {
      const line = raw.trim();
      if (line.startsWith('- ') && line.includes(':')) {
        const colonIdx = line.indexOf(':');
        const key = line.slice(2, colonIdx).trim();
        const val = line.slice(colonIdx + 1).trim();
        trade[key] = val;
      }
    }

    // Only add if it has actual data (not just the template)
    if (trade['Timestamp (UTC)'] || trade['Date Opened']) {
      trades.push(trade);
    }
  }

  return trades;
}

function getDylonStatus() {
  const riskDir = '/home/pgre/obsidian/vault/trading/risk-log';
  if (!fs.existsSync(riskDir)) return 'Green';
  try {
    const files = fs.readdirSync(riskDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse();
    for (const f of files.slice(0, 1)) {
      const content = fs.readFileSync(path.join(riskDir, f), 'utf8');
      if (content.includes('Red')) return 'Red';
      if (content.includes('Yellow')) return 'Yellow';
    }
  } catch (e) {}
  return 'Green';
}

// --- State file writer ---

function setTradeStateField(traderId, field, value) {
  const filePath = path.join(WORKSPACE, traderId, 'TRADE_STATE.md');
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, 'utf8');
  const fieldLine = `${field}:`;
  const newLine = `${field}: ${value}`;
  const re = new RegExp(`^${field}:.*$`, 'm');

  if (re.test(content)) {
    content = content.replace(re, newLine);
  } else {
    content = content.trimEnd() + '\n' + newLine + '\n';
  }

  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

// --- API handlers ---

function handleStatus(res) {
  const traders = Object.keys(TRADERS).map(id => parseTradeState(id)).filter(Boolean);
  const summary = {
    total_bankroll: +traders.reduce((s, t) => s + t.bankroll, 0).toFixed(2),
    total_pnl: +traders.reduce((s, t) => s + t.total_pnl, 0).toFixed(2),
    total_positions: traders.reduce((s, t) => s + t.position_count, 0),
    dylon_status: getDylonStatus(),
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

// --- HTTP helpers ---

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
  const ext = path.extname(filePath);
  const types = { '.html': 'text/html', '.json': 'application/json', '.css': 'text/css', '.js': 'application/javascript' };
  const mime = types[ext] || 'text/plain';
  if (!fs.existsSync(filePath)) {
    res.writeHead(404); res.end('Not found'); return;
  }
  const content = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': mime });
  res.end(content);
}

// --- Router ---

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // POST endpoints
  if (req.method === 'POST') {
    let match;
    if ((match = url.match(/^\/api\/trader\/(\w+)\/pause$/))) {
      handlePause(res, match[1], true);
    } else if ((match = url.match(/^\/api\/trader\/(\w+)\/resume$/))) {
      handlePause(res, match[1], false);
    } else if ((match = url.match(/^\/api\/trader\/(\w+)\/close-all$/))) {
      handleCloseAll(res, match[1]);
    } else {
      res.writeHead(404); res.end();
    }
    return;
  }

  // GET endpoints
  if (url === '/api/status') {
    handleStatus(res);
  } else if (url === '/api/trades') {
    handleTrades(res);
  } else if (url === '/' || url === '/index.html') {
    serveFile(res, path.join(STATIC, 'index.html'));
  } else if (url === '/manifest.json') {
    serveFile(res, path.join(STATIC, 'manifest.json'));
  } else {
    res.writeHead(404); res.end('Not found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  // Get Tailscale IP if available
  const { execSync } = require('child_process');
  let tsIp = null;
  try { tsIp = execSync('tailscale ip -4 2>/dev/null', { timeout: 2000 }).toString().trim(); } catch {}

  console.log(`\n⚡ OpenClaw Dashboard running`);
  console.log(`   Local:     http://localhost:${PORT}`);
  if (tsIp) console.log(`   Tailscale: http://${tsIp}:${PORT}`);
  console.log(`\n   On Android: open URL in Chrome → Menu → Add to Home Screen\n`);
});
