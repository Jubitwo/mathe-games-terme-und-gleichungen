/* =========================================================
   Mathe Games – Aufgaben anzeigen, eingeben, prüfen
   Typen: num (Zahl), choice (Auswahl), tpl (Lückenterm mit
   Kästchen), steps (Schritt für Schritt mit Rechenweg)
   Handy-optimiert: eigene Tastatur, keine Bildschirmtastatur.
   ========================================================= */
(function () {
  const U = MA.U;
  MA.keyTarget = null;
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (MA.keyTarget) MA.keyTarget(e);
  });

  /* ---------- Lückenterm darstellen ---------- */
  const isVarStart = (p) => typeof p === 'string' && /^[a-zA-Z]/.test(p);
  const fixedBox = (t, i, part) => part.lead && t.answer && Math.abs(t.answer[part.b]) === 1 && isVarStart(t.tpl[i + 1]);
  /* Wert in einem Kästchen anzeigen: führend „−3“, sonst „+ 3“ / „− 3“; vor Variablen ohne 1 */
  const boxText = (v, lead, beforeVar) => {
    if (v === '' || v === null || v === undefined) return '';
    const n = U.parse(v);
    if (isNaN(n)) return String(v).replace(/-/g, '−');
    const abs = Math.abs(n);
    const num = beforeVar && abs === 1 ? '' : U.fmt(abs, 4);
    if (lead) return (n < 0 ? '−' : '') + (num || (beforeVar ? '' : '1'));
    return (n < 0 ? '− ' : '+ ') + num;
  };
  MA.tplHTML = (t, vals) => t.tpl.map((p, i) => {
    if (typeof p === 'string') return p.split('\n').map((x) => `<span class="tp">${x}</span>`).join('<span class="brk"></span>');
    if (fixedBox(t, i, p)) return `<span class="tp">${t.answer[p.b] < 0 ? '−' : ''}</span>`;
    return `<span class="tp tv">${boxText(vals[p.b], p.lead, isVarStart(t.tpl[i + 1]))}</span>`;
  }).join('');

  /* ---------- Antwort als HTML ---------- */
  MA.answerHTML = (t) => {
    if (t.type === 'num') return U.fmt(t.answer, 6) + (t.unit ? ' ' + t.unit : '');
    if (t.type === 'choice') return t.options[t.answer];
    if (t.type === 'tpl') return MA.tplHTML(t, t.answer);
    return '';
  };

  /* ---------- Prüfen ---------- */
  MA.check = (t, given) => {
    if (t.type === 'num') {
      const v = typeof given === 'string' ? U.parse(given) : given;
      if (isNaN(v)) return { ok: false, invalid: true };
      const ok = Math.abs(v - t.answer) <= (t.tol || 1e-6);
      let msg = null;
      if (!ok && t.mistakes) for (const m of t.mistakes) if (Math.abs(v - m.v) <= (t.tol || 1e-6)) { msg = m.msg; break; }
      return { ok, msg, given };
    }
    if (t.type === 'choice') {
      const ok = given === t.answer;
      const m = !ok && (t.mistakes || []).find((x) => x.v === given);
      return { ok, msg: m ? m.msg : null, given };
    }
    if (t.type === 'tpl') {
      const vals = given.map((g) => (typeof g === 'number' ? g : U.parse(g)));
      if (vals.some((v) => isNaN(v))) return { ok: false, invalid: true };
      const ok = t.verify ? !!t.verify(vals) : vals.every((v, i) => Math.abs(v - t.answer[i]) < 1e-9);
      return { ok, msg: !ok && t.diagnose ? t.diagnose(vals) : null, given: vals };
    }
    return { ok: false };
  };

  /* ---------- Tastatur ---------- */
  const keypad = (kind, frac) => {
    const keys = [['7'], ['8'], ['9'], ['del', '⌫'], ['4'], ['5'], ['6'], ['-', '±'], ['1'], ['2'], ['3'], kind === 'tpl' ? ['next', '▶'] : [',', ','], ['0'], kind === 'tpl' ? [',', ','] : frac ? ['/', '/'] : [',', ','], ['ok', 'OK']];
    const seen = new Set();
    return `<div class="keypad ${kind} ${kind === 'num' && !frac ? 'nofr' : ''}">${keys.filter(([k]) => (seen.has(k) ? false : seen.add(k))).map(([k, l]) => `<button type="button" class="key k-${k === '-' ? 'neg' : k === ',' ? 'com' : k === '/' ? 'fr' : k}" data-k="${k}" aria-label="${l || k}">${l || k}</button>`).join('')}</div>`;
  };

  /* ---------- Aufgabe darstellen ----------
     o: { onAnswer(r), hints, onHint, showHints, disable, keyboard, display, worldId } */
  MA.renderTask = (el, t, o = {}) => {
    if (t.type === 'steps') return MA.renderSteps(el, t, o);
    el.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'task t-' + t.type + (o.compact ? ' compact' : '');
    root.innerHTML = `<div class="task-q">${t.q}</div>${t.vis ? `<div class="task-vis">${t.vis}</div>` : ''}<div class="task-ans"></div><div class="task-hintbox"></div>`;
    el.appendChild(root);
    const ans = root.querySelector('.task-ans');
    let locked = false, keyHandler = null;
    const submit = (given) => {
      if (locked) return;
      const r = MA.check(t, given);
      if (r.invalid) { root.classList.remove('shake'); void root.offsetWidth; root.classList.add('shake'); MA.Sound.bad(); return; }
      o.onAnswer && o.onAnswer(r);
    };
    if (o.display) ans.remove();
    else if (t.type === 'num') {
      let value = '';
      ans.innerHTML = `<div class="ans-display"><span class="ans-pre">${t.pre || ''}</span><span class="ans-val">&nbsp;</span>${t.unit ? `<span class="ans-unit">${t.unit}</span>` : ''}</div>${keypad('num', /\//.test(t.q))}`;
      const disp = ans.querySelector('.ans-val');
      const upd = () => { disp.textContent = value ? value.replace(/-/g, '−') : ' '; disp.classList.toggle('has', !!value); };
      const press = (k) => {
        if (locked) return;
        if (k === 'del') value = value.slice(0, -1);
        else if (k === 'ok') { if (value) submit(value); else submit(''); return; }
        else if (k === '-') value = value.startsWith('-') ? value.slice(1) : '-' + value;
        else if (k === ',' && /,[^/]*$/.test(value)) return;
        else if (k === 'next') return;
        else if (value.length < 12) value += k;
        upd(); MA.Sound.click();
      };
      ans.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('pointerdown', (e) => { e.preventDefault(); press(b.dataset.k); }));
      keyHandler = (e) => {
        const k = e.key;
        if (/^[0-9]$/.test(k)) press(k); else if (k === ',' || k === '.') press(','); else if (k === '-') press('-'); else if (k === '/') press('/');
        else if (k === 'Backspace') press('del'); else if (k === 'Enter') press('ok'); else return;
        e.preventDefault();
      };
    } else if (t.type === 'tpl') {
      const n = t.tpl.filter((p) => typeof p === 'object').length;
      const vals = Array(n).fill('');
      t.tpl.forEach((p, i) => { if (typeof p === 'object' && fixedBox(t, i, p)) vals[p.b] = String(t.answer[p.b]); });
      const editable = [];
      const line = t.tpl.map((p, i) => {
        if (typeof p === 'string') return p.split('\n').map((x) => `<span class="tp">${x}</span>`).join('<span class="brk"></span>');
        if (fixedBox(t, i, p)) return `<span class="tp">${t.answer[p.b] < 0 ? '−' : ''}</span>`;
        editable.push(p.b);
        return `<button type="button" class="tbox" data-b="${p.b}" data-lead="${p.lead ? 1 : 0}" data-var="${isVarStart(t.tpl[i + 1]) ? 1 : 0}" aria-label="Lücke ${editable.length}"></button>`;
      }).join('');
      ans.innerHTML = `<div class="tpl-line">${line}</div><div class="tpl-help">Tippe ein Kästchen an. <b>▶</b> springt zum nächsten. Vorzeichen mit <b>±</b>.</div>${keypad('tpl')}`;
      let cur = editable[0];
      const boxes = () => ans.querySelectorAll('.tbox');
      const paint = () => boxes().forEach((b) => {
        const i = +b.dataset.b;
        b.classList.toggle('cur', i === cur);
        b.classList.toggle('empty', vals[i] === '');
        b.innerHTML = vals[i] === '' ? '<span class="ph">?</span>' : boxText(vals[i], b.dataset.lead === '1', b.dataset.var === '1') || '&nbsp;';
        if (vals[i] !== '' && boxText(vals[i], b.dataset.lead === '1', b.dataset.var === '1') === '') b.innerHTML = '<span class="one">1</span>';
      });
      boxes().forEach((b) => b.addEventListener('pointerdown', (e) => { e.preventDefault(); if (locked) return; cur = +b.dataset.b; paint(); MA.Sound.click(); }));
      const next = () => { const k = editable.indexOf(cur); cur = editable[(k + 1) % editable.length]; };
      const press = (k) => {
        if (locked) return;
        let v = vals[cur];
        if (k === 'del') { if (v === '') { const kk = editable.indexOf(cur); if (kk > 0) cur = editable[kk - 1]; } else vals[cur] = v.slice(0, -1); }
        else if (k === 'next') next();
        else if (k === 'ok') {
          const empty = editable.find((i) => vals[i] === '' || vals[i] === '-');
          if (empty !== undefined) { cur = empty; paint(); root.classList.remove('shake'); void root.offsetWidth; root.classList.add('shake'); MA.toast('Fülle zuerst alle Kästchen aus.', 1400); return; }
          submit(vals.slice()); return;
        } else if (k === '-') vals[cur] = v.startsWith('-') ? v.slice(1) : '-' + v;
        else if (k === ',' && v.includes(',')) return;
        else if (v.replace('-', '').length < 5) vals[cur] = v + k;
        paint(); MA.Sound.click();
      };
      ans.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('pointerdown', (e) => { e.preventDefault(); press(b.dataset.k); }));
      keyHandler = (e) => {
        const k = e.key;
        if (/^[0-9]$/.test(k)) press(k); else if (k === '-') press('-'); else if (k === ',' || k === '.') press(',');
        else if (k === 'Tab' || k === 'ArrowRight' || k === ' ') press('next'); else if (k === 'Backspace') press('del'); else if (k === 'Enter') press('ok'); else return;
        e.preventDefault();
      };
      paint();
    } else if (t.type === 'choice') {
      const dis = o.disable || [];
      ans.innerHTML = `<div class="choices">${t.options.map((op, i) => `<button type="button" class="choice ${dis.includes(i) ? 'wrong' : ''}" data-i="${i}" ${dis.includes(i) ? 'disabled' : ''}><span class="ck">${'ABCD'[i]}</span><span class="ct">${op}</span></button>`).join('')}</div>`;
      ans.querySelectorAll('.choice').forEach((b) => b.addEventListener('click', () => { if (locked) return; b.classList.add('sel'); submit(+b.dataset.i); }));
      keyHandler = (e) => { const i = 'abcd1234'.indexOf(e.key.toLowerCase()) % 4; if (i >= 0 && i < t.options.length && !dis.includes(i)) { e.preventDefault(); ans.querySelectorAll('.choice')[i].click(); } };
    }

    /* Tipps + Lern-Hilfe */
    let hintIdx = 0;
    const hb = root.querySelector('.task-hintbox');
    const wid = t.worldId || o.worldId;
    if (o.hints && t.hints && t.hints.length && !o.display) {
      hb.innerHTML = `<div class="hint-btns"><button type="button" class="btn-hint">💡 Tipp</button>${wid ? '<button type="button" class="btn-hint btn-learn">📒 Merke</button>' : ''}</div><div class="hints"></div>`;
      const btn = hb.querySelector('.btn-hint');
      btn.addEventListener('click', () => {
        if (hintIdx >= t.hints.length) return;
        hb.querySelector('.hints').insertAdjacentHTML('beforeend', `<div class="hint">💡 ${t.hints[hintIdx]}</div>`);
        hintIdx++; o.onHint && o.onHint(hintIdx);
        if (hintIdx >= t.hints.length) btn.disabled = true; else btn.textContent = '💡 Noch ein Tipp';
      });
      const lb = hb.querySelector('.btn-learn');
      if (lb) lb.addEventListener('click', () => MA.showMerke(wid));
      for (let i = 0; i < (o.showHints || 0); i++) btn.click();
    }
    if (o.keyboard !== false && keyHandler) MA.keyTarget = keyHandler;
    /* Eingabe + Tastatur ins Bild holen (wichtig auf kleinen Handys) */
    if (!o.display && (t.type === 'num' || t.type === 'tpl') && !o.noScroll) {
      requestAnimationFrame(() => {
        const r = ans.getBoundingClientRect();
        if (r.bottom > window.innerHeight - 4) {
          const top = window.scrollY + r.bottom - window.innerHeight + 10;
          const qTop = window.scrollY + root.getBoundingClientRect().top - 6;
          window.scrollTo({ top: Math.min(top, Math.max(qTop, top)), behavior: 'smooth' });
        }
      });
    }
    return {
      root,
      lock(v = true) { locked = v; root.classList.toggle('locked', v); },
      destroy() { if (MA.keyTarget === keyHandler) MA.keyTarget = null; },
      markChoice(r) { if (t.type !== 'choice') return; root.querySelectorAll('.choice').forEach((b, i) => { if (i === t.answer) b.classList.add('right'); else if (i === r.given) b.classList.add('wrong'); }); },
    };
  };

  /* ---------- Schritt für Schritt ----------
     Jeder Schritt ist selbst eine kleine Aufgabe. Richtige Schritte
     werden in den „Rechenweg“ geschrieben. Pro Schritt 2 Versuche. */
  MA.renderSteps = (el, t, o = {}) => {
    el.innerHTML = `<div class="task t-steps"><div class="task-q">${t.q}</div>${t.vis ? `<div class="task-vis">${t.vis}</div>` : ''}
      <div class="board"><div class="board-h">📝 Rechenweg</div><div class="board-lines">${t.ctx ? `<div class="bl first">${t.ctx}</div>` : ''}</div></div>
      <div class="step-progress">${t.steps.map((_, i) => `<span class="sp" data-i="${i}"></span>`).join('')}</div>
      <div class="step-area"></div></div>`;
    const lines = el.querySelector('.board-lines'), area = el.querySelector('.step-area');
    let i = 0, errors = 0, w = null, alive = true;
    const dots = el.querySelectorAll('.sp');
    const run = () => {
      if (!alive) return;
      if (w) w.destroy();
      if (i >= t.steps.length) { o.onAnswer && o.onAnswer({ ok: true, errors, steps: true }); return; }
      dots.forEach((d, k) => { d.classList.toggle('cur', k === i); d.classList.toggle('done', k < i); });
      const s = t.steps[i];
      let tries = 0, dis = [];
      const ask = () => {
        w = MA.renderTask(area, s, {
          keyboard: o.keyboard, disable: dis.slice(), worldId: t.worldId || o.worldId,
          onAnswer(r) {
            w.lock();
            if (r.ok) {
              MA.Sound.ok();
              lines.insertAdjacentHTML('beforeend', `<div class="bl new">${s.board || MA.answerHTML(s)}</div>`);
              i++; setTimeout(run, 450);
              return;
            }
            tries++; errors++; MA.Sound.bad();
            if (s.type === 'choice') dis.push(r.given);
            const fb = document.createElement('div');
            fb.className = 'fb ' + (tries < 2 ? 'fb-try' : 'fb-bad');
            fb.innerHTML = tries < 2
              ? `<div class="fb-head">🤔 Noch nicht – versuch's nochmal!</div>${r.msg ? `<div class="fb-msg">⚠️ ${r.msg}</div>` : ''}${s.why ? `<div class="fb-hint-line">💡 ${s.why}</div>` : ''}<button type="button" class="btn btn-next">Nochmal ▶</button>`
              : `<div class="fb-head">So geht's:</div><div class="fb-ans">${s.board || MA.answerHTML(s)}</div>${s.why ? `<div class="fb-hint-line">${s.why}</div>` : ''}<button type="button" class="btn btn-next">Weiter ▶</button>`;
            area.appendChild(fb);
            fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            const go = () => { if (MA.keyTarget === kh) MA.keyTarget = null; if (tries < 2) ask(); else { lines.insertAdjacentHTML('beforeend', `<div class="bl new help">${s.board || MA.answerHTML(s)}</div>`); i++; run(); } };
            const kh = (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } };
            fb.querySelector('.btn-next').addEventListener('click', go);
            setTimeout(() => (MA.keyTarget = kh), 200);
          },
        });
      };
      ask();
    };
    run();
    return { root: el.firstChild, lock() {}, destroy() { alive = false; if (w) w.destroy(); }, markChoice() {} };
  };

  /* ---------- Rückmeldung ---------- */
  MA.feedback = (el, t, r, o = {}) => {
    const box = document.createElement('div');
    box.className = 'fb ' + (r.ok ? 'fb-ok' : 'fb-bad');
    const w = MA.WORLDS.find((x) => x.id === (t.worldId || o.worldId));
    let html = r.ok
      ? `<div class="fb-head">✔ ${U.pick(MA.PRAISE)}${o.points ? ` <span class="fb-pts">+${o.points}</span>` : ''}</div>`
      : `<div class="fb-head">✘ ${r.timeout ? 'Zeit abgelaufen!' : 'Leider nicht richtig.'}</div>${r.msg ? `<div class="fb-msg">⚠️ ${r.msg}</div>` : ''}${t.type !== 'steps' ? `<div class="fb-ans">Richtig ist: <b>${MA.answerHTML(t)}</b></div>` : ''}`;
    if ((!r.ok || o.showSol) && t.sol) html += `<details class="fb-sol" ${!r.ok ? 'open' : ''}><summary>Lösungsweg</summary><div>${t.sol}</div></details>`;
    if (!r.ok && w) html += `<div class="fb-merke">📌 <b>Merke:</b> ${w.merke}</div>`;
    if (o.onNext && !o.auto) html += `<button type="button" class="btn btn-next">${o.nextLabel || 'Weiter ▶'}</button>`;
    box.innerHTML = html;
    el.appendChild(box);
    let done = false;
    const go = () => { if (done) return; done = true; if (MA.keyTarget === kh) MA.keyTarget = null; o.onNext && o.onNext(); };
    const kh = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
    if (o.onNext && !o.auto) { box.querySelector('.btn-next').addEventListener('click', go); setTimeout(() => { if (!done) MA.keyTarget = kh; }, 250); }
    if (o.auto) setTimeout(go, o.auto);
    setTimeout(() => box.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 30);
    return box;
  };

  /* ---------- Merke-Karte als Fenster ---------- */
  MA.merkeHTML = (w) => `<div class="learn"><div class="lc lc-merke"><div class="lc-h">📌 Merke</div><div>${w.merke}</div></div><div class="lc lc-ex"><div class="lc-h">✏️ Beispiel</div><div>${w.beispiel}</div></div><div class="lc lc-err"><div class="lc-h">⚠️ Typischer Fehler</div><div>${w.fehler}</div></div></div>`;
  MA.showMerke = (id) => {
    const w = MA.WORLDS.find((x) => x.id === id);
    if (!w) return;
    const prev = MA.keyTarget;
    const ov = document.createElement('div');
    ov.className = 'modal';
    ov.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true"><div class="modal-head"><h3 class="pixel ph">📒 ${w.topic.toUpperCase()}</h3><button type="button" class="btn btn-ghost modal-x" aria-label="Schließen">✕</button></div>${MA.merkeHTML(w)}<button type="button" class="btn btn-big modal-ok">Verstanden ▶</button></div>`;
    document.body.appendChild(ov);
    const close = () => { ov.remove(); MA.keyTarget = prev; };
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    ov.querySelector('.modal-x').addEventListener('click', close);
    ov.querySelector('.modal-ok').addEventListener('click', close);
    MA.keyTarget = (e) => { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); close(); } };
  };
})();
