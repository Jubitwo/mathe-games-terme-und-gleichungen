/* Prüft alle Aufgaben-Generatoren der 7 Welten automatisch.
   Aufruf: node tools/check.js [Durchläufe]                  */
const fs = require('fs'), path = require('path');
global.window = global;
const L = (f) => eval(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'));
L('util.js'); L('worlds.js');
const U = MA.U, RUNS = +process.argv[2] || 300;
let errors = 0;
const bad = /NaN|undefined|Infinity|\[object|[=(:;] -\d|\b1x\b|\+ −|− −|\+ \+/;
const err = (w, l, m, t) => { errors++; if (errors < 40) console.log(`✘ ${w} L${l}: ${m}`, t ? JSON.stringify(t, (k, v) => (typeof v === 'function' ? 'fn' : v)).slice(0, 260) : ''); };
function checkTask(w, l, t) {
  const txt = [t.q, t.vis, t.sol, ...(t.hints || []), ...(t.options || []), t.board, t.why].filter(Boolean).join(' ');
  if (bad.test(txt.replace(/<[^>]+>/g, ' '))) err(w, l, 'Text: ' + (txt.replace(/<[^>]+>/g, ' ').match(/.{0,30}(NaN|undefined|Infinity|\[object|[=(:;] -\d|\b1x\b|\+ −|− −|\+ \+).{0,20}/) || [''])[0], null);
  switch (t.type) {
    case 'num': if (!isFinite(t.answer)) err(w, l, 'num-Antwort', t); break;
    case 'choice': if (!(t.answer >= 0 && t.answer < t.options.length) || new Set(t.options.map(U.strip)).size !== t.options.length) err(w, l, 'choice', t); break;
    case 'tpl': {
      const n = t.tpl.filter((p) => typeof p === 'object').length;
      if (t.answer.length !== n || t.answer.some((v) => !isFinite(v))) err(w, l, 'tpl-Länge', t);
      if (t.verify && !t.verify(t.answer)) err(w, l, 'verify(answer) = false', t);
      break;
    }
    case 'steps': if (!t.steps || !t.steps.length) err(w, l, 'steps leer', t); t.steps.forEach((s) => checkTask(w, l, s)); break;
    default: err(w, l, 'Typ ' + t.type, t);
  }
  if (t.type !== 'steps' && !t.board && !t.hints) err(w, l, 'keine Tipps', t);
}
for (const w of MA.WORLDS.concat([MA.FINAL])) {
  if (w !== MA.FINAL && !(w.merke && w.beispiel && w.fehler && w.story && w.story.length >= 4)) err(w.id, 0, 'Lerninhalt unvollständig');
  for (const l of [1, 2, 3]) {
    const seen = new Set();
    for (let i = 0; i < RUNS; i++) {
      for (const sm of w.hasSteps ? [false, true] : [false]) {
        let t; try { t = w.gen(l, sm); } catch (e) { err(w.id, l, 'Exception ' + e.stack.split('\n').slice(0, 2).join(' ')); continue; }
        if (!t.sol) err(w.id, l, 'keine Lösung', t);
        checkTask(w.id, l, t); seen.add(t.q + JSON.stringify(t.answer) + (t.steps ? t.steps.map((x) => x.q + JSON.stringify(x.answer)).join() : ''));
      }
    }
    console.log(`${w.id} L${l}: ${seen.size} verschiedene Aufgaben`);
    if (seen.size < 12) err(w.id, l, 'wenig Abwechslung');
  }
}
console.log(`\n${errors} Fehler.`); process.exit(errors ? 1 : 0);
