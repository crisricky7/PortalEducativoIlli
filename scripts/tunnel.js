/* ==========================================================================
   Portal Ilinizas — Mantenedor del túnel público (localtunnel)
   Mantiene un túnel localtunnel activo hacia el puerto local, reiniciándolo
   automáticamente si se cae. Imprime la URL pública cuando cambia.
   Uso: node scripts/tunnel.js
   ========================================================================== */
const { spawn } = require('child_process');
const https = require('https');

const PORT = process.env.TUNNEL_PORT || 9123;
let child = null;
let currentUrl = null;
let restarting = false;

function log(msg) {
  console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
}

function verifyUrl(url, callback) {
  const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    res.resume();
    res.on('end', () => callback(res.statusCode === 200));
  });
  req.on('error', () => callback(false));
  req.setTimeout(8000, () => { req.destroy(); callback(false); });
}

function startTunnel() {
  log(`Iniciando localtunnel hacia puerto ${PORT}...`);
  child = spawn('npx', ['--yes', 'localtunnel', '--port', String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let buffer = '';
  child.stdout.on('data', (chunk) => {
    buffer += chunk.toString();
    const m = buffer.match(/your url is: (https:\/\/[^\s]+)/);
    if (m && m[1] !== currentUrl) {
      currentUrl = m[1];
      log(`🟢 URL pública: ${currentUrl}`);
      // Confirmar que responde
      verifyUrl(currentUrl, (ok) => {
        log(ok ? `✅ Túnel verificado (HTTP 200)` : `⚠️ URL asignada pero no responde aún`);
      });
    }
  });

  child.stderr.on('data', (chunk) => {
    const s = chunk.toString();
    if (/error|failed|ECONNREFUSED/i.test(s)) log(`⚠️ stderr: ${s.trim().slice(0, 160)}`);
  });

  child.on('exit', (code) => {
    log(`Túnel terminó (código ${code}). Reiniciando en 5s...`);
    child = null;
    currentUrl = null;
    if (!restarting) {
      restarting = true;
      setTimeout(() => { restarting = false; startTunnel(); }, 5000);
    }
  });
}

process.on('SIGINT', () => {
  log('Deteniendo...');
  if (child) child.kill();
  process.exit(0);
});

startTunnel();
