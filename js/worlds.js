/* =========================================================
   Mathe Games: Terme & Gleichungen – die 7 Welten
   Passend zu Kapitel 1 „Terme und Gleichungen“ (Klasse 8):
   1 Ausmultiplizieren/Ausklammern · 2 Summen multiplizieren
   3 Binomische Formeln · 4 Faktorisieren · 5 Gleichungen mit
   Klammern · 6 Bruchgleichungen · 7 Formeln
   Stufen: 1 = ★ G-Niveau, 2 = ★★ M-Niveau, 3 = ★★★ E-Niveau
   ========================================================= */
(function () {
  const U = MA.U;
  const { ri, rnz, pick, lin, fmt, par, F } = U;
  MA.WORLDS = [];
  const W = (w) => MA.WORLDS.push(w);

  /* ---------- Bausteine für Lückenterme ---------- */
  const B = (i, lead) => ({ b: i, lead: !!lead });
  const T = {
    lin: (v = 'x') => [B(0, 1), v + ' ', B(1)],
    quad: (v = 'x') => [B(0, 1), v + '² ', B(1), v + ' ', B(2)],
    quadAsc: (v = 'x') => [B(0, 1), ' ', B(1), v + ' ', B(2), v + '²'],
    quadNoC: (v = 'x') => [B(0, 1), v + '² ', B(1), v],
    quadNoB: (v = 'x') => [B(0, 1), v + '² ', B(1)],
    two: () => [B(0, 1), 'a² ', B(1), 'ab ', B(2), 'b²'],
    twoNoB: () => [B(0, 1), 'a² ', B(1), 'b²'],
  };
  /* Polynome (aufsteigend: [c0, c1, c2]) */
  const pm = (p, q) => { const r = Array(p.length + q.length - 1).fill(0); p.forEach((a, i) => q.forEach((b, j) => (r[i + j] += a * b))); return r; };
  const padd = (p, q) => { const n = Math.max(p.length, q.length); return Array.from({ length: n }, (_, i) => (p[i] || 0) + (q[i] || 0)); };
  const psc = (p, k) => p.map((c) => c * k);
  const pstr = (p, v = 'x') => { const d = p.slice(); while (d.length > 1 && d[d.length - 1] === 0) d.pop(); return U.poly(d.slice().reverse(), v); };
  const same = (p, q) => { const n = Math.max(p.length, q.length); for (let i = 0; i < n; i++) if (Math.abs((p[i] || 0) - (q[i] || 0)) > 1e-9) return false; return true; };
  const br = (a, b, v = 'x') => `(${lin(a, b, v)})`;
  const brA = (b, a, v = 'x') => `(${fmt(b)} ${a < 0 ? '−' : '+'} ${Math.abs(a) === 1 ? '' : Math.abs(a)}${v})`; // (4 − x)
  const ax = (k, v = 'x') => (Math.abs(k) === 1 ? '' : Math.abs(k)) + v;
  const coef = (k, v = 'x') => (k === 1 ? v : k === -1 ? '−' + v : fmt(k) + v);
  const opx = (c) => (c > 0 ? `− ${c === 1 ? '' : c}x` : `+ ${-c === 1 ? '' : -c}x`);
  const opn = (b) => (b > 0 ? `− ${b}` : `+ ${-b}`);
  const E = (s) => `<div class="expr">${s}</div>`;
  const tpl = (q, parts, answer, o = {}) => Object.assign({ type: 'tpl', q, tpl: parts, answer }, o);
  const num = (q, answer, o = {}) => Object.assign({ type: 'num', q, answer }, o);

  /* Rechteck-Modell (Flächenmodell) für (a + b)(c + d) */
  function areaModel(top, left, cells) {
    const c = (t, cls = '') => `<div class="am-c ${cls}">${t}</div>`;
    return `<div class="area-model"><div></div>${top.map((t) => c(t, 'am-h')).join('')}${left.map((l, i) => c(l, 'am-h') + top.map((_, j) => c(cells ? cells[i][j] : '?', 'am-cell s' + ((i + j) % 3))).join('')).join('')}</div>`;
  }

  /* Gleichungs-Schritte (lineare Gleichung A·x + B = C·x + D) */
  const doX = (c) => (c > 0 ? `Ziehe auf beiden Seiten <b>${ax(c)}</b> ab` : `Addiere auf beiden Seiten <b>${ax(c)}</b>`);
  const doN = (b) => (b > 0 ? `Ziehe auf beiden Seiten <b>${b}</b> ab` : `Addiere auf beiden Seiten <b>${-b}</b>`);
  function linSteps(A, Bc, C, D, x) {
    const st = [];
    const k = A - C;
    if (C !== 0) {
      const t = { q: `<b>x-Glieder nach links:</b> ${doX(C)} (Rechenbefehl | ${opx(C)}). Welche Gleichung entsteht?`, board: `${lin(k, Bc)} = ${fmt(D)}`, why: `${lin(A, Bc)} ${opx(C)} = ${lin(k, Bc)} und ${lin(C, D)} ${opx(C)} = ${fmt(D)}` };
      U.choice(t, `${lin(k, Bc)} = ${fmt(D)}`, [{ h: `${lin(A + C, Bc)} = ${fmt(D)}`, msg: `${C > 0 ? 'Abziehen' : 'Addieren'} – nicht umgekehrt! Rechenbefehl: | ${opx(C)}` }, { h: `${lin(k, Bc)} = ${lin(C, D)}`, msg: 'Was du links machst, musst du auch rechts machen!' }, `${lin(k, -Bc)} = ${fmt(D)}`]);
      st.push(t);
    }
    if (Bc !== 0) {
      const t = { q: `<b>Zahlen nach rechts:</b> ${doN(Bc)} (Rechenbefehl | ${opn(Bc)}). Welche Gleichung entsteht?`, board: `${lin(k, 0)} = ${fmt(D - Bc)}`, why: `${fmt(D)} ${opn(Bc)} = ${fmt(D - Bc)}` };
      U.choice(t, `${lin(k, 0)} = ${fmt(D - Bc)}`, [{ h: `${lin(k, 0)} = ${fmt(D + Bc)}`, msg: `Die ${fmt(Bc)} muss weg – also auf beiden Seiten ${Bc > 0 ? 'abziehen' : 'addieren'} (| ${opn(Bc)}).` }, `${lin(k, 0)} = ${fmt(Bc - D)}`, `${lin(k, Bc)} = ${fmt(D - Bc)}`]);
      st.push(t);
    }
    st.push(num(k === 1 ? '<b>Fertig?</b> Lies ab: x = ?' : `<b>Teile beide Seiten durch ${par(k)}.</b> x = ?`, x, { board: `x = ${fmt(x)}`, why: `${fmt(D - Bc)} : ${par(k)} = ${fmt(x)}` }));
    return st;
  }
  const eqChoice = (q, correct, wrongs, board, why) => U.choice({ q, board: board || correct, why }, correct, wrongs);

  /* =======================================================
     WELT 1 – Ausmultiplizieren & Ausklammern
     ======================================================= */
  W({
    id: 'w1', nr: 1, icon: '🐙', title: 'Klammer-Lagune', topic: 'Ausmultiplizieren & Ausklammern', color: '#00f0ff',
    boss: { name: 'Klammer-Krake', icon: '🐙' },
    merke: 'Ausmultiplizieren: Der Faktor vor der Klammer wird mit <b>jedem Glied</b> in der Klammer multipliziert: <b>a · (b + c) = a · b + a · c</b>. Ausklammern ist der Rückweg: Den <b>gemeinsamen Faktor</b> vor die Klammer schreiben.',
    beispiel: '3 · (x + 4) = 3x + 12 · 6x − 9 = 3 · (2x − 3) · −2(x − 5) = −2x + 10',
    fehler: '3(x + 4) = 3x + 4 ✘ – die 4 wurde nicht mit 3 multipliziert.',
    gen(l) {
      const k = ri(1, 10);
      if (l === 1) {
        if (k <= 6) {
          const a = ri(2, 9), b = rnz(-9, 9);
          return tpl(`Multipliziere aus: ${E(`${a} · ${br(1, b)}`)}`, T.lin(), [a, a * b], {
            hints: ['Multipliziere die Zahl vor der Klammer mit JEDEM Glied in der Klammer.', `${a} · x = ? und ${a} · ${par(b)} = ?`],
            sol: `${a} · x = ${a}x und ${a} · ${par(b)} = ${fmt(a * b)} → <b>${lin(a, a * b)}</b>`,
            diagnose: (v) => (v[1] === b ? `Die ${fmt(b)} muss auch mit ${a} multipliziert werden!` : v[1] === -a * b ? 'Achte auf das Vorzeichen: Plus mal Minus ergibt Minus.' : null),
          });
        }
        const a = ri(2, 9), b = rnz(-9, 9);
        return tpl(`Klammere die gemeinsame Zahl aus: ${E(lin(a, a * b))}`, [B(0, 1), ' · (x ', B(1), ')'], [a, b], {
          hints: [`Welche Zahl steckt in ${a}x UND in ${Math.abs(a * b)}?`, `${Math.abs(a * b)} = ${a} · ${Math.abs(b)}`],
          sol: `${lin(a, a * b)} = ${a} · x ${b < 0 ? '−' : '+'} ${a} · ${Math.abs(b)} = <b>${a} · ${br(1, b)}</b>`,
          verify: (v) => v[0] === a && v[1] === b,
          diagnose: (v) => (v[0] === a && v[1] === a * b ? `Die Zahl in der Klammer ist nur noch ${fmt(b)} – du musst durch ${a} teilen.` : v[0] === a && v[1] === -b ? 'Vorzeichen prüfen!' : null),
        });
      }
      if (l === 2) {
        if (k <= 4) {
          const a = -ri(2, 7), b = ri(1, 6), c = rnz(-9, 9);
          return tpl(`Multipliziere aus: ${E(`${fmt(a)} · ${br(b, c)}`)}`, T.lin(), [a * b, a * c], {
            hints: ['Achtung, negativer Faktor: Er ändert alle Vorzeichen in der Klammer.', `${fmt(a)} · ${b === 1 ? '' : b}x und ${fmt(a)} · ${par(c)}`],
            sol: `${fmt(a)} · ${b === 1 ? '' : b}x = ${coef(a * b)}; ${fmt(a)} · ${par(c)} = ${fmt(a * c)} → <b>${lin(a * b, a * c)}</b>`,
            diagnose: (v) => (v[1] === -a * c ? 'Minus mal Minus ergibt Plus, Minus mal Plus ergibt Minus!' : v[1] === c ? 'Auch die Zahl muss multipliziert werden.' : null),
          });
        }
        if (k <= 6) {
          const a = ri(1, 4), b = rnz(-9, 9);
          return tpl(`Multipliziere aus: ${E(`${a === 1 ? '' : a}x · ${br(1, b)}`)}`, T.quadNoC(), [a, a * b], {
            hints: ['x · x = x²', `${a === 1 ? '' : a}x · ${par(b)} = ?`],
            sol: `${a === 1 ? '' : a}x · x = ${coef(a, 'x²')}; ${a === 1 ? '' : a}x · ${par(b)} = ${coef(a * b)} → <b>${pstr([0, a * b, a])}</b>`,
            diagnose: (v) => (v[0] === 2 * a ? 'x · x ist x² – nicht 2x!' : null),
          });
        }
        let g, m, n;
        do { g = ri(2, 6); m = ri(2, 7); n = rnz(-9, 9); } while (U.gcd(m, n) !== 1);
        return tpl(`Klammere den <b>größten</b> gemeinsamen Faktor aus: ${E(lin(g * m, g * n))}`, [B(0, 1), ' · (', B(1, 1), 'x ', B(2), ')'], [g, m, n], {
          hints: [`Größter gemeinsamer Teiler von ${g * m} und ${Math.abs(g * n)}?`, `ggT = ${g}`],
          sol: `ggT(${g * m}; ${Math.abs(g * n)}) = ${g} → <b>${g} · ${br(m, n)}</b>. Probe: ${g} · ${m}x = ${g * m}x ✔`,
          verify: (v) => (v[0] === g && v[1] === m && v[2] === n) || (v[0] === -g && v[1] === -m && v[2] === -n),
          diagnose: (v) => (v[0] * v[1] === g * m && v[0] * v[2] === g * n && Math.abs(v[0]) < g ? 'Richtig umgeformt – aber das ist nicht der GRÖSSTE gemeinsame Faktor. Da geht noch mehr!' : null),
        });
      }
      if (k <= 3) {
        const a = -ri(2, 5), b = ri(2, 5), c = rnz(-8, 8);
        return tpl(`Multipliziere aus: ${E(`${fmt(a)}x · ${br(b, c)}`)}`, T.quadNoC(), [a * b, a * c], {
          hints: ['x · x = x². Achte auf das Minus vor dem Faktor.', `${fmt(a)}x · ${b}x = ? und ${fmt(a)}x · ${par(c)} = ?`],
          sol: `${fmt(a)}x · ${b}x = ${coef(a * b, 'x²')}; ${fmt(a)}x · ${par(c)} = ${coef(a * c)} → <b>${pstr([0, a * c, a * b])}</b>`,
          diagnose: (v) => (v[1] === -a * c ? 'Vorzeichen beim zweiten Glied prüfen!' : null),
        });
      }
      if (k <= 6) {
        let p, q; do { p = ri(2, 7); q = ri(2, 6); } while (p === q);
        const a = rnz(-8, 8), b = rnz(-8, 8);
        return tpl(`Löse beide Klammern auf und fasse zusammen: ${E(`${p} · ${br(1, a)} − ${q} · ${br(1, b)}`)}`, T.lin(), [p - q, p * a - q * b], {
          hints: ['Das Minus vor der zweiten Klammer gehört zum Faktor: −' + q, `${p}x ${p * a < 0 ? '−' : '+'} ${Math.abs(p * a)} und ${coef(-q)} ${-q * b < 0 ? '−' : '+'} ${Math.abs(q * b)}`],
          sol: `${lin(p, p * a)} ${coef(-q).startsWith('−') ? '−' : '+'} ${ax(q)} ${-q * b < 0 ? '−' : '+'} ${Math.abs(q * b)} = <b>${lin(p - q, p * a - q * b)}</b>`,
          diagnose: (v) => (v[1] === p * a + q * b ? 'Das Minus vor der zweiten Klammer ändert auch das Vorzeichen der Zahl darin!' : null),
        });
      }
      let g, m, n;
      do { g = ri(2, 5); m = ri(2, 6); n = rnz(-9, 9); } while (U.gcd(m, n) !== 1);
      return tpl(`Klammere den größten gemeinsamen Faktor aus – er enthält auch x: ${E(pstr([0, g * n, g * m]))}`, [B(0, 1), 'x · (', B(1, 1), 'x ', B(2), ')'], [g, m, n], {
        hints: ['Beide Glieder enthalten x – das kommt mit vor die Klammer.', `Gemeinsamer Faktor: ${g}x`],
        sol: `${pstr([0, g * n, g * m])} = <b>${g}x · ${br(m, n)}</b>`,
        verify: (v) => (v[0] === g && v[1] === m && v[2] === n) || (v[0] === -g && v[1] === -m && v[2] === -n),
        diagnose: (v) => (v[0] * v[1] === g * m && v[0] * v[2] === g * n && Math.abs(v[0]) < g ? 'Fast – es geht noch ein größerer Faktor!' : null),
      });
    },
    story: [
      { t: 'Willkommen in der Klammer-Lagune!', b: '<p>Hier wohnt die <b>Klammer-Krake</b> 🐙. Sie versteckt Zahlen in Klammern. Deine Mission: Klammern <b>auflösen</b> und Klammern <b>bauen</b>.</p><div class="bigex">3 · (x + 4)</div><p>Die 3 vor der Klammer will <b>jedem</b> in der Klammer die Hand geben – dem x <b>und</b> der 4.</p>', svg: 'arcs' },
      { t: 'Jeder bekommt seinen Anteil', b: '<div class="bigex"><span class="c1">3</span> · (<span class="c2">x</span> + <span class="c3">4</span>) = <span class="c1">3</span>·<span class="c2">x</span> + <span class="c1">3</span>·<span class="c3">4</span> = <b>3x + 12</b></div><p>Stell dir vor: 3 Kinder bekommen je ein Eis (x) und 4 Bonbons. Zusammen sind das 3 Eis und 12 Bonbons.</p>', check: { q: 'Was ist 5 · (x + 2)?', o: ['5x + 2', '5x + 10', '5x + 7'], a: 1, why: '5 · x = 5x und 5 · 2 = 10.' } },
      { t: 'Vorsicht, Minus!', b: '<p>Steht vor der Klammer eine <b>negative</b> Zahl, kippen alle Vorzeichen in der Klammer:</p><div class="bigex">−2 · (x − 5) = −2x <span class="c3">+ 10</span></div><p>Denn: Minus mal Minus ergibt Plus.</p>', check: { q: 'Was ist −3 · (x + 4)?', o: ['−3x + 12', '−3x − 12', '3x − 12'], a: 1, why: '−3 · x = −3x und −3 · 4 = −12.' } },
      { t: 'Rückwärts: Ausklammern', b: '<p>Jetzt bauen wir die Klammer wieder. Suche den <b>gemeinsamen Faktor</b> aller Glieder:</p><div class="bigex">6x + 9 = <span class="c1">3</span>·2x + <span class="c1">3</span>·3 = <b>3 · (2x + 3)</b></div><p>Nimm immer den <b>größten</b> gemeinsamen Faktor (ggT).</p>', check: { q: 'Klammere aus: 10x + 15', o: ['5 · (2x + 3)', '10 · (x + 15)', '2 · (5x + 15)'], a: 0, why: 'ggT von 10 und 15 ist 5: 10x = 5·2x und 15 = 5·3.' } },
      { t: 'Dein Spickzettel', b: '<div class="merke">a · (b + c) = a·b + a·c<br>Ausklammern: gemeinsamen Faktor nach vorne</div><p>Probe-Trick: Wenn du ausgeklammert hast, multipliziere im Kopf wieder aus – kommt der Anfangsterm heraus? ✔</p>' },
    ],
  });

  /* =======================================================
     WELT 2 – Summen multiplizieren
     ======================================================= */
  W({
    id: 'w2', nr: 2, icon: '👾', title: 'Multipli-Mine', topic: 'Summen multiplizieren', color: '#39ff88',
    boss: { name: 'Multipli-Monster', icon: '👾' },
    merke: 'Summe mal Summe: <b>Jedes Glied der ersten Klammer</b> wird mit <b>jedem Glied der zweiten Klammer</b> multipliziert. Danach gleichartige Glieder zusammenfassen: <b>(a + b)(c + d) = ac + ad + bc + bd</b>.',
    beispiel: '(x + 3)(x + 5) = x² + 5x + 3x + 15 = x² + 8x + 15',
    fehler: '(x + 3)(x + 5) = x² + 15 ✘ – die gemischten Glieder 5x und 3x fehlen.',
    gen(l) {
      const qt = (t) => (t[1] === 0 ? [T.quadNoB(), [t[2], t[0]]] : [T.quad(), t.slice().reverse()]);
      if (l === 1) {
        const a = ri(1, 9), b = ri(1, 9);
        const target = pm([a, 1], [b, 1]);
        if (U.chance(0.45)) {
          return {
            type: 'steps', q: `Multipliziere mit dem Rechteck-Modell: ${E(`${br(1, a)} · ${br(1, b)}`)}`,
            vis: areaModel(['x', fmt(b)], ['x', fmt(a)]),
            hints: ['Jedes Feld im Rechteck = Zeile mal Spalte.'],
            steps: [
              tpl('<b>Fülle das Rechteck:</b> Multipliziere jeweils Zeile mal Spalte.', ['x · x = ', B(0, 1), 'x²\n', `x · ${b} = `, B(1, 1), 'x\n', `${a} · x = `, B(2, 1), 'x\n', `${a} · ${b} = `, B(3, 1)], [1, b, a, a * b], { board: areaModel(['x', fmt(b)], ['x', fmt(a)], [['x²', coef(b)], [coef(a), a * b]]), why: `x·x = x², x·${b} = ${coef(b)}, ${a}·x = ${coef(a)}, ${a}·${b} = ${a * b}` }),
              tpl('<b>Fasse alle Felder zusammen</b> (die x-Glieder addieren):', T.quad(), [1, a + b, a * b], { board: `= ${pstr(target)}`, why: `${coef(b)} + ${coef(a)} = ${coef(a + b)}` }),
            ],
            sol: `x² + ${coef(b)} + ${coef(a)} + ${a * b} = <b>${pstr(target)}</b>`,
          };
        }
        return tpl(`Multipliziere aus: ${E(`${br(1, a)} · ${br(1, b)}`)}`, T.quad(), [1, a + b, a * b], {
          vis: areaModel(['x', fmt(b)], ['x', fmt(a)]),
          hints: ['Jedes Glied der ersten Klammer mal jedes Glied der zweiten (4 Produkte).', `x² + ${coef(b)} + ${coef(a)} + ${a * b}`],
          sol: `x · x + x · ${b} + ${a} · x + ${a} · ${b} = x² + ${coef(b)} + ${coef(a)} + ${a * b} = <b>${pstr(target)}</b>`,
          diagnose: (v) => (v[1] === 0 ? 'Die gemischten Glieder (x mal Zahl) fehlen!' : v[1] === a * b && v[2] === a + b ? 'Du hast x-Glied und Zahl vertauscht.' : null),
        });
      }
      if (l === 2) {
        const p = U.chance(0.5) ? 1 : ri(2, 3), a = rnz(-9, 9), b = rnz(-9, 9);
        const target = pm([a, p], [b, 1]);
        const [pa, an] = qt(target);
        return tpl(`Multipliziere aus und fasse zusammen: ${E(`${br(p, a)} · ${br(1, b)}`)}`, pa, an, {
          hints: ['4 Produkte bilden, Vorzeichen mitnehmen!', `${coef(p)}·x, ${coef(p)}·${par(b)}, ${fmt(a)}·x, ${fmt(a)}·${par(b)}`],
          sol: `${coef(p, 'x²')} ${p * b < 0 ? '−' : '+'} ${ax(p * b)} ${a < 0 ? '−' : '+'} ${ax(a)} ${a * b < 0 ? '−' : '+'} ${Math.abs(a * b)} = <b>${pstr(target)}</b>`,
          diagnose: (v) => (target[1] === 0 ? (v[1] === -a * b ? 'Vorzeichen der Zahl: ' + fmt(a) + ' · ' + par(b) + ' = ' + fmt(a * b) : null) : v[2] === -a * b ? 'Vorzeichen der Zahl: ' + fmt(a) + ' · ' + par(b) + ' = ' + fmt(a * b) : v[1] === 0 ? 'Gemischte Glieder vergessen?' : null),
        });
      }
      if (U.chance(0.6)) {
        const p = ri(2, 4), q = ri(1, 3), a = rnz(-7, 7), b = rnz(-7, 7);
        const target = pm([a, p], [b, q]);
        const [pa, an] = qt(target);
        return tpl(`Multipliziere aus: ${E(`${br(p, a)} · ${br(q, b)}`)}`, pa, an, {
          hints: ['Erst die x-Glieder: ' + p + 'x · ' + coef(q) + ' = ' + coef(p * q, 'x²'), 'Dann die beiden gemischten Glieder addieren.'],
          sol: `${coef(p * q, 'x²')} ${p * b < 0 ? '−' : '+'} ${ax(p * b)} ${a * q < 0 ? '−' : '+'} ${ax(a * q)} ${a * b < 0 ? '−' : '+'} ${Math.abs(a * b)} = <b>${pstr(target)}</b>`,
        });
      }
      const a = rnz(-6, 6), b = rnz(-6, 6), c = rnz(-6, 6), d = rnz(-6, 6);
      const t1 = pm([a, 1], [b, 1]), t2 = pm([c, 1], [d, 1]);
      const r = padd(t1, psc(t2, -1));
      if (r[1] === 0) return this.gen(l);
      return tpl(`Vereinfache: ${E(`${br(1, a)}${br(1, b)} − ${br(1, c)}${br(1, d)}`)}`, T.lin(), [r[1], r[0]], {
        hints: ['Rechne beide Produkte einzeln aus. Das zweite in eine Klammer setzen, wegen des Minus!', 'Die x² heben sich auf.'],
        sol: `(${pstr(t1)}) − (${pstr(t2)}) = <b>${pstr(r)}</b>`,
      });
    },
    story: [
      { t: 'Ab in die Multipli-Mine!', b: '<p>Hier treffen <b>zwei Klammern</b> aufeinander. Jedes Glied der ersten Klammer will <b>jedem</b> Glied der zweiten die Hand geben. 🤝</p><div class="bigex">(x + 3) · (x + 5)</div><p>Das sind <b>2 · 2 = 4</b> Handschläge, also 4 Produkte.</p>' },
      { t: 'Das Rechteck-Modell', b: `<p>Zeichne ein Rechteck: oben die eine Klammer, links die andere. Jedes Feld ist ein Produkt:</p>${areaModel(['x', '5'], ['x', '3'], [['x²', '5x'], ['3x', '15']])}<p>Alles zusammen: x² + 5x + 3x + 15 = <b>x² + 8x + 15</b></p>`, check: { q: 'Welches Feld fehlt bei (x + 2)(x + 4)? x², 4x, 2x und …', o: ['6', '8', '2x'], a: 1, why: '2 · 4 = 8.' } },
      { t: 'Zusammenfassen nicht vergessen', b: '<p>Die beiden <b>gemischten Glieder</b> (x mal Zahl) kannst du addieren:</p><div class="bigex">5x + 3x = 8x</div><p>Mit Minus geht es genauso – nur Vorzeichen beachten:</p><div class="bigex">(x − 2)(x + 6) = x² + 6x − 2x − 12 = x² + 4x − 12</div>', check: { q: '(x − 3)(x + 3) = ?', o: ['x² − 9', 'x² + 9', 'x² − 6x − 9'], a: 0, why: '+3x − 3x = 0, und −3 · 3 = −9.' } },
      { t: 'Dein Spickzettel', b: '<div class="merke">(a + b)(c + d) = ac + ad + bc + bd</div><p>Tipp: Zähle deine Produkte. Bei 2 · 2 Gliedern müssen es <b>4</b> sein!</p>' },
    ],
  });

  /* =======================================================
     WELT 3 – Binomische Formeln
     ======================================================= */
  W({
    id: 'w3', nr: 3, icon: '🐉', title: 'Binomi-Burg', topic: 'Binomische Formeln', color: '#ff2bd6',
    boss: { name: 'Binomi-Drache', icon: '🐉' },
    merke: '<b>1.</b> (a + b)² = a² + 2ab + b² · <b>2.</b> (a − b)² = a² − 2ab + b² · <b>3.</b> (a + b)(a − b) = a² − b²',
    beispiel: '(4 − x)² = 4² − 2·4·x + x² = 16 − 8x + x² · (x + 5)² = x² + 10x + 25',
    fehler: '(x + 5)² = x² + 25 ✘ – das gemischte Glied 2·x·5 = 10x fehlt!',
    gen(l) {
      const v = U.chance(0.25) ? 'y' : 'x';
      const diag2 = (a, b, mid) => (vals) => {
        if (vals[1] === 0 && mid !== 0) return 'Das gemischte Glied 2ab fehlt!';
        if (Math.abs(vals[1]) === Math.abs(mid / 2) && mid !== 0) return 'Das gemischte Glied ist 2 · a · b – die 2 nicht vergessen!';
        if (vals[2] < 0 && b > 0) return 'b² ist immer positiv.';
        return null;
      };
      if (l === 1) {
        const a = ri(1, 9), k = ri(0, 4);
        if (k === 0) return tpl(`1. binomische Formel: ${E(`(${v} + ${a})²`)}`, T.quad(v), [1, 2 * a, a * a], { vis: k === 0 && a <= 6 ? squareModel(v, a) : '', hints: ['(a + b)² = a² + 2ab + b²', `a = ${v}, b = ${a}: 2ab = 2 · ${v} · ${a}`], sol: `${v}² + 2·${v}·${a} + ${a}² = <b>${v}² + ${2 * a}${v} + ${a * a}</b>`, diagnose: diag2(1, a, 2 * a) });
        if (k === 1) return tpl(`2. binomische Formel: ${E(`(${v} − ${a})²`)}`, T.quad(v), [1, -2 * a, a * a], { hints: ['(a − b)² = a² − 2ab + b²', `Das gemischte Glied: −2 · ${v} · ${a}`], sol: `${v}² − 2·${v}·${a} + ${a}² = <b>${v}² − ${2 * a}${v} + ${a * a}</b>`, diagnose: (x) => (x[2] === -a * a ? 'Das letzte Glied ist b² = (−' + a + ')² = +' + a * a + '!' : diag2(1, a, -2 * a)(x)) });
        if (k === 2) return tpl(`3. binomische Formel: ${E(`(${v} + ${a})(${v} − ${a})`)}`, T.quadNoB(v), [1, -a * a], { hints: ['(a + b)(a − b) = a² − b²', 'Die gemischten Glieder heben sich auf!'], sol: `${v}² − ${a}² = <b>${v}² − ${a * a}</b>`, diagnose: (x) => (x[1] === a * a ? 'Bei der 3. Formel steht ein MINUS: a² − b².' : null) });
        // (a − x)² bzw. (a + x)² – Zahl vorne
        const minus = k === 3;
        return tpl(`${minus ? '2' : '1'}. binomische Formel – die Zahl steht vorne: ${E(`${brA(a, minus ? -1 : 1, v)}²`)}`, T.quadAsc(v), [a * a, minus ? -2 * a : 2 * a, 1], {
          hints: [`Hier ist a = ${a} und b = ${v}.`, `a² = ${a * a}, 2ab = 2 · ${a} · ${v}, b² = ${v}²`],
          sol: `${a}² ${minus ? '−' : '+'} 2·${a}·${v} + ${v}² = <b>${a * a} ${minus ? '−' : '+'} ${2 * a}${v} + ${v}²</b> (sortiert: ${v}² ${minus ? '−' : '+'} ${2 * a}${v} + ${a * a})`,
          diagnose: (x) => (x[1] === 0 ? 'Das gemischte Glied 2ab fehlt!' : x[1] === (minus ? 2 * a : -2 * a) ? 'Vorzeichen des gemischten Glieds prüfen.' : null),
        });
      }
      if (l === 2) {
        const p = ri(2, 5), q = ri(1, 9), k = ri(0, 4);
        if (k === 0) return tpl(`Binomische Formel: ${E(`(${p}${v} + ${q})²`)}`, T.quad(v), [p * p, 2 * p * q, q * q], { hints: [`a = ${p}${v}, b = ${q}`, `a² = (${p}${v})² = ${p * p}${v}² – die ${p} wird mit quadriert!`], sol: `(${p}${v})² + 2·${p}${v}·${q} + ${q}² = <b>${p * p}${v}² + ${2 * p * q}${v} + ${q * q}</b>`, diagnose: (x) => (x[0] === p ? `(${p}${v})² = ${p}${v} · ${p}${v} = ${p * p}${v}²` : diag2(p, q, 2 * p * q)(x)) });
        if (k === 1) return tpl(`Binomische Formel: ${E(`(${p}${v} − ${q})²`)}`, T.quad(v), [p * p, -2 * p * q, q * q], { hints: [`a = ${p}${v}, b = ${q}`, `2ab = 2 · ${p}${v} · ${q} = ${2 * p * q}${v}`], sol: `${p * p}${v}² − ${2 * p * q}${v} + ${q * q}`, diagnose: (x) => (x[0] === p ? `(${p}${v})² = ${p * p}${v}²` : diag2(p, q, -2 * p * q)(x)) });
        if (k === 2) return tpl(`Binomische Formel: ${E(`(${p}${v} + ${q})(${p}${v} − ${q})`)}`, T.quadNoB(v), [p * p, -q * q], { hints: ['3. binomische Formel: a² − b²', `a² = (${p}${v})²`], sol: `(${p}${v})² − ${q}² = <b>${p * p}${v}² − ${q * q}</b>` });
        if (k === 3) return tpl(`Binomische Formel: ${E(`(${q} − ${p}${v})²`)}`, T.quadAsc(v), [q * q, -2 * p * q, p * p], { hints: [`a = ${q}, b = ${p}${v}`, 'a² − 2ab + b²'], sol: `${q}² − 2·${q}·${p}${v} + (${p}${v})² = <b>${q * q} − ${2 * p * q}${v} + ${p * p}${v}²</b>` });
        const a = ri(2, 9);
        return tpl(`Fülle die Lücken: ${E(`(x + ${a})² = x² + □x + □`)}`, ['(x + ' + a + ')² = x² + ', B(0, 1), 'x + ', B(1, 1)], [2 * a, a * a], { hints: ['Gemischtes Glied = 2 · x · ' + a, 'Letztes Glied = ' + a + '²'], sol: `(x + ${a})² = x² + <b>${2 * a}</b>x + <b>${a * a}</b>` });
      }
      const k = ri(0, 3);
      if (k === 0) {
        const p = ri(1, 4), q = ri(1, 5), minus = U.chance(0.5);
        return tpl(`Binomische Formel mit zwei Variablen: ${E(`(${p === 1 ? '' : p}a ${minus ? '−' : '+'} ${q === 1 ? '' : q}b)²`)}`, T.two(), [p * p, (minus ? -2 : 2) * p * q, q * q], { hints: [`a² → (${p === 1 ? '' : p}a)² = ${p * p === 1 ? '' : p * p}a²`, `2ab → 2 · ${p === 1 ? '' : p}a · ${q === 1 ? '' : q}b`], sol: `<b>${p * p === 1 ? '' : p * p}a² ${minus ? '−' : '+'} ${2 * p * q}ab + ${q * q === 1 ? '' : q * q}b²</b>` });
      }
      if (k === 1) {
        const p = ri(2, 5), q = ri(2, 6);
        return tpl(`Binomische Formel: ${E(`(${p}a + ${q}b)(${p}a − ${q}b)`)}`, T.twoNoB(), [p * p, -q * q], { hints: ['3. binomische Formel'], sol: `<b>${p * p}a² − ${q * q}b²</b>` });
      }
      if (k === 2) {
        const a = ri(1, 9);
        return tpl(`Vereinfache: ${E(`(x + ${a})² − (x − ${a})²`)}`, [B(0, 1), 'x'], [4 * a], { hints: ['Beide Klammern einzeln auflösen, die zweite in Klammern lassen (wegen des Minus).', `(x² + ${2 * a}x + ${a * a}) − (x² − ${2 * a}x + ${a * a})`], sol: `(x² + ${2 * a}x + ${a * a}) − (x² − ${2 * a}x + ${a * a}) = <b>${4 * a}x</b>` });
      }
      const a = ri(1, 9);
      return tpl(`Vereinfache: ${E(`(x + ${a})² − x²`)}`, T.lin(), [2 * a, a * a], { hints: ['Erst (x + ' + a + ')² auflösen, dann x² abziehen.'], sol: `x² + ${2 * a}x + ${a * a} − x² = <b>${2 * a}x + ${a * a}</b>` });
    },
    story: [
      { t: 'Die Binomi-Burg', b: '<p>Drei Formeln bewachen diese Burg – sie sind <b>Abkürzungen</b> fürs Ausmultiplizieren. Wer sie kennt, rechnet blitzschnell. ⚡</p><div class="merke">1. (a + b)² = a² + 2ab + b²<br>2. (a − b)² = a² − 2ab + b²<br>3. (a + b)(a − b) = a² − b²</div>' },
      { t: 'Warum 2ab? Das Quadrat-Puzzle', b: `<p>(x + 3)² ist ein Quadrat mit der Seite x + 3. Es besteht aus <b>4 Teilen</b>:</p>${squareModel('x', 3, true)}<p>Ein großes x², <b>zwei</b> Streifen mit je 3x und ein kleines 9. Deshalb: <b>x² + 2·3x + 9 = x² + 6x + 9</b></p>`, check: { q: '(x + 4)² = ?', o: ['x² + 16', 'x² + 8x + 16', 'x² + 4x + 16'], a: 1, why: '2 · x · 4 = 8x, und 4² = 16.' } },
      { t: 'Der Klassiker: (4 − x)²', b: '<p>Hier steht die <b>Zahl vorne</b>. Kein Problem: a = 4, b = x.</p><div class="bigex">(4 − x)² = 4² − 2·4·x + x² = <b>16 − 8x + x²</b></div><p>Sortiert sieht es so aus: x² − 8x + 16. Das letzte Glied ist <b>immer positiv</b>, denn Minus mal Minus ist Plus.</p>', check: { q: '(5 − x)² = ?', o: ['25 − 10x + x²', '25 − x²', '25 − 10x − x²'], a: 0, why: 'a² = 25, 2ab = 10x mit Minus, b² = x² mit Plus.' } },
      { t: 'Die dritte Formel – Glieder verschwinden', b: '<div class="bigex">(x + 7)(x − 7) = x² <s>− 7x + 7x</s> − 49 = <b>x² − 49</b></div><p>Die gemischten Glieder heben sich auf. Übrig bleibt <b>a² − b²</b>.</p>', check: { q: '(x + 6)(x − 6) = ?', o: ['x² − 36', 'x² + 36', 'x² − 12x − 36'], a: 0, why: 'a² − b² = x² − 36.' } },
      { t: 'Achtung bei Zahlen vor dem x', b: '<div class="bigex">(3x + 2)² = (3x)² + 2·3x·2 + 2² = <b>9x² + 12x + 4</b></div><p>Die 3 wird beim Quadrieren mitgenommen: (3x)² = 9x², nicht 3x²!</p>', check: { q: '(2x − 1)² = ?', o: ['4x² − 4x + 1', '2x² − 4x + 1', '4x² − 2x + 1'], a: 0, why: '(2x)² = 4x², 2·2x·1 = 4x, 1² = 1.' } },
    ],
  });
  function squareModel(v, a, labels) {
    const s = 150, t = Math.max(30, a * 14);
    const tot = s + t;
    let g = `<rect x="20" y="20" width="${s}" height="${s}" class="sq-a"/><rect x="${20 + s}" y="20" width="${t}" height="${s}" class="sq-b"/><rect x="20" y="${20 + s}" width="${s}" height="${t}" class="sq-b"/><rect x="${20 + s}" y="${20 + s}" width="${t}" height="${t}" class="sq-c"/>`;
    g += `<text x="${20 + s / 2}" y="${20 + s / 2 + 8}" class="sq-t">${v}²</text><text x="${20 + s + t / 2}" y="${20 + s / 2 + 6}" class="sq-t sm">${a === 1 ? '' : a}${v}</text><text x="${20 + s / 2}" y="${20 + s + t / 2 + 6}" class="sq-t sm">${a === 1 ? '' : a}${v}</text><text x="${20 + s + t / 2}" y="${20 + s + t / 2 + 6}" class="sq-t sm">${a * a}</text>`;
    g += `<text x="${20 + s / 2}" y="14" class="sq-l">${v}</text><text x="${20 + s + t / 2}" y="14" class="sq-l">${a}</text><text x="8" y="${20 + s / 2}" class="sq-l">${v}</text><text x="8" y="${20 + s + t / 2 + 4}" class="sq-l">${a}</text>`;
    return `<svg class="task-svg sq" viewBox="0 0 ${tot + 30} ${tot + 30}" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
  }
  MA.squareModel = squareModel;

  /* =======================================================
     WELT 4 – Faktorisieren mit binomischen Formeln
     ======================================================= */
  const exSq = (v) => pm([v[1], v[0]], [v[1], v[0]]); // (v0·x + v1)²
  W({
    id: 'w4', nr: 4, icon: '👻', title: 'Faktor-Friedhof', topic: 'Faktorisieren mit binomischen Formeln', color: '#9d4dff',
    boss: { name: 'Faktor-Phantom', icon: '👻' },
    merke: 'Faktorisieren = binomische Formel <b>rückwärts</b>. Suche zwei Quadrate a² und b². Passt das gemischte Glied <b>2ab</b>? Dann: a² + 2ab + b² = (a + b)². Bei a² − b² ohne mittleres Glied: (a + b)(a − b).',
    beispiel: 'x² + 10x + 25 = (x + 5)², denn 25 = 5² und 10x = 2·x·5 · x² − 49 = (x + 7)(x − 7)',
    fehler: 'x² + 6x + 4 = (x + 2)² ✘ – Probe: (x + 2)² = x² + 4x + 4. Nicht jeder Term passt zu einer Formel!',
    gen(l) {
      if (l === 1) {
        const a = ri(1, 9), k = ri(0, 2);
        const target = k === 2 ? [-a * a, 0, 1] : [a * a, k === 0 ? 2 * a : -2 * a, 1];
        const which = ['1. binomische Formel: (a + b)²', '2. binomische Formel: (a − b)²', '3. binomische Formel: (a + b)(a − b)'];
        const s1 = U.choice({ q: '<b>Detektiv-Frage:</b> Welche Formel steckt dahinter?', board: which[k], why: k === 2 ? 'Kein mittleres Glied und ein Minus: a² − b².' : `Mittleres Glied mit ${k === 0 ? 'Plus' : 'Minus'}.` }, which[k], which.filter((_, i) => i !== k));
        s1.options = which.slice(); s1.answer = k; s1.mistakes = [];
        const s2 = k === 2
          ? tpl('<b>Fülle die Klammern:</b>', ['(x + ', B(0, 1), ')(x − ', B(1, 1), ')'], [a, a], { board: `= (x + ${a})(x − ${a})`, why: `${a * a} = ${a}²`, verify: (v) => v[0] === a && v[1] === a })
          : tpl('<b>Fülle die Klammer</b> (mit Vorzeichen):', ['(x ', B(0), ')²'], [k === 0 ? a : -a], { board: `= (x ${k === 0 ? '+' : '−'} ${a})²`, why: `${a * a} = ${a}² und ${2 * a}x = 2·x·${a}`, verify: (v) => same(exSq([1, v[0]]), target) });
        return { type: 'steps', q: `Faktorisiere: ${E(pstr(target))}`, hints: ['Suche die Quadratzahl: ' + a * a + ' = ' + a + '²'], steps: [s1, s2], sol: `${pstr(target)} = <b>${k === 2 ? `(x + ${a})(x − ${a})` : `(x ${k === 0 ? '+' : '−'} ${a})²`}</b>` };
      }
      if (l === 2) {
        const p = ri(2, 5), q = ri(1, 9), k = ri(0, 3);
        if (k === 3) {
          // nicht faktorisierbar?
          const a = ri(2, 7), fake = U.chance(0.5);
          const c = fake ? a * a + pick([-3, -2, 1, 2, 3]) : a * a;
          const t = { q: `Lässt sich ${E(`x² + ${2 * a}x + ${c}`)} mit einer binomischen Formel faktorisieren?`, hints: [`Wäre es (x + ${a})², müsste am Ende ${a * a} stehen.`], sol: fake ? `Nein: (x + ${a})² = x² + ${2 * a}x + ${a * a}, nicht + ${c}.` : `Ja: x² + ${2 * a}x + ${c} = (x + ${a})²` };
          return U.choice(t, fake ? 'Nein, das geht nicht' : `Ja: (x + ${a})²`, fake ? [`Ja: (x + ${a})²`, `Ja: (x + ${c})²`] : ['Nein, das geht nicht', `Ja: (x + ${c})²`]);
        }
        if (k === 2) {
          const target = [-q * q, 0, p * p];
          return tpl(`Faktorisiere: ${E(pstr(target))}`, ['(', B(0, 1), 'x + ', B(1, 1), ')(', B(2, 1), 'x − ', B(3, 1), ')'], [p, q, p, q], {
            hints: [`${p * p}x² = (${p}x)² und ${q * q} = ${q}²`, '3. binomische Formel rückwärts'],
            sol: `(${p}x)² − ${q}² = <b>(${p}x + ${q})(${p}x − ${q})</b>`,
            verify: (v) => same(pm([v[1], v[0]], [-v[3], v[2]]), target),
          });
        }
        const s = k === 0 ? 1 : -1;
        const target = [q * q, 2 * s * p * q, p * p];
        return tpl(`Faktorisiere: ${E(pstr(target))}`, ['(', B(0, 1), 'x ', B(1), ')²'], [p, s * q], {
          hints: [`${p * p}x² = (${p}x)² und ${q * q} = ${q}²`, `Probe: 2 · ${p}x · ${q} = ${2 * p * q}x ✔`],
          sol: `(${p}x)² ${s > 0 ? '+' : '−'} 2·${p}x·${q} + ${q}² = <b>(${p}x ${s > 0 ? '+' : '−'} ${q})²</b>`,
          verify: (v) => same(exSq(v), target),
          diagnose: (v) => (v[0] === p * p ? `Gesucht ist ${p}x, nicht ${p * p}x – du brauchst die Wurzel aus ${p * p}x².` : v[1] === -s * q ? 'Das Vorzeichen in der Klammer richtet sich nach dem mittleren Glied.' : null),
        });
      }
      const k = ri(0, 2);
      if (k === 0) {
        const g = ri(2, 5), a = ri(1, 6), s = U.chance(0.5) ? 1 : -1;
        const target = psc([a * a, 2 * s * a, 1], g);
        return tpl(`Klammere erst aus, dann faktorisiere: ${E(pstr(target))}`, [B(0, 1), ' · (x ', B(1), ')²'], [g, s * a], {
          hints: [`Alle Glieder sind durch ${g} teilbar.`, `${g} · (${pstr([a * a, 2 * s * a, 1])})`],
          sol: `${g} · (x² ${s > 0 ? '+' : '−'} ${2 * a}x + ${a * a}) = <b>${g} · (x ${s > 0 ? '+' : '−'} ${a})²</b>`,
          verify: (v) => Math.abs(v[0]) === g && same(psc(exSq([1, v[1]]), v[0]), target),
        });
      }
      if (k === 1) {
        const a = ri(2, 9);
        const target = [a * a, -2 * a, 1];
        return tpl(`Faktorisiere: ${E(`${a * a} − ${2 * a}x + x²`)}`, ['(', B(0, 1), ' ', B(1), 'x)²'], [a, -1], {
          hints: ['Hier steht die Zahl vorne: a = ' + a + ', b = x.', '2. binomische Formel'],
          sol: `${a}² − 2·${a}·x + x² = <b>(${a} − x)²</b> – genauso richtig ist (x − ${a})²`,
          verify: (v) => same(pm([v[0], v[1]], [v[0], v[1]]), target),
        });
      }
      const p = ri(2, 4), q = ri(1, 3);
      return tpl(`Faktorisiere mit zwei Variablen: ${E(`${p * p}a² − ${q * q === 1 ? '' : q * q}b²`)}`, ['(', B(0, 1), 'a + ', B(1, 1), 'b)(', B(2, 1), 'a − ', B(3, 1), 'b)'], [p, q, p, q], {
        hints: ['3. binomische Formel: a² − b² = (a + b)(a − b)'],
        sol: `<b>(${p}a + ${q === 1 ? '' : q}b)(${p}a − ${q === 1 ? '' : q}b)</b>`,
        verify: (v) => v[0] * v[2] === p * p && v[1] * v[3] === q * q && v[0] * v[3] === v[1] * v[2] && v[0] > 0,
      });
    },
    story: [
      { t: 'Der Faktor-Friedhof', b: '<p>Hier spuken Terme, die eigentlich <b>binomische Formeln</b> sind – nur rückwärts! 👻 Deine Aufgabe: Aus der Summe wieder ein <b>Produkt</b> machen. Das heißt <b>Faktorisieren</b>.</p><div class="bigex">x² + 6x + 9 → (x + 3)²</div>' },
      { t: 'Detektiv-Schritt 1: Quadrate suchen', b: '<p>Suche die beiden <b>Quadrate</b>: vorne x² (also a = x) und hinten eine Quadratzahl.</p><div class="bigex">x² + 10x + <span class="c3">25</span> → 25 = <span class="c3">5²</span></div><p>Quadratzahlen: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100 …</p>', check: { q: 'Welche Quadratzahl steckt in x² + 14x + 49?', o: ['7² = 49', '14² = 196', '4² = 16'], a: 0, why: '49 = 7 · 7.' } },
      { t: 'Detektiv-Schritt 2: Probe mit 2ab', b: '<p>Passt das mittlere Glied? Es muss <b>2 · a · b</b> sein.</p><div class="bigex">2 · x · 5 = 10x ✔ → x² + 10x + 25 = (x + 5)²</div><p>Steht in der Mitte ein <b>Minus</b>, nimm die 2. Formel: x² − 10x + 25 = (x − 5)².</p>', check: { q: 'x² − 8x + 16 = ?', o: ['(x − 4)²', '(x + 4)²', '(x − 8)²'], a: 0, why: '16 = 4², 2·x·4 = 8x mit Minus.' } },
      { t: 'Kein mittleres Glied? 3. Formel!', b: '<div class="bigex">x² − 36 = (x + 6)(x − 6)</div><p>Zwei Quadrate mit <b>Minus dazwischen</b> und nichts in der Mitte → 3. binomische Formel.</p>', check: { q: '9x² − 4 = ?', o: ['(3x + 2)(3x − 2)', '(9x + 4)(9x − 4)', '(3x − 2)²'], a: 0, why: '9x² = (3x)² und 4 = 2².' } },
      { t: 'Falle! Nicht alles passt', b: '<p>x² + 6x + 4: 4 = 2², aber 2·x·2 = 4x, nicht 6x. ❌ Dieser Term lässt sich <b>nicht</b> mit einer binomischen Formel faktorisieren.</p><div class="merke">Immer die Probe machen: wieder ausmultiplizieren!</div>' },
    ],
  });

  /* =======================================================
     WELT 5 – Gleichungen mit Klammern
     ======================================================= */
  W({
    id: 'w5', nr: 5, icon: '🗿', title: 'Gleichungs-Gebirge', topic: 'Gleichungen mit Klammern', color: '#ffe600',
    boss: { name: 'Gleichungs-Golem', icon: '🗿' }, hasSteps: true,
    merke: '<b>1.</b> Klammern auflösen · <b>2.</b> Jede Seite zusammenfassen · <b>3.</b> x-Glieder auf eine Seite · <b>4.</b> Zahlen auf die andere Seite · <b>5.</b> Durch die Zahl vor dem x teilen · <b>6.</b> Probe!',
    beispiel: '3(x − 2) = x + 8 → 3x − 6 = x + 8 | −x → 2x − 6 = 8 | +6 → 2x = 14 | :2 → x = 7',
    fehler: '3(x − 2) = 3x − 2 ✘ – beim Auflösen auch die 2 mit 3 multiplizieren!',
    gen(l, stepMode) {
      let A, Bc, C, D, x, orig, wrongs, sq = null;
      if (l === 1) {
        const k = ri(2, 6), m = rnz(-6, 6); x = ri(1, 9);
        if (U.chance(0.5)) {
          const n = k * (x + m);
          orig = `${k} · ${br(1, m)} = ${fmt(n)}`; A = k; Bc = k * m; C = 0; D = n;
        } else {
          const c = ri(1, k - 1 || 1); if (c >= k) return this.gen(l, stepMode);
          const d = k * (x + m) - c * x;
          orig = `${k} · ${br(1, m)} = ${lin(c, d)}`; A = k; Bc = k * m; C = c; D = d;
        }
        wrongs = [{ h: `${lin(A, m)} = ${lin(C, D)}`, msg: `Auch die ${fmt(m)} in der Klammer mit ${k} multiplizieren!` }, `${lin(A, -Bc)} = ${lin(C, D)}`];
      } else if (l === 2) {
        let k, j; do { k = ri(2, 6); j = ri(1, 5); } while (k === j);
        const m = rnz(-6, 6), n = rnz(-6, 6); x = rnz(-8, 8);
        if (U.chance(0.5)) {
          const e = k * (x + m) - j * (x + n);
          orig = `${k} · ${br(1, m)} − ${j} · ${br(1, n)} = ${fmt(e)}`; A = k - j; Bc = k * m - j * n; C = 0; D = e;
          wrongs = [{ h: `${lin(A, k * m + j * n)} = ${fmt(e)}`, msg: `Das Minus vor ${j} gilt auch für die Zahl in der Klammer: −${j} · ${par(n)} = ${fmt(-j * n)}` }, `${lin(k + j, k * m - j * n)} = ${fmt(e)}`];
        } else {
          const e = k * (x + m) - j * (x + n);
          orig = `${k} · ${br(1, m)} = ${j} · ${br(1, n)}${e ? ` ${e < 0 ? '−' : '+'} ${Math.abs(e)}` : ''}`;
          A = k; Bc = k * m; C = j; D = j * n + e;
          wrongs = [{ h: `${lin(A, m)} = ${lin(C, n + e)}`, msg: 'Beim Auflösen jedes Glied der Klammer multiplizieren!' }, `${lin(A, Bc)} = ${lin(C, D + 2 * j * n)}`];
        }
      } else {
        const kk = ri(0, 2);
        if (kk === 0) {
          let a, b; do { a = rnz(-7, 7); b = rnz(-7, 7); } while (a + b === 0 || a === b);
          x = rnz(-6, 6); const c = (a + b) * x + a * b;
          const rhs = c === 0 ? 'x²' : `x² ${c < 0 ? '−' : '+'} ${Math.abs(c)}`;
          orig = `${br(1, a)} · ${br(1, b)} = ${rhs}`;
          A = a + b; Bc = a * b; C = 0; D = c;
          sq = { full: `${pstr([a * b, a + b, 1])} = ${rhs}`, wrongs: [{ h: `${pstr([a * b, 0, 1])} = ${rhs}`, msg: 'Die gemischten Glieder fehlen!' }, `${pstr([-a * b, a + b, 1])} = ${rhs}`] };
        } else if (kk === 1) {
          let a, b; do { a = rnz(-6, 6); b = rnz(-6, 6); } while (a === b || a === -b);
          x = rnz(-6, 6); const c = (2 * a - 2 * b) * x + a * a - b * b;
          orig = `${br(1, a)}² = ${br(1, b)}²${c ? ` ${c < 0 ? '−' : '+'} ${Math.abs(c)}` : ''}`;
          A = 2 * a; Bc = a * a; C = 2 * b; D = b * b + c;
          sq = { full: `${pstr([a * a, 2 * a, 1])} = ${pstr([b * b + c, 2 * b, 1])}`, wrongs: [{ h: `${pstr([a * a, 0, 1])} = ${pstr([b * b + c, 0, 1])}`, msg: 'Binomische Formel: das gemischte Glied 2ab nicht vergessen!' }, { h: `${pstr([a * a, a, 1])} = ${pstr([b * b + c, b, 1])}`, msg: 'Das gemischte Glied ist 2 · a · b – die 2 fehlt.' }] };
        } else {
          const k = ri(2, 4); let j; do j = ri(2, 6); while (j === k);
          const m = rnz(-5, 5); x = rnz(-5, 6);
          const rhs = k * (x + m) - j * x;
          orig = `${k}(x ${m < 0 ? '−' : '+'} ${Math.abs(m)}) − ${j}x = ${fmt(rhs)}`;
          A = k - j; Bc = k * m; C = 0; D = rhs;
          wrongs = [{ h: `${lin(k - j, m)} = ${fmt(rhs)}`, msg: 'Die Zahl in der Klammer muss auch multipliziert werden.' }, `${lin(k + j, k * m)} = ${fmt(rhs)}`];
        }
        if (A - C === 0) return this.gen(l, stepMode);
        if (Math.abs(x) > 12) return this.gen(l, stepMode);
      }
      if (A - C === 0 || (A * x + Bc) !== (C * x + D)) return this.gen(l, stepMode);
      const pre = sq
        ? [eqChoice('<b>Schritt 1 – Klammern auflösen.</b> Welche Gleichung entsteht?', sq.full, sq.wrongs, null, 'Jedes Glied mit jedem multiplizieren – oder die binomische Formel anwenden.'),
          eqChoice('<b>Schritt 2 – x² fällt weg:</b> Ziehe auf beiden Seiten x² ab (| − x²).', `${lin(A, Bc)} = ${lin(C, D)}`, [{ h: `${pstr([Bc, A, 2])} = ${lin(C, D)}`, msg: 'x² steht auf BEIDEN Seiten – es fällt also ganz weg.' }, `${lin(A, -Bc)} = ${lin(C, D)}`], null, 'x² − x² = 0')]
        : [eqChoice(`<b>Schritt 1 – Klammern auflösen.</b> Welche Gleichung entsteht?`, `${lin(A, Bc)} = ${lin(C, D)}`, wrongs, null, 'Jedes Glied in der Klammer wird multipliziert.')];
      const allSteps = [...pre, ...linSteps(A, Bc, C, D, x)];
      if (stepMode || (l === 1 && U.chance(0.4))) {
        return { type: 'steps', q: `Löse Schritt für Schritt: ${E(orig)}`, ctx: orig, steps: allSteps, hints: ['Erst die Klammern auflösen.'], sol: `${orig} → ${lin(A, Bc)} = ${lin(C, D)} → x = <b>${fmt(x)}</b>`, answerX: x };
      }
      return num(`Löse die Gleichung: ${E(orig)} <span class="note">x = ?</span>`, x, {
        hints: ['1. Klammern auflösen → ' + (sq ? sq.full + ' (x² fällt weg!)' : `${lin(A, Bc)} = ${lin(C, D)}`), `2. x-Glieder links, Zahlen rechts → ${lin(A - C, 0)} = ${fmt(D - Bc)}`],
        sol: `${orig}${sq ? `<br>→ ${sq.full} | − x²` : ''}<br>→ ${lin(A, Bc)} = ${lin(C, D)}${A - C !== 1 ? `<br>→ ${lin(A - C, 0)} = ${fmt(D - Bc)}` : ''}<br>→ <b>x = ${fmt(x)}</b><br>Probe: Setze x = ${fmt(x)} ein – beide Seiten ergeben ${fmt(sq ? x * x + A * x + Bc : A * x + Bc)} ✔`,
        mistakes: [{ v: -x, msg: 'Fast – prüfe das Vorzeichen (Probe machen!).' }],
      });
    },
    story: [
      { t: 'Das Gleichungs-Gebirge', b: '<p>Eine Gleichung ist wie eine <b>Waage</b> ⚖️: Links und rechts ist gleich viel. Was du auf einer Seite tust, musst du auch auf der anderen tun – dann bleibt sie im Gleichgewicht.</p><div class="bigex">x + 3 = 10 | −3 → x = 7</div>' },
      { t: 'Die Kletter-Route (Strategie)', b: '<ol class="route"><li>🧗 Klammern auflösen</li><li>🧹 Jede Seite zusammenfassen</li><li>⬅️ x-Glieder nach links</li><li>➡️ Zahlen nach rechts</li><li>➗ Durch die Zahl vor x teilen</li><li>✅ Probe</li></ol>', check: { q: 'Was machst du bei 2(x + 3) = 14 zuerst?', o: ['Klammer auflösen: 2x + 6 = 14', 'Durch 14 teilen', 'x = 14 − 3'], a: 0, why: 'Zuerst die Klammer auflösen.' } },
      { t: 'Ein Beispiel zum Mitklettern', b: '<div class="bigex">3(x − 2) = x + 8</div><p>1. Auflösen: <b>3x − 6 = x + 8</b><br>2. | − x: <b>2x − 6 = 8</b><br>3. | + 6: <b>2x = 14</b><br>4. | : 2: <b>x = 7</b><br>Probe: 3 · 5 = 15 und 7 + 8 = 15 ✔</p>', check: { q: 'Löse 4(x + 1) = 20.', o: ['x = 4', 'x = 5', 'x = 16'], a: 0, why: '4x + 4 = 20 → 4x = 16 → x = 4.' } },
      { t: 'Gipfel: Klammern mit x²', b: '<div class="bigex">(x + 3)(x − 1) = x² + 9</div><p>Auflösen: x² + 2x − 3 = x² + 9. Jetzt <b>verschwindet x²</b> auf beiden Seiten (| − x²): 2x − 3 = 9 → x = 6.</p><div class="merke">Steht auf beiden Seiten x², fällt es weg!</div>' },
    ],
  });

  /* =======================================================
     WELT 6 – Bruchgleichungen
     ======================================================= */
  W({
    id: 'w6', nr: 6, icon: '🦂', title: 'Bruch-Wüste', topic: 'Bruchgleichungen', color: '#ff9f1c',
    boss: { name: 'Bruch-Bestie', icon: '🦂' }, hasSteps: true,
    merke: 'Brüche loswerden: Multipliziere <b>beide Seiten (jedes Glied!)</b> mit dem <b>Hauptnenner</b>. Dann wie gewohnt lösen. Steht x im Nenner: Der Nenner darf <b>nie 0</b> werden (Definitionsmenge).',
    beispiel: `${F('x', 3)} + ${F('x', 4)} = 7 | · 12 → 4x + 3x = 84 → 7x = 84 → x = 12`,
    fehler: `${F('x', 3)} + 2 = 5 | · 3 → x + 2 = 15 ✘ – auch die 2 muss mal 3 genommen werden: x + 6 = 15.`,
    gen(l, stepMode) {
      if (l === 1) {
        const a = ri(2, 9), k = ri(0, 2);
        if (k === 0) { const x = a * ri(1, 9); const b = x / a; return mk(`${F('x', a)} = ${fmt(b)}`, x, a, `x = ${fmt(b)} · ${a}`, [{ h: `x = ${fmt(b)} : ${a}`, msg: 'Mal nehmen, nicht teilen – der Bruchstrich bedeutet „geteilt“, die Umkehrung ist „mal“.' }]); }
        if (k === 1) { const x = a * ri(1, 9), b = rnz(-9, 9), c = x / a + b; return mk(`${F('x', a)} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${fmt(c)}`, x, a, `x ${b < 0 ? '−' : '+'} ${Math.abs(a * b)} = ${fmt(a * c)}`, [{ h: `x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${fmt(a * c)}`, msg: `Jedes Glied mal ${a} – auch die ${fmt(b)}!` }]); }
        const b = rnz(-9, 9), c = ri(1, 9), x = a * c - b;
        if (x <= 0) return this.gen(l, stepMode);
        return mk(`${F(lin(1, b), a)} = ${fmt(c)}`, x, a, `${lin(1, b)} = ${fmt(a * c)}`, [{ h: `${lin(1, b)} = ${fmt(c)}`, msg: `Beide Seiten mal ${a}!` }]);
      }
      if (l === 2) {
        if (U.chance(0.55)) {
          let a, b; do { a = ri(2, 6); b = ri(2, 8); } while (a === b);
          const L = U.lcm(a, b), x = L * rnz(-3, 4), c = x / a + x / b;
          if (!Number.isInteger(c) || Math.abs(L * c) >= 1000) return this.gen(l, stepMode);
          return mk(`${F('x', a)} + ${F('x', b)} = ${fmt(c)}`, x, L, `${coef(L / a)} + ${coef(L / b)} = ${fmt(L * c)}`, [{ h: `${coef(L / a)} + ${coef(L / b)} = ${fmt(c)}`, msg: `Auch die rechte Seite mal ${L}!` }, `x + x = ${fmt(c * L)}`], [a * b !== L ? a * b : null, a + b]);
        }
        let a, b; do { a = ri(2, 6); b = ri(2, 6); } while (a === b);
        const p = rnz(-6, 6); let x; do x = rnz(-9, 12); while ((b * (x + p)) % a !== 0);
        const q = (b * (x + p)) / a - x;
        if (Math.abs(q) > 15 || q === 0) return this.gen(l, stepMode);
        const L = U.lcm(a, b);
        return mk(`${F(lin(1, p), a)} = ${F(lin(1, q), b)}`, x, L, `${L / a} · ${br(1, p)} = ${L / b} · ${br(1, q)}`, [{ h: `${br(1, p)} = ${br(1, q)}`, msg: 'Die Nenner fallen nur weg, wenn du mit dem Hauptnenner multiplizierst.' }], [a * b !== L ? a * b : null, a + b]);
      }
      if (U.chance(0.4)) {
        // Verhältnisgleichung a / x = b / c
        const k = ri(2, 6), b = ri(1, 9), c = ri(2, 9), a = b * k, x = c * k;
        return mk(`${F(a, 'x')} = ${F(b, c)}`, x, null, `${a} · ${c} = ${b} · x`, [{ h: `${a} · ${b} = ${c} · x`, msg: 'Über Kreuz multiplizieren: Zähler links mal Nenner rechts.' }], null, true, 0);
      }
      let a, b; do { a = ri(2, 6); b = ri(2, 8); } while (a === b);
      const p = ri(1, 6); let x; do x = rnz(-8, 12); while ((b * (x - p)) % a !== 0 || x === p);
      const q = (b * (x - p)) / a - x;
      if (q === 0 || Math.abs(q) > 15 || x + q === 0 || q === -p) return this.gen(l, stepMode);
      return mk(`${F(a, lin(1, -p))} = ${F(b, lin(1, q))}`, x, null, `${a} · ${br(1, q)} = ${b} · ${br(1, -p)}`, [{ h: `${a} · ${br(1, -p)} = ${b} · ${br(1, q)}`, msg: 'Über Kreuz: Zähler links mal Nenner RECHTS.' }, { h: `${lin(a, q)} = ${lin(b, -p)}`, msg: 'Die Klammern sind wichtig: Der Zähler wird mit dem GANZEN Nenner multipliziert.' }], null, true, p);

      function mk(eq, x, L, after, wrongAfter, wrongL, cross, forbidden) {
        const steps = [];
        if (L) {
          const s = U.choice({ q: '<b>Schritt 1:</b> Mit welcher Zahl multiplizierst du beide Seiten, damit alle Brüche verschwinden?', board: `| · ${L}`, why: `${L} ist der Hauptnenner (kleinstes gemeinsames Vielfaches der Nenner).` }, String(L), (wrongL || []).filter(Boolean).map(String).concat([String(L + 1), String(L * 2)]));
          steps.push(s);
        }
        if (cross) steps.push(U.choice({ q: '<b>Schritt 1:</b> Multipliziere über Kreuz. Welche Gleichung entsteht?', board: after, why: 'Zähler links mal Nenner rechts = Zähler rechts mal Nenner links.' }, after, wrongAfter));
        else steps.push(U.choice({ q: `<b>Schritt 2:</b> Was entsteht, wenn du <b>jedes Glied</b> mit ${L} multiplizierst?`, board: after, why: 'Jedes Glied auf beiden Seiten wird multipliziert.' }, after, wrongAfter));
        steps.push(num('<b>Letzter Schritt:</b> Löse nach x auf. x = ?', x, { board: `x = ${fmt(x)}` }));
        if (forbidden !== undefined && forbidden !== 0) steps.unshift(num(`<b>Erst prüfen:</b> Welche Zahl darf x hier <b>nicht</b> sein? (Nenner ≠ 0)`, forbidden, { board: `x ≠ ${fmt(forbidden)}`, why: `Für x = ${fmt(forbidden)} wäre der Nenner ${lin(1, -forbidden)} = 0.` }));
        const hint = L ? `Hauptnenner: ${L}. Multipliziere jedes Glied damit.` : 'Über Kreuz multiplizieren.';
        if (stepMode || (l === 3 && forbidden) || (l === 1 && U.chance(0.35))) return { type: 'steps', q: `Löse: ${E(eq)}`, steps, hints: [hint], sol: `${after} → <b>x = ${fmt(x)}</b>` };
        return num(`Löse die Bruchgleichung: ${E(eq)} <span class="note">x = ?</span>`, x, { hints: [hint, `Danach: ${after}`], sol: `${eq}<br>→ ${after}<br>→ <b>x = ${fmt(x)}</b>` });
      }
    },
    story: [
      { t: 'Willkommen in der Bruch-Wüste', b: `<p>Hier lauern Gleichungen mit <b>Brüchen</b> 🦂. Der Trick: Wir machen die Brüche einfach <b>weg</b>!</p><div class="bigex">${F('x', 4)} = 3 | · 4 → x = 12</div><p>Der Bruchstrich bedeutet „geteilt“. Das Gegenteil ist „mal“.</p>` },
      { t: 'Jedes Glied bekommt etwas ab!', b: `<div class="bigex">${F('x', 3)} + 2 = 5 | · 3</div><p>Wichtig: <b>Jedes Glied</b> wird mal 3 genommen:</p><div class="bigex">x + <span class="c3">6</span> = 15 → x = 9</div>`, check: { q: `${F('x', 2)} − 1 = 4 | · 2 ergibt …`, o: ['x − 2 = 8', 'x − 1 = 8', 'x − 2 = 4'], a: 0, why: 'Jedes Glied mal 2: x − 2 = 8.' } },
      { t: 'Mehrere Nenner? Hauptnenner!', b: `<div class="bigex">${F('x', 3)} + ${F('x', 4)} = 7</div><p>Der <b>Hauptnenner</b> ist die kleinste Zahl, in der 3 und 4 aufgehen: <b>12</b>.</p><div class="bigex">| · 12 → 4x + 3x = 84 → x = 12</div>`, check: { q: 'Hauptnenner von 4 und 6?', o: ['12', '24', '10'], a: 0, why: '12 ist das kleinste gemeinsame Vielfache.' } },
      { t: 'x im Nenner – Vorsicht!', b: `<div class="bigex">${F(6, 'x − 2')} = 3</div><p>Durch 0 darf man nie teilen. Hier darf x <b>nicht 2</b> sein! Kurz geschrieben: <b>x ≠ 2</b> (lies: „x ist ungleich 2“).</p><p>Bei zwei Brüchen hilft <b>über Kreuz multiplizieren</b>:</p><div class="bigex">${F(2, 'x')} = ${F(4, 10)} → 2 · 10 = 4 · x → x = 5</div>`, check: { q: `Welche Zahl darf x bei ${F(5, 'x + 3')} nicht sein?`, o: ['−3', '3', '5'], a: 0, why: 'x + 3 = 0 für x = −3.' } },
    ],
  });

  /* =======================================================
     WELT 7 – Formeln
     ======================================================= */
  W({
    id: 'w7', nr: 7, icon: '🦊', title: 'Formel-Fabrik', topic: 'Formeln umstellen', color: '#ff3860',
    boss: { name: 'Formel-Fuchs', icon: '🦊' }, hasSteps: true,
    merke: 'Eine Formel stellst du um wie eine Gleichung: Die <b>gesuchte Größe</b> soll allein stehen. Mache die Rechenschritte mit der <b>Umkehroperation</b> rückgängig: · ↔ :, + ↔ −.',
    beispiel: `A = a · b nach b: | : a → b = ${F('A', 'a')} · u = 2a + 2b nach b: | − 2a → u − 2a = 2b | : 2 → b = ${F('u − 2a', 2)}`,
    fehler: `A = a · b → b = A · a ✘ – die Umkehrung von „mal a“ ist „geteilt durch a“.`,
    gen(l, stepMode) {
      const FORM = [
        { f: 'A = a · b', what: 'Rechteck', find: 'b', res: F('A', 'a'), wr: ['A · a', 'A − a', F('a', 'A')], vals: () => { const a = ri(2, 12), b = ri(2, 12); return { give: `A = ${a * b} cm², a = ${a} cm`, x: b, unit: 'cm', calc: `${a * b} : ${a}` }; } },
        { f: `A = ${F('g · h', 2)}`, what: 'Dreieck', find: 'h', res: F('2A', 'g'), wr: [F('A', '2g'), '2A · g', F('A · g', 2)], vals: () => { const g = ri(2, 12) * 2, h = ri(2, 12); return { give: `A = ${(g * h) / 2} cm², g = ${g} cm`, x: h, unit: 'cm', calc: `2 · ${(g * h) / 2} : ${g}` }; } },
        { f: 'u = 2a + 2b', what: 'Rechteck-Umfang', find: 'b', res: F('u − 2a', 2), wr: [F('u', 2) + ' − 2a', 'u − a', F('u + 2a', 2)], vals: () => { const a = ri(2, 15), b = ri(2, 15); return { give: `u = ${2 * a + 2 * b} cm, a = ${a} cm`, x: b, unit: 'cm', calc: `(${2 * a + 2 * b} − ${2 * a}) : 2` }; } },
        { f: 'V = a · b · c', what: 'Quader', find: 'c', res: F('V', 'a · b'), wr: ['V · a · b', 'V − a − b', F('a · b', 'V')], vals: () => { const a = ri(2, 9), b = ri(2, 9), c = ri(2, 9); return { give: `V = ${a * b * c} cm³, a = ${a} cm, b = ${b} cm`, x: c, unit: 'cm', calc: `${a * b * c} : (${a} · ${b})` }; } },
        { f: 's = v · t', what: 'Weg-Zeit', find: 't', res: F('s', 'v'), wr: ['s · v', F('v', 's'), 's − v'], vals: () => { const v = pick([20, 30, 40, 50, 60, 80, 100]), t = ri(1, 6); return { give: `s = ${v * t} km, v = ${v} km/h`, x: t, unit: 'h', calc: `${v * t} : ${v}` }; } },
      ];
      const HARD = [
        { f: `Z = ${F('K · p · t', 100)}`, what: 'Zinsen', find: 'p', res: F('100 · Z', 'K · t'), wr: [F('Z · K · t', 100), F('100 · K', 'Z · t'), F('Z', '100 · K · t')], vals: () => { const K = ri(2, 20) * 100, p = ri(1, 5), t = ri(1, 4); return { give: `Z = ${(K * p * t) / 100} €, K = ${K} €, t = ${t} Jahre`, x: p, unit: '%', calc: `100 · ${(K * p * t) / 100} : (${K} · ${t})` }; } },
        { f: 'F = 1,8 · C + 32', what: 'Temperatur (Fahrenheit)', find: 'C', res: F('F − 32', '1,8'), wr: [F('F', '1,8') + ' − 32', F('F + 32', '1,8'), '1,8 · (F − 32)'], vals: () => { const C = pick([-10, 0, 5, 10, 15, 20, 25, 30, 35, 40]); return { give: `F = ${fmt(1.8 * C + 32)} °F`, x: C, unit: '°C', calc: `(${fmt(1.8 * C + 32)} − 32) : 1,8` }; } },
        { f: `A = ${F('a + c', 2)} · h`, what: 'Trapez', find: 'h', res: F('2A', 'a + c'), wr: [F('A', 'a + c'), F('2A', 'a') + ' + c', '2A · (a + c)'], vals: () => { const c = ri(2, 10); let a; do a = ri(3, 12); while ((a + c) % 2); const h = ri(2, 10); return { give: `A = ${((a + c) * h) / 2} cm², a = ${a} cm, c = ${c} cm`, x: h, unit: 'cm', calc: `2 · ${((a + c) * h) / 2} : ${a + c}` }; } },
        { f: 'u = 2a + 2b', what: 'Rechteck-Umfang', find: 'a', res: F('u − 2b', 2), wr: ['u − 2b', F('u', 2) + ' − 2b', F('u + 2b', 2)], vals: () => { const a = ri(2, 15), b = ri(2, 15); return { give: `u = ${2 * a + 2 * b} cm, b = ${b} cm`, x: a, unit: 'cm', calc: `(${2 * a + 2 * b} − ${2 * b}) : 2` }; } },
      ];
      const pool = l === 3 ? HARD : FORM;
      const fo = pick(l === 1 ? FORM.slice(0, 3).concat(FORM.slice(4)) : pool);
      const v = fo.vals();
      if (l === 1 && !stepMode) {
        return num(`<b>${fo.what}:</b> ${E(fo.f)} Gegeben: ${v.give}. Berechne <b>${fo.find}</b>.`, v.x, { unit: v.unit, hints: [`Stelle zuerst nach ${fo.find} um: ${fo.find} = ${fo.res}`, `Rechne: ${v.calc}`], sol: `${fo.find} = ${fo.res} = ${v.calc} = <b>${fmt(v.x)} ${v.unit}</b>` });
      }
      const s1 = U.choice({ q: `<b>Schritt 1:</b> Stelle ${E(fo.f)} nach <b>${fo.find}</b> um.`, board: `${fo.find} = ${fo.res}`, why: 'Die Rechenschritte rund um die gesuchte Größe mit der Umkehroperation rückgängig machen.' }, `${fo.find} = ${fo.res}`, fo.wr.map((w) => ({ h: `${fo.find} = ${w}`, msg: 'Probe: Setze die umgestellte Formel in die alte ein – passt das?' })));
      const s2 = num(`<b>Schritt 2:</b> Gegeben: ${v.give}. Berechne ${fo.find}.`, v.x, { unit: v.unit, board: `${fo.find} = ${v.calc} = ${fmt(v.x)} ${v.unit}` });
      if (l === 2 && !stepMode && U.chance(0.5)) return Object.assign(s1, { q: `<b>${fo.what}:</b> Stelle ${E(fo.f)} nach <b>${fo.find}</b> um.`, hints: ['Welche Rechnung „klebt“ an ' + fo.find + '? Mach sie rückgängig.'], sol: `${fo.find} = ${fo.res}` });
      return { type: 'steps', q: `<b>${fo.what}</b> – Formel umstellen und rechnen.`, steps: [s1, s2], hints: ['Erst umstellen, dann einsetzen.'], sol: `${fo.find} = ${fo.res} = ${v.calc} = <b>${fmt(v.x)} ${v.unit}</b>` };
    },
    story: [
      { t: 'Die Formel-Fabrik', b: `<p>Formeln sind <b>Rechen-Maschinen</b> 🏭. Zum Beispiel für den Flächeninhalt eines Rechtecks:</p><div class="bigex">A = a · b</div><p>Kennst du A und a, aber nicht b? Dann <b>stellst du die Formel um</b> – wie eine Gleichung!</p>` },
      { t: 'Umkehr-Operationen', b: `<div class="bigex">A = a · b | : a → <b>b = ${F('A', 'a')}</b></div><p>„mal a“ wird rückgängig gemacht durch „geteilt durch a“. Aus + wird −, aus · wird :.</p>`, check: { q: 's = v · t nach t umgestellt:', o: [`t = ${F('s', 'v')}`, 't = s · v', 't = s − v'], a: 0, why: '| : v → t = s : v.' } },
      { t: 'Zwei Schritte', b: `<div class="bigex">u = 2a + 2b</div><p>Gesucht b: Erst das „+ 2a“ weg (| − 2a), dann das „2 ·“ weg (| : 2):</p><div class="bigex">u − 2a = 2b → <b>b = ${F('u − 2a', 2)}</b></div>`, check: { q: 'u = 30 cm, a = 6 cm. Wie lang ist b?', o: ['9 cm', '12 cm', '18 cm'], a: 0, why: '(30 − 12) : 2 = 9.' } },
      { t: 'Profi-Tipp', b: '<div class="merke">Erst umstellen, dann Zahlen einsetzen – so siehst du den Rechenweg klar.</div><p>Probe: Setze dein Ergebnis in die Ausgangsformel ein. Stimmt die Rechnung? ✔</p>' },
    ],
  });

  /* Alle Welten gemischt – Endgegner „Rückspiegel“ */
  MA.FINAL = { id: 'final', nr: 8, icon: '🤖', title: 'Rückspiegel-Turm', topic: 'Alles gemischt', color: '#00f0ff', boss: { name: 'Mega-Robo', icon: '🤖' }, gen(l) { const w = pick(MA.WORLDS); const t = w.gen.call(w, l); t.worldId = w.id; return t; } };
})();
