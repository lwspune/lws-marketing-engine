// Minimal headless-Edge driver over the Chrome DevTools Protocol (Node's built-in fetch + WebSocket).
// No npm packages. Every tool in this folder opens a reel page through openPage().
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
export const fileUrl = p => pathToFileURL(resolve(p)).href;

// A killed or crashed run never reaches close(), so its profile stays behind (124 of them filled the disk on
// 2026-10-17). Every launch first removes `edge-*` profiles older than maxAgeMs; fresh ones may be in use.
export function sweepStaleProfiles(root = tmpdir(), maxAgeMs = 30 * 60_000) {
  let removed = 0;
  for (const name of readdirSync(root)) {
    if (!name.startsWith('edge-')) continue;
    const d = join(root, name);
    try {
      if (!statSync(d).isDirectory() || Date.now() - statSync(d).mtimeMs < maxAgeMs) continue;
      rmSync(d, { recursive: true, force: true }); removed++;
    } catch {}   // locked by a running Edge: leave it
  }
  return removed;
}

export async function launch(url) {
  sweepStaleProfiles();
  const port = 20000 + Math.floor(Math.random() * 20000), dir = mkdtempSync(join(tmpdir(), 'edge-'));
  const proc = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`,
    '--autoplay-policy=no-user-gesture-required', '--allow-file-access-from-files', '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding', '--window-size=1200,2000', url], { stdio: 'ignore' });
  let targets = [];
  for (let i = 0; i < 50; i++) {
    try { targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); if (targets.some(t => t.type === 'page' && t.url.startsWith('file:'))) break; } catch {}
    await new Promise(r => setTimeout(r, 200));
  }
  const page = targets.find(t => t.type === 'page' && t.url.startsWith('file:'));
  if (!page) { proc.kill(); setTimeout(() => { try { rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); } catch {} }, 1500); throw new Error('Edge did not open ' + url); }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  let id = 0; const pending = new Map();
  ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const evaluate = async expr => {
    const m = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (m.result?.exceptionDetails) throw new Error(JSON.stringify(m.result.exceptionDetails).slice(0, 800));
    return m.result.result.value;
  };
  // Kill Edge, then delete its throwaway profile (~30 MB each).
  const close = () => { try { ws.close(); } catch {} proc.kill(); setTimeout(() => { try { rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); } catch {} }, 1500); };
  return { evaluate, close };
}

// Open a *.render.html page and wait until its fonts and images are loaded.
export async function openPage(page) {
  const b = await launch(fileUrl(page));
  for (let i = 0; i < 50 && !(await b.evaluate('typeof reelReady !== "undefined"')); i++) await new Promise(r => setTimeout(r, 200));
  await b.evaluate('reelReady');
  return b;
}
