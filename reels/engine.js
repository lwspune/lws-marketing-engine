// ---------------------------------------------------------------------------
// Reel engine: draws a reel (1080×1920) or a carousel (1080×1350 slides) on a canvas from a
// plain config object, plays it with an original synthesised music bed, and records H.264 + AAC
// MP4 in Edge/Chrome. Extracted from nda-maths-001.render.html (which stays standalone).
//
// A page defines its content and calls Reel.mount(config). Config fields:
//   name, size: [W, H], duration (s)          — reels only
//   theme:    'white' | 'lab'                  — optional: premium soft board for animated graphs ('lab' = dark):
//                                                warm gradient, floating white caption cards, no pen,
//                                                soft end card; colours in Reel.WHITE; api.card / chips /
//                                                softStroke for the look (default: ruled paper, house look)
//   captions: [{ t0, t1, text }]               — on-screen text boxes ('\n' = line break)
//   lines:    [{ y, size, t0, dur, color?, x?, tokens }]   — t0 < 0 = already on the page
//             tokens: string | {text} | {sup} | {sub} | {int:[lo,hi]} | {limits:[lo,hi]} | {mark:name}
//             any token but a mark may carry its own color (e.g. { text: '|sin x|', color })
//             {int} upper limits wider than one glyph touch the ∫ top: pad them, e.g. ['0', '  8π']
//   notes:    [{ t0, dur, kind: underline|box|ring|arrow, from, to }]  — red pen, by mark names
//   draw(ctx, t, api, isCover) → pen | null     — optional custom drawing (robot, timer, figure)
//   end:      { t0, y?, image?, lines: [{ at, size, weight, color, text }] }
//   music:    { style?: lofi|bright|calm, chime?: t, ticks?: [t…], ding?: t,   — style: original loops (lofi = house default)
//               tones?: [{ t0, t1, hz, peak, gain: t => 0…1, type? }],   — sonification: loudness follows gain(t)
//               duck?: [[t0, t1, level]] } | null                       — lower the music bed (not tones/chime)
//   cover:    { t, text, y?, size? }
//   images:   { key: 'assets/file.png' }       — preloaded, available as api.img(key)
//   slides:   [{ captions, lines, notes, draw }] — carousel mode instead of a timeline
// ---------------------------------------------------------------------------
(() => {
  const INK = '#1b2a6b', RED = '#d22f27', PAPER = '#fbf8f0';
  const TEXT_FONT = 'Cambria, "Cambria Math", serif';
  const MATH = '"Cambria Math", "Segoe UI Symbol", serif';
  const UI = '"Segoe UI", system-ui, sans-serif';
  const SOFT_UI = '"Segoe UI Variable Display", "Segoe UI", system-ui, sans-serif';
  const LEFT = 150;
  // White theme palette: slate ink, one maths colour (indigo), one area colour (sage), one accent
  // (terracotta, only for the answer). Text is ≥ 4.5:1 from the board's centre to its edge
  // (tests/reel-theme.test.js).
  const WHITE = {
    board: '#faf8f3', edge: '#f1ede4', ink: '#23304a', muted: '#5f6880',
    blue: '#3f56a0', green: '#2a736e', amber: '#a94f28', red: '#a94f28',
    fill: 'rgba(42, 115, 110, 0.16)', grid: 'rgba(35, 48, 74, 0.16)', axis: 'rgba(35, 48, 74, 0.45)',
  };
  // Lab theme (2026-10-18): the dark look for @pyqvault_, A/B-tested against the white board. Same colour
  // roles as WHITE (tests/reel-theme.test.js), plus the card fill and the shadow/vignette colour.
  const LAB = {
    board: '#121822', edge: '#0a0e15', ink: '#e6ebf3', muted: '#a3adbd',
    blue: '#86a8ff', green: '#4fd1a5', amber: '#ffb35c', red: '#ffb35c',
    fill: 'rgba(79, 209, 165, 0.16)', grid: 'rgba(230, 235, 243, 0.14)', axis: 'rgba(230, 235, 243, 0.42)',
    card: '#1b2330', shadow: '#000000',
  };
  const palette = theme => (theme === 'lab' ? LAB : WHITE);
  const tint = (hex, a) => `rgba(${[1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(', ')}, ${a})`;

  const clamp01 = v => Math.max(0, Math.min(1, v));
  const ease = p => p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  // A tone's gain curve: fn(t) clamped to 0…1, sampled `rate` times a second from t0 to t1, faded over
  // 0.25 s at both ends so it never clicks (tests/reel-tones.test.js).
  const MUSIC_STYLES = ['lofi', 'bright', 'calm', 'drive', 'synthwave', 'trap', 'cinematic'];
  // Where each riser-into-impact goes (tests/reel-music.test.js): a riser runs up to 2 s into its hit; hits in the
  // first second, in the fade-out, or within 1.5 s of the previous hit are dropped.
  function hitWindows(hits, duration) {
    const last = duration - Math.min(2.5, duration * 0.2) - 0.3, out = [];
    for (const at of [...hits].sort((a, b) => a - b)) {
      if (at < 1 || at > last || (out.length && at - out[out.length - 1].at < 1.5)) continue;
      out.push({ from: Math.max(0.3, at - 2), at });
    }
    return out;
  }
  function toneCurve(fn, t0, t1, rate = 100) {
    const n = Math.round((t1 - t0) * rate) + 1, out = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const t = t0 + i / rate, edge = Math.min(1, (t - t0) / 0.25, (t1 - t) / 0.25);
      out[i] = Math.min(1, Math.max(0, fn(t))) * Math.max(0, edge);
    }
    return out;
  }
  // 16-bit PCM WAV from rendered channels (interleaved, clipped to ±1), for reels made outside the engine
  // (remotion/) that use this music: reels/tools/music.mjs (tests/reel-wav.test.js).
  function wav(channels, sampleRate) {
    const n = channels[0].length, k = channels.length, b = new Uint8Array(44 + n * k * 2), v = new DataView(b.buffer);
    const str = (at, s) => { for (let i = 0; i < s.length; i++) b[at + i] = s.charCodeAt(i); };
    str(0, 'RIFF'); v.setUint32(4, b.length - 8, true); str(8, 'WAVE'); str(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, k, true); v.setUint32(24, sampleRate, true);
    v.setUint32(28, sampleRate * k * 2, true); v.setUint16(32, k * 2, true); v.setUint16(34, 16, true);
    str(36, 'data'); v.setUint32(40, n * k * 2, true);
    for (let i = 0, at = 44; i < n; i++) for (let c = 0; c < k; c++, at += 2) {
      const s = Math.max(-1, Math.min(1, channels[c][i]));
      v.setInt16(at, Math.round(s < 0 ? s * 32768 : s * 32767), true);
    }
    return b;
  }
  const prog = (t, t0, dur) => dur <= 0 ? (t >= t0 ? 1 : 0) : ease(clamp01((t - t0) / dur));
  const hand = size => `600 ${size}px ${TEXT_FONT}`;
  const wob = (i, a = 3) => Math.sin(i * 1.7) * a;

  function mount(config) {
    const cv = document.getElementById('c'), ctx = cv.getContext('2d');
    const [W, H] = config.size ?? [1080, 1920];
    cv.width = W; cv.height = H;
    const images = {};
    let LAID = [], MARKS = {};
    // White theme: same layout on a soft-white board (no ruled lines), slate ink, terracotta pen.
    // 'white' and 'lab' share the soft-board layout; only the palette differs.
    const P = palette(config.theme), white = config.theme === 'white' || config.theme === 'lab';
    const ink = white ? P.ink : INK, red = white ? P.red : RED;

    // ---- layout -----------------------------------------------------------
    function layout(line) {
      const s = line.size, items = [], marks = {};
      let x = line.x ?? LEFT;
      for (const tk of line.tokens) {
        const color = tk.color;
        if (typeof tk === 'string' || tk.text != null) {
          const txt = tk.text ?? tk;
          ctx.font = hand(s); const w = ctx.measureText(txt).width;
          items.push({ x, dy: 0, font: hand(s), text: txt, color }); x += w;
        } else if (tk.sup || tk.sub) {
          const fs = Math.round(s * 0.6); ctx.font = hand(fs); const txt = tk.sup ?? tk.sub;
          items.push({ x: x + 2, dy: tk.sup ? -s * 0.45 : s * 0.2, font: hand(fs), text: txt, color });
          x += ctx.measureText(txt).width + 6;
        } else if (tk.int) {
          const fs = Math.round(s * 1.35); ctx.font = `${fs}px ${MATH}`; const iw = ctx.measureText('∫').width;
          items.push({ x, dy: s * 0.12, font: `${fs}px ${MATH}`, text: '∫', color });
          const ls = Math.round(s * 0.5); ctx.font = hand(ls);
          const lw = Math.max(ctx.measureText(tk.int[0]).width, ctx.measureText(tk.int[1]).width);
          items.push({ x: x + iw * 0.7, dy: -s * 0.78, font: hand(ls), text: tk.int[1], color });
          items.push({ x: x + iw * 0.45, dy: s * 0.4, font: hand(ls), text: tk.int[0], color });
          x += iw * 0.7 + lw + 8;
        } else if (tk.limits) {
          const ls = Math.round(s * 0.5); ctx.font = hand(ls);
          items.push({ x: x + 2, dy: -s * 0.62, font: hand(ls), text: tk.limits[1], color });
          items.push({ x: x + 2, dy: s * 0.28, font: hand(ls), text: tk.limits[0], color });
          x += Math.max(ctx.measureText(tk.limits[0]).width, ctx.measureText(tk.limits[1]).width) + 6;
        } else if (tk.mark) {
          marks[tk.mark] = { x, y: line.y, size: s };
        }
      }
      return { items, marks, x0: line.x ?? LEFT, x1: x };
    }
    function prepare(lines) {
      MARKS = {};
      LAID = (lines ?? []).map(l => { const L = layout(l); Object.assign(MARKS, L.marks); return { ...l, ...L }; });
    }

    // ---- page -------------------------------------------------------------
    function board(mark = true) {
      // Warm paper-white, a touch darker towards the edges: calmer than a flat fill.
      const g = ctx.createRadialGradient(W / 2, H * 0.42, 100, W / 2, H * 0.42, H * 0.75);
      g.addColorStop(0, P.board); g.addColorStop(1, P.edge);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // Opt-in premium edge shade (config.vignette, reel 009 on): a soft slate falloff towards the frame's
      // boundary that pulls the eye to the centre. Part of the board, so the end card keeps it too.
      if (config.vignette) {
        const v = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.30, W / 2, H * 0.46, H * 0.80);
        v.addColorStop(0, tint(P.shadow ?? P.ink, 0)); v.addColorStop(1, tint(P.shadow ?? P.ink, P.shadow ? 0.45 : 0.17));
        ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
      }
      if (!mark || config.watermarkY === null) return;
      ctx.fillStyle = tint(P.muted, 0.55); ctx.font = `600 34px ${UI}`; ctx.textAlign = 'left';
      ctx.fillText('LWS Pune  ·  NDA Maths', LEFT, config.watermarkY ?? (H > 1500 ? 1600 : H - 60));
    }
    function paper() {
      if (white) return board();
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(70, 110, 190, 0.16)'; ctx.lineWidth = 2;
      for (let y = 515; y < H - 200; y += 120) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(210, 47, 39, 0.28)';
      ctx.beginPath(); ctx.moveTo(110, H > 1500 ? 400 : 0); ctx.lineTo(110, H); ctx.stroke();
      if (config.watermarkY === null) return; // a reel can opt out (e.g. when a character is the branding)
      ctx.fillStyle = 'rgba(27, 42, 107, 0.45)'; ctx.font = `600 34px ${UI}`; ctx.textAlign = 'left';
      ctx.fillText('LWS Pune  ·  NDA Maths', LEFT, config.watermarkY ?? (H > 1500 ? 1600 : H - 60));
    }
    function drawPen(x, y) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.95);
      ctx.fillStyle = '#2b2b2b'; ctx.fillRect(18, -11, 300, 22);
      ctx.fillStyle = '#c9a227'; ctx.fillRect(250, -11, 14, 22);
      ctx.fillStyle = '#555'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(20, -11); ctx.lineTo(20, 11); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    function drawLine(L, t) {
      const p = L.t0 < 0 ? 1 : prog(t, L.t0, L.dur);
      if (p <= 0) return null;
      ctx.save();
      if (p < 1) { ctx.beginPath(); ctx.rect(L.x0 - 20, L.y - L.size * 1.6, (L.x1 - L.x0 + 20) * p + 20, L.size * 2.6); ctx.clip(); }
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      for (const it of L.items) { ctx.fillStyle = it.color ?? L.color ?? ink; ctx.font = it.font; ctx.fillText(it.text, it.x, L.y + it.dy); }
      ctx.restore();
      return p < 1 ? { x: L.x0 + (L.x1 - L.x0) * p, y: L.y - L.size * 0.25 } : null;
    }
    // Draw a token line right now (for custom drawing), centred on cx or starting at x. Returns its extent.
    function math(tokens, { y, size, x, cx, color }) {
      let L = layout({ tokens, y, size, x: x ?? 0 });
      if (cx != null) L = layout({ tokens, y, size, x: cx - (L.x1 - L.x0) / 2 });
      drawLine({ ...L, y, size, color, t0: -1 }, 0);
      return { x0: L.x0, x1: L.x1 };
    }

    // ---- red pen ----------------------------------------------------------
    function strokePartial(pts, p, width = 7, color = red) {
      if (p <= 0) return null;
      let total = 0; const seg = [];
      for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
      let left = total * p, end = pts[0];
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(...pts[0]);
      for (let i = 1; i < pts.length && left > 0; i++) {
        const f = Math.min(1, left / seg[i - 1]);
        end = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
        ctx.lineTo(...end); left -= seg[i - 1];
      }
      ctx.stroke(); ctx.restore();
      return end;
    }
    function roundedPath(corners, r) {
      const pts = [corners[0]], lerp = (p, q, f) => [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];
      for (let i = 1; i < corners.length - 1; i++) {
        const [p, c, n] = [corners[i - 1], corners[i], corners[i + 1]];
        const a = lerp(c, p, Math.min(0.5, r / Math.hypot(p[0] - c[0], p[1] - c[1])));
        const b = lerp(c, n, Math.min(0.5, r / Math.hypot(n[0] - c[0], n[1] - c[1])));
        for (let k = 0; k <= 8; k++) { const u = k / 8, v = 1 - u; pts.push([v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1]]); }
      }
      const last = pts.at(-1), end = corners.at(-1);
      for (let k = 1; k <= 6; k++) pts.push(lerp(last, end, k / 6));
      return pts;
    }
    function notePath(n) {
      const a = MARKS[n.from], b = MARKS[n.to];
      if (n.kind === 'underline') {
        const y = a.y + a.size * 0.32, pts = [];
        for (let i = 0; i <= 20; i++) pts.push([a.x + (b.x - a.x) * i / 20, y + wob(i, 2.5)]);
        return pts;
      }
      if (n.kind === 'box') {
        const x0 = a.x - 22, x1 = b.x + 22, y0 = a.y - a.size * 1.0, y1 = a.y + a.size * 0.38;
        return [[x0, y0], [x1, y0 + 4], [x1 - 3, y1], [x0 + 2, y1 - 3], [x0, y0 - 6]];
      }
      if (n.kind === 'ring') {
        const cx = (a.x + b.x) / 2, cy = a.y - a.size * 0.3, rx = (b.x - a.x) / 2 + 30, ry = a.size * 0.78, pts = [];
        for (let i = 0; i <= 48; i++) { const th = -Math.PI / 2 + i / 48 * Math.PI * 2.12; pts.push([cx + Math.cos(th) * (rx + wob(i, 3)), cy + Math.sin(th) * (ry + wob(i, 2))]); }
        return pts;
      }
      if (n.kind === 'arrow') {
        // Rounded bracket out to the right edge, up, and in under the target: crosses no text.
        const s = [a.x + 36, a.y - a.size * 0.35], e = [b.x + 14, b.y + b.size * 0.32], gx = W - 45;
        return roundedPath([s, [gx, s[1]], [gx, e[1]], e], 40);
      }
    }
    function arrowHead(pts) {
      const [x1, y1] = pts.at(-1), [x0, y0] = pts.at(-4), ang = Math.atan2(y1 - y0, x1 - x0);
      ctx.save(); ctx.strokeStyle = red; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath();
      for (const d of [2.6, -2.6]) { ctx.moveTo(x1, y1); ctx.lineTo(x1 - 34 * Math.cos(ang + d / 6), y1 - 34 * Math.sin(ang + d / 6)); }
      ctx.stroke(); ctx.restore();
    }
    function drawNote(n, t) {
      const p = prog(t, n.t0, n.dur), pts = notePath(n);
      const end = strokePartial(pts, p);
      if (n.kind === 'arrow' && p >= 1) arrowHead(pts);
      return p > 0 && p < 1 ? end : null;
    }

    // ---- captions, bubbles, end card ---------------------------------------
    function wrap(text, maxW) {
      const out = [];
      for (const para of text.split('\n')) {
        let cur = '';
        for (const w of para.split(' ')) { const next = cur ? cur + ' ' + w : w; if (ctx.measureText(next).width > maxW && cur) { out.push(cur); cur = w; } else cur = next; }
        if (cur) out.push(cur);
      }
      return out;
    }
    function caption(text, alpha, size = 56, y = 300) {
      if (!text || alpha <= 0) return;
      ctx.save(); ctx.globalAlpha = alpha; ctx.font = white ? `600 ${size}px ${SOFT_UI}` : `800 ${size}px ${UI}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const pad = white ? [96, 60] : [70, 44];
      const lines = wrap(text, 860), lh = size * 1.22, bw = Math.max(...lines.map(l => ctx.measureText(l).width)) + pad[0], bh = lines.length * lh + pad[1];
      if (white) {
        // A floating white card with a soft shadow, not a black slab.
        card(W / 2 - bw / 2, y - bh / 2, bw, bh, 34, 0.14);
        ctx.fillStyle = P.ink; lines.forEach((l, i) => ctx.fillText(l, W / 2, y - (lines.length - 1) * lh / 2 + i * lh));
        ctx.restore(); return;
      }
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.roundRect(W / 2 - bw / 2 + 6, y - bh / 2 + 8, bw, bh, 24); ctx.fill();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.roundRect(W / 2 - bw / 2, y - bh / 2, bw, bh, 24); ctx.fill();
      ctx.fillStyle = '#fff';
      lines.forEach((l, i) => ctx.fillText(l, W / 2, y - (lines.length - 1) * lh / 2 + i * lh));
      ctx.restore();
    }
    // White theme building blocks: a floating card, answer-option chips and a softly shadowed stroke.
    function card(x, y, w, h, r = 32, shade = 0.10) {
      ctx.save(); ctx.shadowColor = tint(P.shadow ?? P.ink, P.shadow ? shade * 3 : shade); ctx.shadowBlur = 48; ctx.shadowOffsetY = 16;
      ctx.fillStyle = P.card ?? '#ffffff'; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); ctx.restore();
    }
    // Options as pills, centred on the page. From `at`, the answer chip fills with the accent and pulses once.
    function chips(t, { labels, y, answer, at, size = 44, w = 180, h = 72, gap = 20 }) {
      const x0 = W / 2 - (labels.length * w + (labels.length - 1) * gap) / 2;
      const on = at == null ? 0 : prog(t, at, 0.6), pulse = at == null ? 0 : Math.sin(Math.PI * clamp01((t - at) / 0.7));
      labels.forEach((label, i) => {
        const hit = i === answer && on > 0, s = hit ? 1 + 0.07 * pulse : 1;
        ctx.save(); ctx.translate(x0 + i * (w + gap) + w / 2, y + h / 2); ctx.scale(s, s);
        ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
        if (hit) { ctx.fillStyle = tint(P.amber, 0.12 * on); ctx.fill(); }
        ctx.strokeStyle = hit ? tint(P.amber, 0.25 + 0.6 * on) : tint(P.ink, 0.14); ctx.lineWidth = hit ? 2 + on : 2; ctx.stroke();
        ctx.fillStyle = hit && on > 0.5 ? P.amber : ink; ctx.font = hand(size); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(label, 0, 2); ctx.restore();
      });
    }
    function softStroke(path, color, width) {
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color; ctx.lineWidth = width;
      ctx.shadowColor = tint(color, 0.28); ctx.shadowBlur = 14; ctx.shadowOffsetY = 4; ctx.stroke(path); ctx.restore();
    }
    // A light running round a card's edge: bright head, fading tail, soft bloom. Draws attention without
    // moving or scaling anything (a slow zoom on text shimmers). Constant speed; fades in from t0, out at the end.
    function glowRing(t, { x, y, w, h, r = 32, t0 = 0, dur = 2.6, laps = 1.25, color = P.blue, alpha = 1 }) {
      if (t < t0 || t > t0 + dur || alpha <= 0) return;
      const k = (t - t0) / dur, fade = alpha * Math.min(1, (t - t0) / 0.3 + 0.35, (1 - k) / 0.18);
      const g = ctx.createConicGradient(-Math.PI / 2 + k * laps * 2 * Math.PI, x + w / 2, y + h / 2);
      g.addColorStop(0, tint(color, 0)); g.addColorStop(0.6, tint(color, 0)); g.addColorStop(0.985, tint(color, 0.95)); g.addColorStop(1, tint(color, 0));
      ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
      ctx.globalAlpha = fade * 0.5; ctx.strokeStyle = tint(color, 0.14); ctx.lineWidth = 2; ctx.stroke();
      ctx.globalAlpha = fade * 0.3; ctx.strokeStyle = g; ctx.lineWidth = 14; ctx.stroke();
      ctx.globalAlpha = fade; ctx.lineWidth = 4; ctx.shadowColor = tint(color, 0.7); ctx.shadowBlur = 20; ctx.stroke();
      ctx.restore();
    }
    // ---- simple 3D (drawn in 2D with perspective + light from the upper left) -------------------------
    const rgbOf = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    const mix = (hex, to, k) => `rgb(${rgbOf(hex).map((c, i) => Math.round(c + (to[i] - c) * k)).join(', ')})`;
    // A shaded ball: highlight up-left, darker rim. Reads as 3D on both boards.
    function sphere3d(x, y, r, color) {
      const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.08, x, y, r);
      g.addColorStop(0, mix(color, [255, 255, 255], 0.55)); g.addColorStop(0.55, color); g.addColorStop(1, mix(color, [0, 0, 0], 0.35));
      ctx.save(); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.restore();
    }
    // An upright glass jar (cylinder) seen slightly from above. drawInside(clip) runs between the back and the
    // front of the glass, clipped to the jar's inside, so contents sit "in" it. tilt = ellipse height / width.
    function jar({ cx, top, bottom, r, tilt = 0.26 }, drawInside) {
      const ry = r * tilt, edge = P.ink;
      ctx.save();
      // back of the rim and the floor
      ctx.strokeStyle = tint(edge, 0.18); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(cx, top, r, ry, 0, Math.PI, 2 * Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, bottom, r, ry, 0, Math.PI, 2 * Math.PI); ctx.stroke();
      // contents, clipped to the inside
      ctx.save(); ctx.beginPath();
      ctx.ellipse(cx, top, r, ry, 0, Math.PI, 0, false); ctx.lineTo(cx + r, bottom); ctx.ellipse(cx, bottom, r, ry, 0, 0, Math.PI, false); ctx.closePath();
      ctx.clip(); if (drawInside) drawInside(); ctx.restore();
      // glass: thicker (darker) towards the edges, a soft highlight streak, crisp outline and front rim
      const g = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
      g.addColorStop(0, tint(edge, 0.16)); g.addColorStop(0.12, tint(edge, 0.04)); g.addColorStop(0.5, tint(edge, 0));
      g.addColorStop(0.88, tint(edge, 0.05)); g.addColorStop(1, tint(edge, 0.18));
      ctx.fillStyle = g; ctx.fillRect(cx - r, top, 2 * r, bottom - top);
      const hl = ctx.createLinearGradient(cx - r * 0.72, 0, cx - r * 0.5, 0);
      hl.addColorStop(0, 'rgba(255, 255, 255, 0)'); hl.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)'); hl.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = hl; ctx.fillRect(cx - r * 0.72, top + ry, r * 0.22, bottom - top - 2 * ry);
      ctx.strokeStyle = tint(edge, 0.55); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx - r, top); ctx.lineTo(cx - r, bottom); ctx.moveTo(cx + r, top); ctx.lineTo(cx + r, bottom); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, bottom, r, ry, 0, 0, Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, top, r, ry, 0, 0, Math.PI); ctx.stroke();
      ctx.restore();
    }
    // Speech bubble with a tail pointing at (tx, ty). Text in UI font, dark on white.
    function bubble(text, x, y, w, alpha, tx, ty, size = 46) {
      if (!text || alpha <= 0) return;
      ctx.save(); ctx.globalAlpha = alpha; ctx.font = `700 ${size}px ${UI}`;
      const lines = wrap(text, w - 60), lh = size * 1.25, h = lines.length * lh + 50;
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#1b2a6b'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 34);
      const ax = x + 50; ctx.moveTo(ax, y + h - 2); ctx.lineTo(tx, ty); ctx.lineTo(ax + 50, y + h - 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(ax + 3, y + h - 8, 44, 10);
      ctx.fillStyle = '#111'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      lines.forEach((l, i) => ctx.fillText(l, x + 30, y + 25 + i * lh));
      ctx.restore();
      return h;
    }
    function endCard(t) {
      const E = config.end; if (!E) return;
      const p = clamp01((t - E.t0) / 0.5);
      if (p <= 0) return;
      ctx.save();
      // The white theme fades into its own board: no flash to navy at the end.
      if (white) { ctx.globalAlpha = p; board(false); ctx.globalAlpha = 1; } else { ctx.fillStyle = `rgba(12, 16, 24, ${p})`; ctx.fillRect(0, 0, W, H); }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      let y = E.y ?? 820;
      if (E.image && images[E.image]) {
        const im = images[E.image], a = clamp01((t - E.t0 - 0.1) / 0.35), w = 300, h = w * im.height / im.width;
        ctx.globalAlpha = a; ctx.drawImage(im, W / 2 - w / 2, y - h - 60 + (1 - a) * 20, w, h);
      }
      for (const l of E.lines) {
        const a = clamp01((t - E.t0 - l.at) / 0.35);
        ctx.globalAlpha = a; ctx.fillStyle = l.color; ctx.font = `${l.weight} ${l.size}px ${white ? SOFT_UI : UI}`;
        ctx.fillText(l.text, W / 2, y + (1 - a) * 18);
        y += l.size * (l.size > 70 ? 2.0 : 1.75);
      }
      ctx.restore();
    }

    const api = { ctx, W, H, INK: ink, RED: red, UI, SOFT_UI, P, card, chips, softStroke, glowRing, sphere3d, jar, hand, prog, ease, clamp01, strokePartial, roundedPath, arrowHead, bubble, caption,
      math, wrap, marks: () => MARKS, img: k => images[k] };

    // ---- frames -----------------------------------------------------------
    function frame(t, cover) {
      paper();
      let pen = null;
      for (const L of LAID) pen = drawLine(L, t) ?? pen;
      for (const n of config.notes ?? []) pen = drawNote(n, t) ?? pen;
      if (config.draw) pen = config.draw(ctx, t, api, !!cover) ?? pen;
      if (pen && !white) drawPen(pen.x, pen.y); // the white board is "drawn by itself": no pen
      if (cover) caption(cover.text, 1, cover.size ?? 92, cover.y ?? 1080);
      else {
        const c = (config.captions ?? []).find(c => t >= c.t0 && t < c.t1);
        // The opening caption is fully visible on frame 0: it is the hook people see before scrolling.
        // On the white board captions also fade out, so consecutive ones cross-fade.
        const out = white && c ? clamp01((c.t1 - t) / 0.25) : 1;
        if (c) caption(c.text, (c.t0 === 0 ? 1 : clamp01((t - c.t0) / 0.18)) * out, c.size, c.y);
      }
      endCard(t);
    }
    function slide(i) {
      const s = config.slides[i];
      const saved = { notes: config.notes, draw: config.draw, captions: config.captions, end: config.end };
      Object.assign(config, { notes: s.notes ?? [], draw: s.draw, captions: (s.captions ?? []).map(c => ({ t0: 0, t1: Infinity, ...c })), end: null });
      prepare(s.lines); frame(1e6);
      // Slide counter + swipe cue, bottom right.
      ctx.save(); ctx.font = `700 34px ${UI}`; ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(27, 42, 107, 0.55)';
      ctx.fillText(i < config.slides.length - 1 ? `${i + 1}/${config.slides.length}   Swipe →` : `${i + 1}/${config.slides.length}`, W - 60, H - 60);
      ctx.restore();
      Object.assign(config, saved);
    }

    // ---- music ------------------------------------------------------------
    // Original lo-fi loop: Am7 – Fmaj7 – Cmaj7 – G6 at 84 BPM. Nothing to license.
    const BPM = 84, CHORDS = [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 60, 64], [55, 59, 62, 64]], BASS = [45, 41, 48, 43];
    const hz = m => 440 * Math.pow(2, (m - 69) / 12);
    function music(ac, out, t0) {
      const M = config.music ?? {}, D = config.duration;
      const beat = 60 / BPM, bar = beat * 4;
      const master = ac.createGain(), tone = ac.createBiquadFilter();
      tone.type = 'lowpass'; tone.frequency.value = 2600; master.connect(tone); tone.connect(out);
      const fadeOut = Math.min(2.5, D * 0.2);
      master.gain.setValueAtTime(0, t0);
      master.gain.linearRampToValueAtTime(1, t0 + Math.min(1.2, D * 0.1));
      master.gain.setValueAtTime(1, t0 + D - fadeOut);
      master.gain.linearRampToValueAtTime(0, t0 + D);

      // The bed (pads, bass, drums, arp) runs through its own gain so it can duck under sonified tones.
      const bed = ac.createGain(); bed.connect(master);
      for (const [a, b, level] of M.duck ?? []) {
        bed.gain.setValueAtTime(1, t0 + a); bed.gain.linearRampToValueAtTime(level, t0 + a + 0.6);
        bed.gain.setValueAtTime(level, t0 + b - 0.6); bed.gain.linearRampToValueAtTime(1, t0 + b);
      }
      const noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), nd = noise.getChannelData(0);
      for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      const voice = (type, f, at, len, peak, attack = 0.01, dest = bed) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(peak, at + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, at + len);
        o.connect(g); g.connect(dest); o.start(at); o.stop(at + len + 0.05);
      };
      const pad = (f, at, len, peak, dest, detune) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'triangle'; o.frequency.value = f; o.detune.value = detune;
        g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(peak, at + 0.45);
        g.gain.setValueAtTime(peak, at + len - 0.35); g.gain.linearRampToValueAtTime(0, at + len);
        o.connect(g); g.connect(dest); o.start(at); o.stop(at + len + 0.05);
      };
      const hit = (at, len, peak, filterType, freq) => {
        const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
        s.buffer = noise; f.type = filterType; f.frequency.value = freq;
        g.gain.setValueAtTime(peak, at); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
        s.connect(f); f.connect(g); g.connect(bed); s.start(at); s.stop(at + len + 0.05);
      };
      const kick = at => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.frequency.setValueAtTime(110, at); o.frequency.exponentialRampToValueAtTime(42, at + 0.22);
        g.gain.setValueAtTime(0.55, at); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.32);
        o.connect(g); g.connect(bed); o.start(at); o.stop(at + 0.4);
      };
      const padBus = ac.createBiquadFilter(); padBus.type = 'lowpass'; padBus.frequency.value = 950; padBus.connect(bed);
      // A struck note: a sine plus soft 2nd/3rd harmonics that die away faster (pluck / piano-like).
      const strike = (f, at, len, peak) => { for (const [h, p] of [[1, 1], [2, 0.35], [3, 0.12]]) voice('sine', f * h, at, len / h, peak * p, 0.004); };
      const style = M.style ?? 'lofi';

      // ---- the energetic styles (2026-10-18): drive, synthwave, trap, cinematic. All original, made here. ----
      // Open top end (no 2.6 kHz lowpass), a compressor for punch, stereo width, a generated-noise reverb, and pads
      // that duck on every kick (the "pump").
      function energetic(name) {
        const comp = ac.createDynamicsCompressor();
        comp.threshold.value = -16; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
        // master → compressor → per-style level → limiter → out, so every style lands at the house loudness
        // (body ≈ −22 dB RMS, peaks ≤ −3 dB; measured with reels/tools/check-video.mjs).
        const TRIM = { drive: 0.18, synthwave: 2.2, trap: 0.85, cinematic: 2.6 }, trim = ac.createGain(), lim = ac.createDynamicsCompressor();
        trim.gain.value = TRIM[name]; lim.threshold.value = -9; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.1;
        tone.frequency.value = 14000; master.disconnect(); master.connect(comp); comp.connect(trim); const post = ac.createGain(); post.gain.value = 0.56; // the limiter adds make-up gain: take 5 dB back
        trim.connect(lim); lim.connect(post); post.connect(tone);
        const ir = ac.createBuffer(2, Math.round(ac.sampleRate * 2.2), ac.sampleRate);
        for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3); }
        const verb = ac.createConvolver(), vg = ac.createGain(); verb.buffer = ir; vg.gain.value = 0.22; verb.connect(vg); vg.connect(bed);
        const out = (node, p = 0, wet = 0) => {
          const pn = ac.createStereoPanner(); pn.pan.value = p; node.connect(pn); pn.connect(bed);
          if (wet) { const w = ac.createGain(); w.gain.value = wet; node.connect(w); w.connect(verb); }
        };
        const pump = ac.createGain(); out(pump, 0, 0.5);
        const duck = at => { pump.gain.setValueAtTime(0.3, at); pump.gain.linearRampToValueAtTime(1, at + 0.22); };
        const env = (g, at, peak, a, len) => { g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(peak, at + a); g.gain.exponentialRampToValueAtTime(0.0001, at + len); };
        // A filtered saw (two slightly detuned) for leads, plucks, bass and string stabs.
        const saw = (f, at, len, peak, cut, p = 0, wet = 0.25, dest = null, a = 0.006) => {
          const lp = ac.createBiquadFilter(), g = ac.createGain(); lp.type = 'lowpass'; lp.Q.value = 2;
          lp.frequency.setValueAtTime(cut * 2.5, at); lp.frequency.exponentialRampToValueAtTime(cut, at + Math.min(len, 0.25));
          for (const d of [-7, 7]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d; o.connect(lp); o.start(at); o.stop(at + len + 0.05); }
          lp.connect(g); env(g, at, peak, a, len); dest ? g.connect(dest) : out(g, p, wet);
        };
        const padChord = (notes, at, len, peak, cut) => {
          for (const m of notes) for (const d of [-12, 12]) {
            const o = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain();
            o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = d; lp.type = 'lowpass'; lp.frequency.value = cut;
            g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(peak, at + 0.3); g.gain.setValueAtTime(peak, at + len - 0.2); g.gain.linearRampToValueAtTime(0, at + len);
            o.connect(lp); lp.connect(g); g.connect(pump); o.start(at); o.stop(at + len + 0.05);
          }
        };
        const kick = (at, peak = 0.9) => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.frequency.setValueAtTime(160, at); o.frequency.exponentialRampToValueAtTime(45, at + 0.12);
          env(g, at, peak, 0.002, 0.42); o.connect(g); out(g); o.start(at); o.stop(at + 0.45); duck(at);
          const c = ac.createBufferSource(), cf = ac.createBiquadFilter(), cg = ac.createGain();
          c.buffer = noise; cf.type = 'highpass'; cf.frequency.value = 2500; env(cg, at, 0.12, 0.001, 0.02);
          c.connect(cf); cf.connect(cg); out(cg); c.start(at); c.stop(at + 0.05);
        };
        const snare = (at, peak = 0.35, len = 0.22, wet = 0.6) => {
          const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
          s.buffer = noise; f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = 0.7; env(g, at, peak, 0.001, len);
          s.connect(f); f.connect(g); out(g, 0, wet); s.start(at); s.stop(at + len + 0.05);
          const o = ac.createOscillator(), og = ac.createGain(); o.frequency.setValueAtTime(220, at); o.frequency.exponentialRampToValueAtTime(150, at + 0.08);
          env(og, at, peak * 0.6, 0.001, 0.12); o.connect(og); out(og); o.start(at); o.stop(at + 0.15);
        };
        const hat = (at, peak = 0.07, len = 0.04, p = 0.25) => {
          const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
          s.buffer = noise; f.type = 'highpass'; f.frequency.value = 8500; env(g, at, peak, 0.001, len);
          s.connect(f); f.connect(g); out(g, p); s.start(at); s.stop(at + len + 0.05);
        };
        const sub = (f, at, len, peak, from = null) => { // an 808-style sub, optionally gliding in from another note
          const o = ac.createOscillator(), g = ac.createGain(), sh = ac.createWaveShaper(), c = new Float32Array(256);
          for (let i = 0; i < 256; i++) { const x = i / 128 - 1; c[i] = Math.tanh(2.2 * x); } sh.curve = c;
          o.frequency.setValueAtTime(from ?? f, at); if (from) o.frequency.exponentialRampToValueAtTime(f, at + 0.12);
          env(g, at, peak, 0.005, len); o.connect(sh); sh.connect(g); out(g); o.start(at); o.stop(at + len + 0.05);
        };
        const intro = 1; // bars before the drums come in
        if (name === 'drive') {
          // 122 BPM electro-pop in A minor: Am – F – C – G. Four on the floor, offbeat hats, pumping pad, pluck hook.
          const bt = 60 / 122, br = bt * 4;
          const CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], RT = [45, 41, 48, 43];
          const HOOK = [[0, 76], [0.5, 72], [1, 69], [1.5, 72], [2, 76], [2.75, 79], [3.25, 76], [3.5, 74]];
          for (let k = 0; k * br < D; k++) {
            const at = t0 + k * br, ch = CH[k % 4];
            padChord(ch, at, br, 0.022, 1800);
            if (k >= intro) {
              for (let b = 0; b < 4; b++) kick(at + b * bt);
              for (const b of [1, 3]) snare(at + b * bt, 0.3, 0.18, 0.4);
              for (let b = 0; b < 4; b++) hat(at + (b + 0.5) * bt, 0.09, 0.09, b % 2 ? 0.3 : -0.3);
              for (let e = 0; e < 8; e++) sub(hz(RT[k % 4]), at + (e + 0.5) * bt / 2, bt / 2 * 0.8, 0.32);
            }
            if (k >= intro + 1) for (const [b, m] of HOOK) saw(hz(m + (k % 4 === 3 ? 2 : 0)), at + b * bt, 0.32, 0.075, 2600, b % 1 ? 0.35 : -0.35, 0.3);
          }
        } else if (name === 'synthwave') {
          // 100 BPM retro in E minor: Em – C – G – D. Big gated snare, rolling 16th saw bass, a delayed arp.
          const bt = 0.6, br = bt * 4, CH = [[52, 55, 59], [48, 52, 55], [55, 59, 62], [50, 54, 57]], RT = [40, 36, 43, 38];
          const dl = ac.createDelay(1), fb = ac.createGain(), dg = ac.createGain();
          dl.delayTime.value = bt * 0.75; fb.gain.value = 0.35; dg.gain.value = 0.45; dl.connect(fb); fb.connect(dl); dl.connect(dg); out(dg, 0.4, 0.3);
          for (let k = 0; k * br < D; k++) {
            const at = t0 + k * br, ch = CH[k % 4];
            padChord(ch, at, br, 0.026, 1400);
            for (let e = 0; e < 16; e++) saw(hz(RT[k % 4] + (e % 4 === 2 ? 12 : 0)), at + e * bt / 4, bt / 4 * 0.9, 0.06, 700, 0, 0);
            if (k >= intro) {
              for (const b of [0, 2]) kick(at + b * bt, 0.85);
              for (const b of [1, 3]) snare(at + b * bt, 0.4, 0.5, 0.9);
              for (let e = 0; e < 8; e++) hat(at + e * bt / 2, 0.05, 0.03, 0.2);
            }
            if (k >= intro + 1) [ch[0] + 24, ch[1] + 24, ch[2] + 24, ch[1] + 24].forEach((m, e) => saw(hz(m), at + e * bt, 0.3, 0.05, 3000, -0.3, 0.2, dl));
          }
        } else if (name === 'trap') {
          // 140 BPM, half-time feel in C minor. 808 slides, hi-hat rolls, a dark bell melody.
          const bt = 60 / 140, br = bt * 4, RT = [36, 32, 39, 34], BELL = [[0, 72], [0.75, 75], [1.5, 79], [2.5, 77], [3, 75]];
          for (let k = 0; k * br < D; k++) {
            const at = t0 + k * br;
            padChord([RT[k % 4] + 24, RT[k % 4] + 27, RT[k % 4] + 31], at, br, 0.016, 1200);
            for (const [b, m] of BELL) strike(hz(m - (k % 2 ? 2 : 0)), at + b * bt, 1.2, 0.05);
            if (k >= intro) {
              kick(at); kick(at + 2.5 * bt, 0.75);
              snare(at + 2 * bt, 0.42, 0.25, 0.5);
              sub(hz(RT[k % 4]), at, br * 0.6, 0.5, k % 4 === 0 ? null : hz(RT[(k + 3) % 4]));
              const roll = k % 2 === 1;
              for (let e = 0; e < 8; e++) {
                if (roll && e === 6) { for (let r = 0; r < 6; r++) hat(at + (6 + r / 3) * bt / 2, 0.06, 0.025, 0.3); continue; }
                if (roll && e === 7) continue;
                hat(at + e * bt / 2, e % 2 ? 0.05 : 0.08, 0.035, e % 2 ? 0.25 : -0.25);
              }
            }
          }
        } else if (name === 'cinematic') {
          // 90 BPM in D minor: Dm – B♭ – F – C. 16th-note string ostinato, deep drums that build, a brass swell.
          const bt = 60 / 90, br = bt * 4, CH = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]];
          const bars = Math.ceil(D / br);
          for (let k = 0; k < bars; k++) {
            const at = t0 + k * br, ch = CH[k % 4], grow = Math.min(1, 0.45 + k / bars);
            padChord(ch.map(m => m - 12), at, br, 0.02 * grow, 900);
            for (let e = 0; e < 16; e++) saw(hz(ch[e % 2 ? 1 : 0] + 12 + (e % 8 === 7 ? ch[2] - ch[0] : 0)), at + e * bt / 4, bt / 4 * 0.8, 0.05 * grow, 2200, e % 2 ? 0.3 : -0.3, 0.35);
            if (k >= intro) {
              kick(at, 0.95 * grow); kick(at + 1.5 * bt, 0.7 * grow); if (k >= 2) kick(at + 2.5 * bt, 0.6 * grow);
              snare(at + 3 * bt, 0.25 * grow, 0.6, 1);
            }
            if (k >= 2 && k % 2 === 0) saw(hz(ch[0] + 12), at, br * 1.9, 0.045 * grow, 1500, 0, 0.6, null, 0.8);
          }
        }
      }
      if (style === 'bright') {
        // Original "bright" loop: Dmaj7 – A – Bm7 – G/B at 100 BPM. Pluck arpeggio, light beat, a bell motif.
        const b2 = 60 / 100, bar2 = b2 * 4;
        const CH = [[62, 66, 69, 73], [61, 64, 69, 71], [59, 62, 66, 69], [59, 62, 67, 71]], BS = [38, 45, 47, 43];
        const MOTIF = [[0, 81], [1.5, 78], [2, 76], [3, 74]];
        for (let k = 0; k * bar2 < D; k++) {
          const at = t0 + k * bar2, ch = CH[k % 4];
          for (const m of ch) for (const d of [-6, 6]) pad(hz(m), at, bar2 + 0.3, 0.022, padBus, d);
          for (const b of [0, 2, 2.75]) voice('sine', hz(BS[k % 4]), at + b * b2, b2 * 1.1, 0.24, 0.02);
          const arp = [ch[0], ch[1], ch[2], ch[3], ch[2] + 12, ch[3], ch[2], ch[1]];
          arp.forEach((m, e) => strike(hz(m + 12), at + e * b2 / 2, 0.42, k >= 1 ? 0.05 : 0.035));
          if (k >= 1) {
            for (const b of [0, 1, 2, 3]) kick(at + b * b2);
            for (const b of [1, 3]) hit(at + b * b2, 0.16, 0.1, 'bandpass', 1500);
            for (let e = 0; e < 16; e++) hit(at + e * b2 / 4, 0.035, e % 4 === 2 ? 0.035 : 0.018, 'highpass', 8000);
          }
          if (k >= 3 && k % 2 === 1) for (const [b, m] of MOTIF) strike(hz(m), at + b * b2, 1.4, 0.045);
        }
      } else if (style === 'calm') {
        // Original "calm" piano: Fmaj7 – Am7 – Dm9 – B♭maj7 at 72 BPM. Broken chords, a low pad, no drums.
        const b3 = 60 / 72, bar3 = b3 * 4;
        const CH = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 57, 60, 64], [46, 53, 57, 62]], BS = [41, 45, 38, 46];
        for (let k = 0; k * bar3 < D; k++) {
          const at = t0 + k * bar3, ch = CH[k % 4];
          for (const m of ch) for (const d of [-5, 5]) pad(hz(m), at, bar3 + 0.4, 0.03, padBus, d);
          voice('sine', hz(BS[k % 4]), at, bar3 * 0.95, 0.36, 0.05);
          const run = [ch[0], ch[1], ch[2], ch[3], ch[2] + 12, ch[3] + 12, ch[2] + 12, ch[3]];
          run.forEach((m, e) => strike(hz(m + 12), at + e * b3 / 2, 2.4, e === 0 ? 0.13 : 0.095));
          if (k % 2 === 1) strike(hz(ch[3] + 24), at + 3 * b3, 2.8, 0.06);
        }
      }
      if (['drive', 'synthwave', 'trap', 'cinematic'].includes(style)) energetic(style);
      for (let k = 0; style === 'lofi' && k * bar < D; k++) {
        const at = t0 + k * bar, chord = CHORDS[k % 4];
        for (const m of chord) for (const d of [-7, 7]) pad(hz(m), at, bar + 0.3, 0.03, padBus, d);
        for (const b of [0, 1.5, 2]) voice('sine', hz(BASS[k % 4]), at + b * beat, beat * 1.2, 0.22, 0.02);
        if (k >= 1) {
          for (const b of [0, 2, 2.5]) kick(at + b * beat);
          for (const b of [1, 3]) hit(at + b * beat, 0.18, 0.12, 'bandpass', 1800);
          for (let e = 0; e < 8; e++) hit(at + e * beat / 2, 0.05, e % 2 ? 0.03 : 0.05, 'highpass', 7000);
        }
        if (k >= 2) {
          const arp = [chord[0], chord[2], chord[3], chord[1] + 12, chord[3], chord[2], chord[1], chord[2]];
          arp.forEach((m, e) => voice('triangle', hz(m + 12), at + e * beat / 2, 0.45, 0.045));
        }
      }
      // Key moments (`music.hits`): a noise riser sweeps up into a punchy impact exactly on the beat of the picture.
      for (const { from, at } of hitWindows(M.hits ?? [], D)) {
        const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
        s.buffer = noise; s.loop = true; f.type = 'bandpass'; f.Q.value = 1.2;
        f.frequency.setValueAtTime(500, t0 + from); f.frequency.exponentialRampToValueAtTime(7000, t0 + at);
        g.gain.setValueAtTime(0.0001, t0 + from); g.gain.exponentialRampToValueAtTime(0.16, t0 + at - 0.02); g.gain.linearRampToValueAtTime(0, t0 + at);
        s.connect(f); f.connect(g); g.connect(master); s.start(t0 + from); s.stop(t0 + at + 0.05);
        const b = ac.createOscillator(), bg = ac.createGain();             // the boom
        b.frequency.setValueAtTime(140, t0 + at); b.frequency.exponentialRampToValueAtTime(38, t0 + at + 0.5);
        bg.gain.setValueAtTime(0.7, t0 + at); bg.gain.exponentialRampToValueAtTime(0.0001, t0 + at + 0.9);
        b.connect(bg); bg.connect(master); b.start(t0 + at); b.stop(t0 + at + 1);
        const c = ac.createBufferSource(), cf = ac.createBiquadFilter(), cg = ac.createGain(); // the crash
        c.buffer = noise; cf.type = 'highpass'; cf.frequency.value = 3500;
        cg.gain.setValueAtTime(0.22, t0 + at); cg.gain.exponentialRampToValueAtTime(0.0001, t0 + at + 1.4);
        c.connect(cf); cf.connect(cg); cg.connect(master); c.start(t0 + at); c.stop(t0 + at + 1.5);
      }
      // Clock ticks (woodblock-ish) and a two-note "time's up" ding.
      for (const tt of M.ticks ?? []) { voice('square', 1760, t0 + tt, 0.06, 0.05, 0.002, master); voice('sine', 880, t0 + tt, 0.08, 0.12, 0.002, master); }
      if (M.ding != null) for (const [m, p, d] of [[79, 0.14, 0], [84, 0.14, 0.18]]) voice('sine', hz(m), t0 + M.ding + d, 1.2, p, 0.005, master);
      if (M.chime != null) for (const [m, p] of [[84, 0.11], [91, 0.06], [96, 0.03]]) voice('sine', hz(m), t0 + M.chime, 1.6, p, 0.005, master);
      // Sonification: each tone's loudness follows its gain(t), so the maths is heard as well as seen.
      for (const T of M.tones ?? []) {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = T.type ?? 'sine'; o.frequency.value = T.hz;
        g.gain.setValueAtTime(0, t0);
        g.gain.setValueCurveAtTime(toneCurve(T.gain, T.t0, T.t1).map(v => v * T.peak), t0 + T.t0, T.t1 - T.t0);
        o.connect(g); g.connect(master); o.start(t0 + T.t0); o.stop(t0 + T.t1 + 0.05);
      }
    }

    // ---- playback + recording ----------------------------------------------
    function play(startAt = performance.now()) {
      const D = config.duration;
      return new Promise(res => {
        const tick = () => { const t = (performance.now() - startAt) / 1000; frame(Math.max(0, Math.min(t, D))); t < D ? requestAnimationFrame(tick) : res(); };
        requestAnimationFrame(tick);
      });
    }
    async function preview() {
      const ac = new AudioContext(); await ac.resume();
      const lead = 0.15; if (config.music !== null) music(ac, ac.destination, ac.currentTime + lead);
      await play(performance.now() + lead * 1000); setTimeout(() => ac.close(), 500);
    }
    async function record() {
      const mimeType = 'video/mp4;codecs=avc1.640028,mp4a.40.2';
      if (!MediaRecorder.isTypeSupported(mimeType)) throw new Error('This browser cannot record H.264 + AAC MP4. Use Microsoft Edge or Chrome.');
      const ac = new AudioContext(); await ac.resume();
      const dest = ac.createMediaStreamDestination();
      const stream = new MediaStream([...cv.captureStream(30).getVideoTracks(), ...dest.stream.getAudioTracks()]), chunks = [];
      const rec = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 12_000_000, audioBitsPerSecond: 192_000 });
      rec.ondataavailable = e => e.data.size && chunks.push(e.data);
      const stopped = new Promise(r => rec.onstop = r);
      frame(0); rec.start(250);
      // Audio and picture share one start instant, slightly in the future so both are scheduled in time.
      const lead = 0.15; if (config.music !== null) music(ac, dest, ac.currentTime + lead);
      await play(performance.now() + lead * 1000);
      await new Promise(r => setTimeout(r, 300)); rec.stop(); await stopped; ac.close();
      return new Blob(chunks, { type: 'video/mp4' });
    }
    // The music alone, rendered offline (faster than real time, sample-exact, starting at t = 0).
    async function musicWav() {
      const sr = 48000, ac = new OfflineAudioContext(2, Math.ceil(config.duration * sr), sr);
      if (config.music !== null) music(ac, ac.destination, 0);
      const out = await ac.startRendering();
      return new Blob([wav([out.getChannelData(0), out.getChannelData(1)], sr)], { type: 'audio/wav' });
    }
    const pngBlob = () => new Promise(r => cv.toBlob(r, 'image/png'));
    function coverBlob() { prepare(config.lines); frame(config.cover.t, config.cover); return pngBlob(); }
    function slideBlob(i) { slide(i); return pngBlob(); }

    // ---- page wiring --------------------------------------------------------
    async function toBase64(blob) {
      const buf = new Uint8Array(await blob.arrayBuffer()); let s = '';
      for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      return btoa(s);
    }
    function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); }
    const status = m => document.getElementById('status').textContent = m;
    const bar = document.getElementById('bar');
    const button = (label, fn) => { const b = document.createElement('button'); b.textContent = label; b.onclick = fn; bar.append(b); };

    async function ready() {
      await Promise.all(['600 40px Cambria', '40px "Cambria Math"', `800 40px "Segoe UI"`, `700 40px "Segoe UI"`,
        `400 40px "Segoe UI Variable Display"`, `600 40px "Segoe UI Variable Display"`, `700 40px "Segoe UI Variable Display"`].map(f => document.fonts.load(f)));
      await Promise.all(Object.entries(config.images ?? {}).map(([k, src]) => new Promise((res, rej) => {
        const im = new Image(); im.onload = () => { images[k] = im; res(); }; im.onerror = () => rej(new Error('missing image ' + src)); im.src = src;
      })));
      if (config.slides) slide(0); else { prepare(config.lines); frame(0); }
    }

    window.reelReady = ready();
    if (config.slides) {
      config.slides.forEach((_, i) => button(`Download slide ${i + 1}`, async () => download(await slideBlob(i), `${config.name}-${i + 1}.png`)));
      window.renderSlide = async i => toBase64(await slideBlob(i));
      window.slideCount = config.slides.length;
      window.renderFrame = i => { slide(i); return cv.toDataURL('image/png').split(',')[1]; };
    } else {
      button('Play preview (with music)', () => preview());
      button('Record & download MP4', async () => {
        try { status(`Recording… keep this tab visible for ${config.duration} seconds.`); download(await record(), `${config.name}.mp4`); status(`Saved ${config.name}.mp4`); }
        catch (e) { status(e.message); }
      });
      if (config.cover) button('Download cover PNG', async () => download(await coverBlob(), `${config.name}-cover.png`));
      window.renderReel = async () => toBase64(await record());
      window.renderCover = async () => toBase64(await coverBlob());
      window.renderMusic = async () => toBase64(await musicWav());
      window.renderFrame = t => { frame(t); return cv.toDataURL('image/png').split(',')[1]; };
      window.frame = frame;
    }
    window.prepare = () => prepare(config.lines);
  }

  window.Reel = { mount, WHITE, LAB, palette, toneCurve, wav, hitWindows, MUSIC_STYLES };
})();
