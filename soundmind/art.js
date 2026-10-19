/* Sound Mind line drawings for story carousels.
 * Each entry is the inside of an <svg viewBox="0 0 600 600">. Strokes use currentColor (the ink);
 * fills use the soft sage / warm tones below. card.html adds a slight hand-drawn wobble.
 * The names are the art catalogue that cards.js validates against.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SoundMindArt = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const LEAF = "#DCE8D3", SAGE = "#8FAE8B", WARM = "#EBC097", SOIL = "#D9C7AE", SKY = "#E8EEF0";
  const g = (body) => `<g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;

  // ---------------------------------------------------------------- kettle

  const stove = `<path d="M130 492 H470" stroke-width="10"/>`;
  const kettleBody = `
    <path d="M190 470 Q160 340 235 280 H365 Q440 340 410 470 Z" fill="${LEAF}"/>
    <path d="M245 280 Q300 240 355 280"/><circle cx="300" cy="248" r="11" fill="${SAGE}"/>
    <path d="M222 292 Q300 150 378 292"/>
    <path d="M412 410 Q462 392 482 330 L500 340 Q488 410 420 440"/>`;
  const flames = (h) => [250, 300, 350].map((x) =>
    `<path d="M${x} 488 q-${h * 0.45} -${h * 0.55} 0 -${h} q${h * 0.45} ${h * 0.45} 0 ${h} Z" fill="${WARM}" stroke-width="5"/>`).join("");
  const steam = [0, 34, 68].map((dx) =>
    `<path d="M${490 + dx} ${300 - dx / 3} q-16 -26 0 -52 q16 -26 0 -52" stroke-width="6"/>`).join("");
  const bubble = (x, y, w, word) => `
    <rect x="${x}" y="${y}" width="${w}" height="74" rx="30" fill="#FFFFFF"/>
    <path d="M${x + w / 2 - 10} ${y + 74} l-6 26 l26 -26" fill="#FFFFFF"/>
    <text x="${x + w / 2}" y="${y + 50}" text-anchor="middle" font-family="Kalam" font-size="40" fill="currentColor" stroke="none">${word}</text>`;

  // ---------------------------------------------------------------- plant

  const pot = (x = 300, y = 470) => `
    <path d="M${x - 62} ${y} H${x + 62} L${x + 48} ${y + 95} H${x - 48} Z" fill="${SOIL}"/>
    <rect x="${x - 74}" y="${y - 22}" width="148" height="24" rx="6" fill="${SOIL}"/>`;
  const sprout = (x = 300, y = 448, leaves = 2, droop = false) => {
    const tip = y - 80;
    let s = `<path d="M${x} ${y} Q${x - 6} ${y - 40} ${x} ${tip}"/>`;
    const d = droop ? 1 : -1;
    s += `<path d="M${x} ${tip + 20} q-50 ${d * 10} -66 ${d * 38} q42 ${d * 8} 66 ${-d * 30}" fill="${LEAF}"/>`;
    if (leaves > 1) s += `<path d="M${x} ${tip + 4} q50 ${d * 6} 64 ${d * 36} q-44 ${d * 10} -64 ${-d * 28}" fill="${LEAF}"/>`;
    return s;
  };
  const windowFrame = `
    <rect x="130" y="70" width="340" height="290" rx="8" fill="${SKY}"/>
    <path d="M300 70 V360 M130 215 H470"/>
    <circle cx="395" cy="140" r="34" fill="${WARM}" stroke-width="5"/>
    <path d="M100 380 H500" stroke-width="10"/>`;
  const newLeaf = (x, y) => `
    <path d="M${x} ${y} q30 -46 76 -40 q-10 46 -76 40 Z" fill="${SAGE}"/>`;

  // ---------------------------------------------------------------- phone

  const phone = (screen = "#FFFFFF", x = 220, y = 120) => `
    <rect x="${x}" y="${y}" width="160" height="300" rx="26" fill="${LEAF}"/>
    <rect x="${x + 14}" y="${y + 30}" width="132" height="236" rx="8" fill="${screen}"/>
    <path d="M${x + 62} ${y + 284} H${x + 98}"/>`;
  const msg = (x, y, w, flip) => `
    <rect x="${x}" y="${y}" width="${w}" height="58" rx="22" fill="#FFFFFF"/>
    <path d="M${x + (flip ? w - 24 : 24)} ${y + 58} l${flip ? 14 : -14} 22 l${flip ? -6 : 26} -22" fill="#FFFFFF"/>
    <path d="M${x + 22} ${y + 29} H${x + w - 22}" stroke-width="5" stroke-dasharray="14 12"/>`;
  const battery = (fill, label) => `
    <rect x="248" y="200" width="104" height="54" rx="10" fill="#FFFFFF"/>
    <path d="M356 216 v22" stroke-width="10"/>
    ${fill > 0 ? `<rect x="258" y="210" width="${Math.max(6, 84 * fill)}" height="34" rx="4" fill="${fill < 0.2 ? WARM : SAGE}" stroke="none"/>` : ""}
    <text x="300" y="312" text-anchor="middle" font-family="Kalam" font-size="44" fill="currentColor" stroke="none">${label}</text>`;

  const ART = {
    "kettle-whistle": g(kettleBody + stove + flames(54) + steam),
    "kettle-shout": g(kettleBody + stove + flames(54) + steam + bubble(10, 100, 250, "Calm down!") + bubble(320, 50, 150, "Shh!")),
    "kettle-flame": g(`<g transform="translate(-150 -330) scale(1.5)">${kettleBody}</g>` +
      `<path d="M70 470 H530" stroke-width="10"/>` + [200, 300, 400].map((x) =>
        `<path d="M${x} 466 q-50 -60 0 -120 q50 50 0 120 Z" fill="${WARM}" stroke-width="6"/>`).join("")),
    // Kettle on the stove, and the stove's knob drawn big beside it, turned towards "low".
    "kettle-knob": g(`<g transform="translate(-70 0)">${kettleBody + stove + flames(22)}</g>` +
      `<rect x="420" y="500" width="150" height="110" rx="14" fill="${LEAF}"/>` +
      `<circle cx="495" cy="555" r="38" fill="#FFFFFF"/><path d="M495 555 L468 530" stroke-width="9"/>` +
      `<path d="M545 505 A64 64 0 0 0 440 512" stroke-width="5"/><path d="M440 512 l2 -24 M440 512 l22 8" stroke-width="5"/>` +
      `<text x="408" y="480" font-family="Kalam" font-size="38" fill="currentColor" stroke="none">low</text>`),
    "kettle-quiet": g(kettleBody + stove + flames(16) + `<path d="M500 290 q-10 -18 0 -36" stroke-width="4"/>`),

    "plant-window": g(windowFrame + pot(300, 400) + sprout(300, 378, 2)),
    "plant-moving": g(`<path d="M120 300 h-10 M110 300 l14 -12 M110 300 l14 12" stroke-width="6"/>` +
      `<g stroke-dasharray="14 14" opacity="0.5">${pot(180, 330).replace(/fill="[^"]*"/g, 'fill="none"')}</g>` +
      `<path d="M240 300 Q300 240 360 300" stroke-width="5" stroke-dasharray="10 12"/><path d="M360 300 l-6 -24 M360 300 l-24 -2" stroke-width="5"/>` +
      pot(420, 330) + sprout(420, 308, 2) + `<path d="M120 460 H520" stroke-width="10"/>`),
    "plant-droop": g(pot(300, 380) + sprout(300, 358, 2, true) + `<path d="M150 500 H450" stroke-width="10"/>`),
    "plant-roots": g(`<path d="M150 230 H450 L410 540 H190 Z" fill="${SOIL}"/><rect x="135" y="200" width="330" height="36" rx="8" fill="${SOIL}"/>` +
      sprout(300, 205, 2) +
      `<path d="M300 236 Q296 330 300 420 M300 300 Q250 330 230 400 M300 320 Q360 350 372 430 M300 380 Q270 430 250 500 M300 400 Q340 450 350 510 M232 400 l-26 40 M372 430 l24 36" stroke-width="5" stroke="${"#6E5B45"}"/>`),
    "plant-water": g(pot(330, 400) + sprout(330, 378, 2) +
      `<path d="M90 150 H230 L215 270 H105 Z" fill="${LEAF}" transform="rotate(18 160 210)"/>` +
      `<path d="M228 175 L300 140" stroke-width="10"/><path d="M110 150 Q160 90 210 150" transform="rotate(18 160 210)"/>` +
      [[312, 190], [326, 230], [304, 262], [334, 290]].map(([x, y]) => `<path d="M${x} ${y} q-7 12 0 18 q7 -6 0 -18 Z" fill="${SKY}" stroke-width="4"/>`).join("")),
    "plant-leaf": g(windowFrame + pot(300, 400) + sprout(300, 378, 2) + newLeaf(304, 290)),

    "phone-messages": g(phone() + msg(40, 120, 150, false) + msg(410, 170, 150, true) + msg(30, 300, 170, false) + msg(420, 330, 140, true) +
      `<circle cx="372" cy="130" r="26" fill="${WARM}"/><text x="372" y="142" text-anchor="middle" font-family="Kalam" font-size="32" fill="currentColor" stroke="none">12</text>`),
    "phone-ringing": g(phone() + `<path d="M180 200 q-20 40 0 80 M150 180 q-34 60 0 120 M420 200 q20 40 0 80 M450 180 q34 60 0 120" stroke-width="6"/>` +
      `<path d="M276 214 q8 -14 20 -6 l10 14 q4 8 -4 14 q10 24 28 32 q6 -8 14 -4 l14 10 q8 12 -6 20 q-60 4 -76 -80 Z" fill="${SAGE}" stroke-width="5"/>`),
    "phone-battery": g(phone() + battery(0.03, "1%")),
    "phone-dark": g(phone("#2F3A33") + `<text x="420" y="160" font-family="Kalam" font-size="52" fill="currentColor" stroke="none">. . .</text>`),
    "phone-charging": g(phone() + battery(0.7, "") +
      `<path d="M308 268 l-20 34 h24 l-20 34" stroke-width="6"/>` +
      `<path d="M300 420 V470 Q300 520 360 520 H440"/><rect x="440" y="496" width="60" height="48" rx="8" fill="${LEAF}"/><path d="M500 508 h30 M500 532 h30"/>`),
  };

  return { ART, names: Object.keys(ART) };
});
