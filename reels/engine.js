// ---------------------------------------------------------------------------
// Reel engine: draws a reel (1080×1920) or a carousel (1080×1350 slides) on a canvas from a
// plain config object, plays it with an original synthesised music bed, and records H.264 + AAC
// MP4 in Edge/Chrome. Extracted from nda-maths-001.render.html (which stays standalone).
//
// A page defines its content and calls Reel.mount(config). Config fields:
//   name, size: [W, H], duration (s)          — reels only
//   theme:    'white'                          — optional: premium soft-white board for animated graphs:
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
//   music:    { chime?: t, ticks?: [t…], ding?: t } | null
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
  const tint = (hex, a) => `rgba(${[1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(', ')}, ${a})`;

  const clamp01 = v => Math.max(0, Math.min(1, v));
  const ease = p => p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
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
    const white = config.theme === 'white';
    const ink = white ? WHITE.ink : INK, red = white ? WHITE.red : RED;

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
      g.addColorStop(0, WHITE.board); g.addColorStop(1, WHITE.edge);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (!mark || config.watermarkY === null) return;
      ctx.fillStyle = tint(WHITE.muted, 0.55); ctx.font = `600 34px ${UI}`; ctx.textAlign = 'left';
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
        ctx.fillStyle = WHITE.ink; lines.forEach((l, i) => ctx.fillText(l, W / 2, y - (lines.length - 1) * lh / 2 + i * lh));
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
      ctx.save(); ctx.shadowColor = tint(WHITE.ink, shade); ctx.shadowBlur = 48; ctx.shadowOffsetY = 16;
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); ctx.restore();
    }
    // Options as pills, centred on the page. From `at`, the answer chip fills with the accent and pulses once.
    function chips(t, { labels, y, answer, at, size = 44, w = 180, h = 72, gap = 20 }) {
      const x0 = W / 2 - (labels.length * w + (labels.length - 1) * gap) / 2;
      const on = at == null ? 0 : prog(t, at, 0.6), pulse = at == null ? 0 : Math.sin(Math.PI * clamp01((t - at) / 0.7));
      labels.forEach((label, i) => {
        const hit = i === answer && on > 0, s = hit ? 1 + 0.07 * pulse : 1;
        ctx.save(); ctx.translate(x0 + i * (w + gap) + w / 2, y + h / 2); ctx.scale(s, s);
        ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
        if (hit) { ctx.fillStyle = tint(WHITE.amber, 0.12 * on); ctx.fill(); }
        ctx.strokeStyle = hit ? tint(WHITE.amber, 0.25 + 0.6 * on) : tint(WHITE.ink, 0.14); ctx.lineWidth = hit ? 2 + on : 2; ctx.stroke();
        ctx.fillStyle = hit && on > 0.5 ? WHITE.amber : ink; ctx.font = hand(size); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(label, 0, 2); ctx.restore();
      });
    }
    function softStroke(path, color, width) {
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color; ctx.lineWidth = width;
      ctx.shadowColor = tint(color, 0.28); ctx.shadowBlur = 14; ctx.shadowOffsetY = 4; ctx.stroke(path); ctx.restore();
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

    const api = { ctx, W, H, INK: ink, RED: red, UI, SOFT_UI, card, chips, softStroke, hand, prog, ease, clamp01, strokePartial, roundedPath, arrowHead, bubble, caption,
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

      const noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), nd = noise.getChannelData(0);
      for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      const voice = (type, f, at, len, peak, attack = 0.01, dest = master) => {
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
        s.connect(f); f.connect(g); g.connect(master); s.start(at); s.stop(at + len + 0.05);
      };
      const kick = at => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.frequency.setValueAtTime(110, at); o.frequency.exponentialRampToValueAtTime(42, at + 0.22);
        g.gain.setValueAtTime(0.55, at); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.32);
        o.connect(g); g.connect(master); o.start(at); o.stop(at + 0.4);
      };
      const padBus = ac.createBiquadFilter(); padBus.type = 'lowpass'; padBus.frequency.value = 950; padBus.connect(master);
      for (let k = 0; k * bar < D; k++) {
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
      // Clock ticks (woodblock-ish) and a two-note "time's up" ding.
      for (const tt of M.ticks ?? []) { voice('square', 1760, t0 + tt, 0.06, 0.05, 0.002); voice('sine', 880, t0 + tt, 0.08, 0.12, 0.002); }
      if (M.ding != null) for (const [m, p, d] of [[79, 0.14, 0], [84, 0.14, 0.18]]) voice('sine', hz(m), t0 + M.ding + d, 1.2, p, 0.005);
      if (M.chime != null) for (const [m, p] of [[84, 0.11], [91, 0.06], [96, 0.03]]) voice('sine', hz(m), t0 + M.chime, 1.6, p, 0.005);
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
      window.renderFrame = t => { frame(t); return cv.toDataURL('image/png').split(',')[1]; };
      window.frame = frame;
    }
    window.prepare = () => prepare(config.lines);
  }

  window.Reel = { mount, WHITE };
})();
