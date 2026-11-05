/* =========================================================
   Mathe-Arena – Grundbausteine
   Zufall, Brüche, deutsche Zahlformatierung, SVG-Helfer
   ========================================================= */
var MA = (window.MA = window.MA || {});
MA.topics = MA.topics || [];
MA.registerTopic = function (t) {
  t.tags = t.tags || [];
  MA.topics.push(t);
};

(function () {
  const U = (MA.U = {});
  const r1 = (v) => Math.round(v * 10) / 10;
  U.r1 = r1;

  /* ---------- Zufall ---------- */
  U.ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  U.rnz = (a, b) => { let v; do v = U.ri(a, b); while (v === 0); return v; };
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.chance = (p) => Math.random() < p;
  U.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  U.sample = (arr, n) => U.shuffle(arr).slice(0, n);

  /* ---------- Zahlentheorie & Brüche ---------- */
  U.gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  U.lcm = (a, b) => Math.abs(a * b) / U.gcd(a, b);
  U.frac = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = U.gcd(n, d); return { n: n / g, d: d / g }; };
  U.fval = (f) => f.n / f.d;
  U.fadd = (a, b) => U.frac(a.n * b.d + b.n * a.d, a.d * b.d);
  U.fsub = (a, b) => U.frac(a.n * b.d - b.n * a.d, a.d * b.d);
  U.fmul = (a, b) => U.frac(a.n * b.n, a.d * b.d);
  U.fdiv = (a, b) => U.frac(a.n * b.d, a.d * b.n);

  /* ---------- Runden & Formatieren (deutsch) ---------- */
  U.round = (x, d = 0) => {
    const f = Math.pow(10, d);
    const s = x < 0 ? -1 : 1;
    const r = (s * Math.round(Math.abs(x) * f + 1e-7)) / f;
    return r === 0 ? 0 : r;
  };
  U.fmt = (x, d = 2) => {
    const r = U.round(x, d);
    const s = Math.abs(r).toLocaleString('de-DE', { maximumFractionDigits: d });
    return (r < 0 ? '−' : '') + s;
  };
  U.fix = (x, d = 2) => {
    const r = U.round(x, d);
    return (r < 0 ? '−' : '') + Math.abs(r).toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  U.euro = (x) => (Number.isInteger(U.round(x, 2)) ? U.fmt(x, 0) : U.fix(x, 2)) + ' €';
  U.par = (x) => (x < 0 ? '(' + U.fmt(x, 4) + ')' : U.fmt(x, 4));
  U.F = (n, d) => {
    if (typeof n === 'string' || typeof d === 'string') return `<span class="fr"><span>${n}</span><span>${d}</span></span>`;
    if (d === 1) return U.fmt(n, 0);
    return `${n < 0 ? '−' : ''}<span class="fr"><span>${Math.abs(n)}</span><span>${d}</span></span>`;
  };
  U.Ff = (f) => U.F(f.n, f.d);
  U.ft = (f) => (f.d === 1 ? U.fmt(f.n, 0) : (f.n < 0 ? '−' : '') + Math.abs(f.n) + '/' + f.d);
  /* gemischte Zahl als HTML */
  U.mixed = (f) => {
    if (Math.abs(f.n) < f.d || f.n % f.d === 0) return U.Ff(f);
    const w = Math.trunc(f.n / f.d), r = Math.abs(f.n % f.d);
    return (f.n < 0 ? '−' : '') + Math.abs(w) + ' ' + U.F(r, f.d);
  };

  /* linearer Term a·x + b */
  U.lin = (a, b, v = 'x') => {
    let s = '';
    if (a !== 0) s = (a === 1 ? '' : a === -1 ? '−' : U.fmt(a, 4)) + v;
    if (b !== 0 || a === 0) {
      if (s) s += b < 0 ? ' − ' + U.fmt(-b, 4) : ' + ' + U.fmt(b, 4);
      else s = U.fmt(b, 4);
    }
    return s;
  };
  /* linearer Term mit Bruch-Steigung m = {n,d} */
  U.linF = (m, b, v = 'x') => {
    if (m.d === 1) return U.lin(m.n, b, v);
    let s = (m.n < 0 ? '−' : '') + U.F(Math.abs(m.n), m.d) + v;
    if (b !== 0) s += b < 0 ? ' − ' + U.fmt(-b, 4) : ' + ' + U.fmt(b, 4);
    return s;
  };
  /* Polynom aus Koeffizienten (höchster Grad zuerst) */
  const SUP = { 2: '²', 3: '³', 4: '⁴' };
  U.poly = (cs, v = 'x') => {
    const deg = cs.length - 1;
    let s = '';
    cs.forEach((c, i) => {
      const p = deg - i;
      if (c === 0) return;
      const abs = Math.abs(c);
      const coef = abs === 1 && p > 0 ? '' : U.fmt(abs, 4);
      const vv = p === 0 ? '' : p === 1 ? v : v + (SUP[p] || '^' + p);
      const term = coef + vv;
      if (!s) s = (c < 0 ? '−' : '') + term;
      else s += (c < 0 ? ' − ' : ' + ') + term;
    });
    return s || '0';
  };

  /* ---------- Eingabe lesen ---------- */
  U.parse = (str, pctAsNumber) => {
    let s = String(str).trim().replace(/\s+/g, ' ').replace(/[−–]/g, '-');
    if (!s) return NaN;
    let pct = false;
    if (s.endsWith('%')) { pct = true; s = s.slice(0, -1).trim(); }
    let v;
    const mixed = s.match(/^(-?)(\d+) (\d+)\/(\d+)$/);
    if (mixed) {
      v = (mixed[1] ? -1 : 1) * (+mixed[2] + +mixed[3] / +mixed[4]);
    } else if (s.includes('/')) {
      const parts = s.split('/');
      if (parts.length !== 2) return NaN;
      const a = U.parse(parts[0]), b = U.parse(parts[1]);
      v = b === 0 ? NaN : a / b;
    } else {
      s = s.replace(/ /g, '');
      if (/^-?[1-9]\d{0,2}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
      else s = s.replace(',', '.');
      if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
      v = parseFloat(s);
    }
    return pct && !pctAsNumber ? v / 100 : v;
  };

  /* ---------- Multiple Choice ---------- */
  U.strip = (h) => String(h).replace(/<[^>]+>/g, '|').replace(/\s+/g, '');
  U.choice = (t, correct, wrongs) => {
    const seen = new Set([U.strip(correct)]);
    const first = { h: correct };
    const opts = [first];
    for (const w of wrongs) {
      const o = typeof w === 'string' ? { h: w } : w;
      const k = U.strip(o.h);
      if (seen.has(k)) continue;
      seen.add(k);
      opts.push(o);
      if (opts.length >= 4) break;
    }
    const sh = U.shuffle(opts);
    t.type = 'choice';
    t.options = sh.map((o) => o.h);
    t.answer = sh.indexOf(first);
    t.mistakes = sh.map((o, i) => (o.msg ? { v: i, msg: o.msg } : null)).filter(Boolean);
    return t;
  };

  U.names = ['Lena', 'Can', 'Mia', 'Jonas', 'Aylin', 'Luca', 'Emma', 'Noah', 'Sofia', 'Elias', 'Hanna', 'Ben', 'Zeynep', 'Paul', 'Lea', 'Milan', 'Amira', 'Tim', 'Nele', 'Finn', 'Mara', 'Yusuf'];
  U.name = () => U.pick(U.names);

  /* ---------- SVG ---------- */
  U.svg = (w, h, inner, cls = '') =>
    `<svg class="task-svg ${cls}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  U.t = (x, y, s, cls = 'sv-t', extra = '') => `<text x="${r1(x)}" y="${r1(y)}" class="${cls}" ${extra}>${s}</text>`;
  U.line = (x1, y1, x2, y2, cls = 'sv-l') => `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" class="${cls}"/>`;
  U.poly2 = (pts, cls = 'sv-shape') => `<polygon points="${pts.map((p) => r1(p[0]) + ',' + r1(p[1])).join(' ')}" class="${cls}"/>`;
  /* Beschriftung mittig an einer Strecke, nach außen versetzt */
  U.edgeLabel = (p, q, s, off = 16, center) => {
    const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    let nx = -(q[1] - p[1]), ny = q[0] - p[0];
    const len = Math.hypot(nx, ny) || 1;
    nx /= len; ny /= len;
    if (center) { // vom Zentrum weg zeigen
      if ((mx - center[0]) * nx + (my - center[1]) * ny < 0) { nx = -nx; ny = -ny; }
    }
    return U.t(mx + nx * off, my + ny * off + 5, s, 'sv-t sv-mid');
  };
  U.rightMark = (c, p, q, s = 14) => {
    const u = [(p[0] - c[0]), (p[1] - c[1])], v = [(q[0] - c[0]), (q[1] - c[1])];
    const lu = Math.hypot(...u), lv = Math.hypot(...v);
    const a = [c[0] + (u[0] / lu) * s, c[1] + (u[1] / lu) * s];
    const b = [c[0] + (v[0] / lv) * s, c[1] + (v[1] / lv) * s];
    const d = [a[0] + (v[0] / lv) * s, a[1] + (v[1] / lv) * s];
    return `<polyline points="${r1(a[0])},${r1(a[1])} ${r1(d[0])},${r1(d[1])} ${r1(b[0])},${r1(b[1])}" class="sv-thin" fill="none"/><circle cx="${r1((c[0] + d[0]) / 2)}" cy="${r1((c[1] + d[1]) / 2)}" r="1.8" class="sv-dot"/>`;
  };
  /* Winkelbogen an Ecke c zwischen Richtungen zu p und q */
  U.angleArc = (c, p, q, r = 28, label = '', cls = 'sv-arc') => {
    let a1 = Math.atan2(p[1] - c[1], p[0] - c[0]);
    let a2 = Math.atan2(q[1] - c[1], q[0] - c[0]);
    let diff = a2 - a1;
    while (diff <= -Math.PI) diff += 2 * Math.PI;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    const x1 = c[0] + r * Math.cos(a1), y1 = c[1] + r * Math.sin(a1);
    const x2 = c[0] + r * Math.cos(a1 + diff), y2 = c[1] + r * Math.sin(a1 + diff);
    const sweep = diff > 0 ? 1 : 0;
    const mid = a1 + diff / 2;
    const lr = r + 16;
    return `<path d="M${r1(x1)} ${r1(y1)} A${r} ${r} 0 0 ${sweep} ${r1(x2)} ${r1(y2)}" class="${cls}" fill="none"/>` +
      (label ? U.t(c[0] + lr * Math.cos(mid), c[1] + lr * Math.sin(mid) + 5, label, 'sv-t sv-mid sv-acc') : '');
  };

  /* Koordinatensystem */
  U.plane = (o) => {
    const W = o.w || 340, H = o.h || 340, pad = o.pad || 26;
    const sx = (W - 2 * pad) / (o.xmax - o.xmin), sy = (H - 2 * pad) / (o.ymax - o.ymin);
    const X = (x) => r1(pad + (x - o.xmin) * sx), Y = (y) => r1(H - pad - (y - o.ymin) * sy);
    const ix = (px) => o.xmin + (px - pad) / sx, iy = (py) => o.ymin + (H - pad - py) / sy;
    let g = '';
    for (let x = Math.ceil(o.xmin); x <= o.xmax; x++) g += U.line(X(x), Y(o.ymin), X(x), Y(o.ymax), 'sv-grid');
    for (let y = Math.ceil(o.ymin); y <= o.ymax; y++) g += U.line(X(o.xmin), Y(y), X(o.xmax), Y(y), 'sv-grid');
    const ax = o.ymin <= 0 && o.ymax >= 0 ? Y(0) : Y(o.ymin);
    const ay = o.xmin <= 0 && o.xmax >= 0 ? X(0) : X(o.xmin);
    g += U.line(X(o.xmin), ax, X(o.xmax) + 10, ax, 'sv-axis');
    g += U.line(ay, Y(o.ymin), ay, Y(o.ymax) - 10, 'sv-axis');
    g += `<polygon points="${X(o.xmax) + 14},${ax} ${X(o.xmax) + 5},${ax - 5} ${X(o.xmax) + 5},${ax + 5}" class="sv-axhead"/>`;
    g += `<polygon points="${ay},${Y(o.ymax) - 14} ${ay - 5},${Y(o.ymax) - 5} ${ay + 5},${Y(o.ymax) - 5}" class="sv-axhead"/>`;
    const lx = o.lab || (o.xmax - o.xmin > 12 ? 2 : 1);
    const ly = o.laby || (o.ymax - o.ymin > 12 ? 2 : 1);
    for (let x = Math.ceil(o.xmin); x <= o.xmax; x++) if (x !== 0 && x % lx === 0) g += U.t(X(x), ax + 16, U.fmt(x), 'sv-ax sv-mid');
    for (let y = Math.ceil(o.ymin); y <= o.ymax; y++) if (y !== 0 && y % ly === 0) g += U.t(ay - 6, Y(y) + 4, U.fmt(y), 'sv-ax sv-end');
    if (o.xmin === 0 && o.ymin === 0) g += U.t(ay - 6, ax + 16, '0', 'sv-ax sv-end');
    g += U.t(X(o.xmax) + 8, ax - 9, 'x', 'sv-ax sv-axname');
    g += U.t(ay + 9, Y(o.ymax) - 4, 'y', 'sv-ax sv-axname');
    const cid = 'c' + Math.random().toString(36).slice(2, 9);
    const clip = `<clipPath id="${cid}"><rect x="${X(o.xmin)}" y="${Y(o.ymax)}" width="${r1(X(o.xmax) - X(o.xmin))}" height="${r1(Y(o.ymin) - Y(o.ymax))}"/></clipPath>`;
    return {
      W, H, X, Y, ix, iy, o, base: g,
      curve(fn, cls = 'sv-c1') {
        let d = '';
        const n = 260;
        let pen = false;
        for (let i = 0; i <= n; i++) {
          const x = o.xmin + (i * (o.xmax - o.xmin)) / n;
          const y = fn(x);
          if (!isFinite(y) || y > o.ymax + 50 || y < o.ymin - 50) { pen = false; continue; }
          d += (pen ? 'L' : 'M') + X(x) + ' ' + Y(y);
          pen = true;
        }
        return `<path d="${d}" class="${cls}" clip-path="url(#${cid})" fill="none"/>`;
      },
      point(x, y, label, cls = 'sv-pt') {
        return `<circle cx="${X(x)}" cy="${Y(y)}" r="5.5" class="${cls}"/>` + (label ? U.t(X(x) + 8, Y(y) - 8, label, 'sv-lbl') : '');
      },
      wrap(inner, cls) { return U.svg(W, H, `<defs>${clip}</defs>` + g + inner, 'plane ' + (cls || o.cls || '')); },
    };
  };

  /* Kreissektor (Grad, im Uhrzeigersinn ab 12 Uhr) */
  U.sector = (cx, cy, r, a0, a1) => {
    const p = (a) => [cx + r * Math.sin((a * Math.PI) / 180), cy - r * Math.cos((a * Math.PI) / 180)];
    if (a1 - a0 >= 359.99) return `M${cx - r} ${cy} A${r} ${r} 0 1 1 ${cx + r} ${cy} A${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M${cx} ${cy} L${r1(x0)} ${r1(y0)} A${r} ${r} 0 ${large} 1 ${r1(x1)} ${r1(y1)} Z`;
  };

  /* Pizza mit d Stücken, k davon belegt */
  U.pizza = (d, k, cls = '') => {
    const cx = 110, cy = 110, r = 92;
    let s = `<circle cx="${cx}" cy="${cy}" r="102" class="pz-crust"/>`;
    for (let i = 0; i < d; i++) {
      const a0 = (360 / d) * i, a1 = (360 / d) * (i + 1);
      s += `<path d="${U.sector(cx, cy, r, a0, a1)}" class="${i < k ? 'pz-top' : 'pz-dough'}"/>`;
      if (i < k) {
        const am = ((a0 + a1) / 2) * (Math.PI / 180);
        const rs = d > 8 ? 7 : 11;
        const dist = d > 8 ? [0.68] : [0.68, 0.36];
        dist.forEach((f) => {
          s += `<circle cx="${r1(cx + r * f * Math.sin(am))}" cy="${r1(cy - r * f * Math.cos(am))}" r="${rs}" class="pz-salami"/>`;
        });
      }
    }
    for (let i = 0; i < d; i++) {
      const a = ((360 / d) * i * Math.PI) / 180;
      s += U.line(cx, cy, cx + r * Math.sin(a), cy - r * Math.cos(a), 'pz-cut');
    }
    return U.svg(220, 220, s, 'pizza ' + cls);
  };

  /* Wertetabelle als HTML */
  U.table = (head, rows) =>
    `<table class="vtable"><tbody>${[head, ...rows]
      .map((r, i) => `<tr>${r.map((c) => (i === 0 ? `<th>${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`)
      .join('')}</tbody></table>`;
  U.htable = (rowHeads, rows) =>
    `<table class="vtable h"><tbody>${rows.map((r, i) => `<tr><th>${rowHeads[i]}</th>${r.map((c) => `<td class="${c === '?' ? 'q' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

  U.expr = (e) => `<div class="expr">${e}</div>`;
})();
