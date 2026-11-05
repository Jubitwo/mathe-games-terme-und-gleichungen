/* =========================================================
   Mathe Games – Spielmodi
   story · training · schritt · blitz · boss
   Kontext c: { world, level, el, hud(html), retry(), back() }
   ========================================================= */
(function () {
  const U = MA.U;
  const G = (MA.Games = {});
  MA.MODES = {
    story: { icon: '📖', name: 'Lern-Story', desc: 'Professor Eule erklärt dir alles – mit Mini-Quiz.' },
    training: { icon: '🎯', name: 'Training', desc: '10 Aufgaben mit Tipps und 2. Versuch. Bis zu 3 Sterne.' },
    schritt: { icon: '🪜', name: 'Schritt für Schritt', desc: 'Löse Gleichungen in kleinen Schritten mit Rechenweg.' },
    blitz: { icon: '⚡', name: 'Blitz-Runde', desc: '60 Sekunden – wie viele schaffst du?' },
    boss: { icon: '⚔️', name: 'Boss-Kampf', desc: 'Besiege den Boss: Jede richtige Antwort ist ein Treffer!' },
  };
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  /* Steps-Aufgaben für schnelle Modi „flach“ machen: nur der letzte Schritt */
  const flat = (t) => {
    if (t.type !== 'steps') return t;
    const s = Object.assign({}, t.steps[t.steps.length - 1]);
    s.q = t.q + '<div class="sub-q">' + s.q + '</div>';
    s.vis = t.vis; s.sol = t.sol; s.hints = t.hints; s.worldId = t.worldId;
    return s;
  };

  MA.result = (c, o) => {
    const starHTML = o.stars !== undefined && o.stars !== null ? `<div class="res-stars">${[1, 2, 3].map((i) => `<span class="${i <= o.stars ? 'on' : ''}" style="animation-delay:${i * 0.25}s">★</span>`).join('')}</div>` : '';
    c.el.innerHTML = `<div class="result"><div class="res-emoji">${o.emoji || '🏆'}</div><h2 class="pixel res-title">${o.title}</h2>${starHTML}${o.record ? '<div class="res-record">NEUER REKORD!</div>' : ''}
      <div class="res-lines">${(o.lines || []).map((l) => `<div>${l}</div>`).join('')}</div>
      <div class="res-btns"><button type="button" class="btn btn-big btn-retry">🔁 Nochmal</button><button type="button" class="btn btn-big btn-alt btn-back">🗺️ Zur Welt</button></div>
      ${o.next ? `<button type="button" class="btn btn-ghost btn-nexttip">${o.next.label}</button>` : ''}</div>`;
    c.el.querySelector('.btn-retry').addEventListener('click', c.retry);
    c.el.querySelector('.btn-back').addEventListener('click', c.back);
    if (o.next) c.el.querySelector('.btn-nexttip').addEventListener('click', o.next.go);
    MA.keyTarget = (e) => { if (e.key === 'Enter') { e.preventDefault(); c.retry(); } };
    if (o.stars >= 2 || o.win) { MA.Sound.win(); MA.confetti(); }
    MA.Store.played();
    if (o.xp) MA.Store.addXP(o.xp);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* =======================================================
     LERN-STORY
     ======================================================= */
  G.story = {
    start(c) {
      const w = c.world, S = w.story;
      let i = 0, alive = true;
      const show = () => {
        if (!alive) return;
        const s = S[i];
        c.hud(`<span>Seite <b>${i + 1}/${S.length}</b></span>`);
        c.el.innerHTML = `<div class="story">
          <div class="story-dots">${S.map((_, k) => `<span class="${k < i ? 'done' : k === i ? 'cur' : ''}"></span>`).join('')}</div>
          <div class="story-card"><div class="owl-row"><div class="owl">🦉</div><div class="bubble"><b>${s.t}</b></div></div>
          <div class="story-body">${s.svg === 'arcs' ? arcs() : ''}${s.b}</div>
          ${s.check ? `<div class="story-check"><div class="sc-q">🧠 <b>Mini-Check:</b> ${s.check.q}</div><div class="choices">${s.check.o.map((x, k) => `<button type="button" class="choice" data-i="${k}"><span class="ck">${'ABC'[k]}</span><span class="ct">${x}</span></button>`).join('')}</div><div class="sc-fb"></div></div>` : ''}
          </div>
          <div class="story-nav"><button type="button" class="btn btn-ghost st-prev" ${i === 0 ? 'disabled' : ''}>◀ Zurück</button><button type="button" class="btn st-next" ${s.check ? 'disabled' : ''}>${i === S.length - 1 ? '🎯 Jetzt üben!' : 'Weiter ▶'}</button></div></div>`;
        const next = c.el.querySelector('.st-next');
        if (s.check) {
          c.el.querySelectorAll('.story-check .choice').forEach((b) => b.addEventListener('click', () => {
            const k = +b.dataset.i, fb = c.el.querySelector('.sc-fb');
            if (k === s.check.a) {
              b.classList.add('right'); c.el.querySelectorAll('.story-check .choice').forEach((x) => (x.disabled = true));
              fb.innerHTML = `<div class="fb fb-ok"><b>✔ Richtig!</b> ${s.check.why}</div>`; next.disabled = false; MA.Sound.ok(); MA.Store.addXP(5);
            } else { b.classList.add('wrong'); b.disabled = true; fb.innerHTML = `<div class="fb fb-try"><b>Fast!</b> Lies dir die Erklärung oben nochmal durch und versuch es erneut.</div>`; MA.Sound.bad(); }
          }));
        }
        c.el.querySelector('.st-prev').addEventListener('click', () => { i--; show(); });
        next.addEventListener('click', () => {
          if (i < S.length - 1) { i++; MA.Sound.click(); show(); window.scrollTo({ top: 0 }); return; }
          MA.Store.storyDone(w.id); MA.Store.addXP(20); MA.Sound.win(); MA.confetti(1500);
          c.toMode('training');
        });
        MA.keyTarget = (e) => { if (e.key === 'Enter' && !next.disabled) { e.preventDefault(); next.click(); } };
      };
      show();
      return { destroy() { alive = false; } };
    },
  };
  /* Pfeil-Bild fürs Ausmultiplizieren */
  function arcs() {
    return `<svg class="arcs" viewBox="0 0 250 110" xmlns="http://www.w3.org/2000/svg">
      <path d="M44 66 Q86 8 126 66" class="arc a1"/><path d="M44 66 Q130 -26 206 66" class="arc a2"/>
      <text x="34" y="96" class="at c1">3</text><text x="64" y="96" class="at">·(</text><text x="116" y="96" class="at c2">x</text><text x="150" y="96" class="at">+</text><text x="196" y="96" class="at c3">4</text><text x="222" y="96" class="at">)</text></svg>`;
  }

  /* =======================================================
     TRAINING – 10 Aufgaben, 2. Versuch, Sterne
     ======================================================= */
  G.training = {
    start(c) {
      const next = MA.taskSource(c.world, c.level);
      const N = 10;
      let i = 0, val = 0, right = 0, firstTry = 0, score = 0, streak = 0, w = null, alive = true;
      const STREAK = { 3: '🔥 3er-Serie! Ab jetzt +5 Bonus', 5: '⚡ 5 in Folge – du bist on fire!', 8: '🚀 8 in Folge – unaufhaltbar!' };
      const hud = () => c.hud(`<span><b>${Math.min(i, N)}</b>/${N}</span><span>⭐ <b>${score}</b></span><span class="streak ${streak >= 3 ? 'hot' : ''}">🔥 ${streak}</span>`);
      const finishTask = (t, r, attempt, hints, st) => {
        let pts = 0, okish = r.ok;
        if (r.steps) { okish = r.errors <= 1; pts = Math.max(3, 12 - r.errors * 3); val += r.errors === 0 ? 1 : r.errors <= 2 ? 0.5 : 0; if (r.errors === 0) firstTry++; right++; }
        else if (r.ok) { right++; if (attempt === 1) { firstTry++; val += 1; } else { val += 0.5; MA.Store.badge('zweiter'); } pts = attempt === 2 ? 3 : Math.max(4, 10 - hints * 3); }
        if (okish) { streak++; pts += streak >= 3 ? 5 : 0; if (STREAK[streak]) MA.toast(STREAK[streak], 1700); if (streak >= 8) MA.Store.badge('streak'); MA.Sound.ok(); } else { streak = 0; MA.Sound.bad(); }
        score += pts; hud();
        if (r.steps) MA.feedback(st, t, { ok: true }, { onNext: step, points: pts, showSol: false, nextLabel: r.errors ? `Geschafft (${r.errors} Hilfe${r.errors > 1 ? 'n' : ''}) – weiter ▶` : 'Perfekt – weiter ▶' });
        else MA.feedback(st, t, r, { onNext: step, points: pts, auto: r.ok ? (attempt === 2 ? 2200 : 1100) : 0, showSol: r.ok && attempt === 2 });
      };
      const step = () => {
        if (!alive) return;
        if (w) w.destroy();
        if (i >= N) return finish();
        i++; hud();
        c.el.innerHTML = `<div class="progress"><div style="width:${((i - 1) / N) * 100}%"></div></div><div class="stage"></div>`;
        const st = c.el.querySelector('.stage');
        const t = next();
        let hints = 0, attempt = 1, dis = [];
        const opts = {
          hints: true, onHint: (n) => (hints = n), worldId: c.world.id,
          onAnswer(r) {
            if (r.steps) return finishTask(t, r, 1, 0, st);
            w.lock();
            if (!r.ok && attempt === 1) {
              attempt = 2; streak = 0; MA.Sound.bad(); hud();
              if (t.type === 'choice') dis.push(r.given);
              w.destroy();
              w = MA.renderTask(st, t, Object.assign({}, opts, { showHints: Math.max(1, hints), disable: dis }));
              st.insertAdjacentHTML('afterbegin', `<div class="fb fb-try"><div class="fb-head">🤔 Noch nicht – 2. Versuch!</div>${r.msg ? `<div class="fb-msg">⚠️ ${r.msg}</div>` : ''}<div class="fb-hint-line">Lies den Tipp unten oder tippe auf „📒 Merke“.</div></div>`);
              return;
            }
            w.markChoice(r);
            const tb = st.querySelector('.fb-try'); if (tb) tb.remove();
            finishTask(t, r, attempt, hints, st);
          },
        };
        w = MA.renderTask(st, t, opts);
      };
      const finish = () => {
        if (w) w.destroy();
        const stars = val >= 9 ? 3 : val >= 7 ? 2 : val >= 5 ? 1 : 0;
        const rec = MA.Store.setStars(c.world.id, c.level, stars);
        if (firstTry === N) MA.Store.badge('perfect');
        if (c.level === 3 && stars === 3) MA.Store.badge('eprofi');
        MA.result(c, {
          title: ['WEITER ÜBEN!', 'GUT GEMACHT!', 'STARK!', 'MEGA!'][stars], emoji: ['💪', '🙂', '😎', '🏆'][stars], stars, record: rec && stars > 0,
          lines: [`<b>${right} von ${N}</b> geschafft${right > firstTry ? ` (${right - firstTry} davon mit Hilfe)` : ''}`, `${score} Punkte`, stars < 3 ? `Für ${stars + 1} Sterne brauchst du ${[5, 7, 9][stars]} Punkte (ohne Hilfe = 1, mit Hilfe = ½).` : c.level < 3 ? 'Probier die nächste Stufe!' : 'Jetzt bist du bereit für den Boss! ⚔️'],
          xp: score,
          next: stars >= 2 && c.level < 3 ? { label: `▶ Weiter mit ${MA.LEVELS[c.level + 1].s}`, go: () => c.toMode('training', c.level + 1) } : stars === 3 ? { label: '⚔️ Zum Boss-Kampf', go: () => c.toMode('boss') } : { label: '📖 Lern-Story ansehen', go: () => c.toMode('story') },
        });
      };
      step();
      return { destroy() { alive = false; if (w) w.destroy(); } };
    },
  };

  /* =======================================================
     SCHRITT FÜR SCHRITT – 6 Aufgaben mit Rechenweg
     ======================================================= */
  G.schritt = {
    start(c) {
      const next = MA.taskSource(c.world, c.level, { steps: true });
      const N = 6;
      let i = 0, perfect = 0, errs = 0, w = null, alive = true;
      const hud = () => c.hud(`<span>Aufgabe <b>${Math.min(i, N)}/${N}</b></span><span>✔ fehlerfrei <b>${perfect}</b></span>`);
      const step = () => {
        if (!alive) return;
        if (w) w.destroy();
        if (i >= N) return finish();
        i++; hud();
        c.el.innerHTML = `<div class="progress"><div style="width:${((i - 1) / N) * 100}%"></div></div><div class="stage"></div>`;
        const st = c.el.querySelector('.stage');
        const t = next();
        w = MA.renderTask(st, t, {
          worldId: c.world.id,
          onAnswer(r) {
            errs += r.errors || 0;
            if (r.ok && !r.errors) { perfect++; MA.Sound.ok(); }
            hud();
            MA.feedback(st, t, { ok: true }, { onNext: step, points: Math.max(3, 12 - (r.errors || 0) * 3), nextLabel: r.errors ? 'Geschafft – nächste Aufgabe ▶' : 'Perfekt – nächste Aufgabe ▶' });
          },
        });
      };
      const finish = () => {
        if (w) w.destroy();
        if (perfect === N) MA.Store.badge('steps');
        const stars = perfect >= 6 ? 3 : perfect >= 4 ? 2 : perfect >= 2 ? 1 : 0;
        MA.result(c, { title: perfect === N ? 'SCHRITT-MEISTER!' : 'GESCHAFFT!', emoji: '🪜', stars, lines: [`${perfect} von ${N} Aufgaben ohne Fehler`, `${errs} Hilfen gebraucht`, 'Tipp: Wenn du sicher bist, probier das Training – dort löst du ohne Zwischenschritte.'], xp: 20 + perfect * 8 });
      };
      step();
      return { destroy() { alive = false; if (w) w.destroy(); } };
    },
  };

  /* =======================================================
     BLITZ – 60 Sekunden
     ======================================================= */
  G.blitz = {
    start(c) {
      const src = MA.taskSource(c.world, c.level);
      const next = () => flat(src());
      const TOTAL = 60;
      let left = TOTAL, score = 0, streak = 0, wrong = 0, w = null, alive = true, running = false, iv = null;
      c.el.innerHTML = `<div class="blitz-bar"><div></div></div><div class="stage"></div>`;
      const bar = c.el.querySelector('.blitz-bar div'), st = c.el.querySelector('.stage');
      const hud = () => c.hud(`<span>⏱ <b>${Math.max(0, Math.ceil(left))}</b> s</span><span>Treffer <b>${score}</b></span><span class="streak ${streak >= 3 ? 'hot' : ''}">🔥 ${streak}</span>`);
      const countdown = (n) => {
        st.innerHTML = `<div class="countdown pixel">${n || 'LOS!'}</div>`; MA.Sound.tick();
        if (n > 0) setTimeout(() => alive && countdown(n - 1), 700); else setTimeout(() => { if (!alive) return; running = true; tick(); ask(); }, 500);
      };
      const tick = () => {
        let last = performance.now();
        iv = setInterval(() => {
          const now = performance.now(); if (running) left -= (now - last) / 1000; last = now;
          bar.style.width = Math.max(0, (left / TOTAL) * 100) + '%'; bar.classList.toggle('low', left < 10); hud();
          if (left <= 0) { clearInterval(iv); finish(); }
        }, 100);
      };
      const ask = () => {
        if (!alive || left <= 0) return;
        if (w) w.destroy();
        const t = next();
        w = MA.renderTask(st, t, {
          worldId: c.world.id,
          onAnswer(r) {
            w.lock(); w.markChoice(r);
            if (r.ok) { score++; streak++; MA.Sound.ok(); if (streak % 5 === 0) { left += 5; MA.toast('⏱ +5 Sekunden!', 1300); MA.Sound.boost(); } st.classList.add('flash-ok'); setTimeout(() => st.classList.remove('flash-ok'), 250); setTimeout(ask, 280); }
            else { streak = 0; wrong++; MA.Sound.bad(); MA.feedback(st, t, r, { onNext: ask, auto: 1800 }); }
            hud();
          },
        });
      };
      const finish = () => {
        running = false; alive = false; if (w) w.destroy();
        const rec = MA.Store.setBest(c.world.id, c.level, 'blitz', score);
        if (score >= 15) MA.Store.badge('blitz15');
        MA.result(c, { title: 'ZEIT UM!', emoji: '⚡', record: rec && score > 0, win: rec && score > 0, lines: [`<b>${score}</b> Treffer in 60 Sekunden`, `${wrong} Fehler`, `Dein Rekord: <b>${MA.Store.rec(c.world.id, c.level).blitz}</b>`], xp: score * 6 });
      };
      hud(); countdown(3);
      return { destroy() { alive = false; running = false; clearInterval(iv); if (w) w.destroy(); } };
    },
  };

  /* =======================================================
     BOSS-KAMPF – Treffer bei richtigen Antworten, 3 Herzen
     ======================================================= */
  G.boss = {
    start(c) {
      const src = MA.taskSource(c.world, c.level);
      const next = () => flat(src());
      const boss = c.world.boss;
      const HP = c.world.id === 'final' ? 12 : 8, LIVES = 3;
      let hp = HP, lives = LIVES, w = null, alive = true, combo = 0;
      const t0 = performance.now();
      c.el.innerHTML = `<div class="bossfight"><div class="arena-top"><div class="boss-box"><div class="boss-name pixel">${boss.name.toUpperCase()}</div><div class="boss" aria-hidden="true">${boss.icon}</div><div class="hpbar"><div></div></div></div>
        <div class="player-box"><div class="lives"></div><div class="combo"></div></div></div><div class="stage"></div></div>`;
      const st = c.el.querySelector('.stage'), bossEl = c.el.querySelector('.boss'), hpEl = c.el.querySelector('.hpbar div');
      const draw = () => {
        hpEl.style.width = (hp / HP) * 100 + '%'; hpEl.classList.toggle('low', hp <= HP / 3);
        c.el.querySelector('.lives').innerHTML = '❤️'.repeat(lives) + '🖤'.repeat(LIVES - lives);
        c.el.querySelector('.combo').textContent = combo >= 2 ? `🔥 Combo x${combo}` : '';
        c.hud(`<span>Boss-HP <b>${hp}/${HP}</b></span>`);
      };
      const hit = (dmg) => {
        hp = Math.max(0, hp - dmg);
        bossEl.classList.remove('hit'); void bossEl.offsetWidth; bossEl.classList.add('hit');
        const d = document.createElement('div'); d.className = 'dmg pixel'; d.textContent = '−' + dmg; bossEl.parentElement.appendChild(d); setTimeout(() => d.remove(), 900);
        draw();
      };
      const ask = () => {
        if (!alive) return;
        if (w) w.destroy();
        const t = next();
        w = MA.renderTask(st, t, {
          worldId: c.world.id,
          onAnswer(r) {
            w.lock(); w.markChoice(r);
            if (r.ok) {
              combo++; const dmg = combo >= 3 ? 2 : 1; MA.Sound.ok(); if (dmg === 2) { MA.toast('💥 KRITISCHER TREFFER!', 1200); MA.Sound.boost(); }
              hit(dmg);
              if (hp <= 0) return setTimeout(win, 700);
              MA.feedback(st, t, r, { onNext: ask, auto: 900 });
            } else {
              combo = 0; lives--; MA.Sound.alarm(); draw();
              c.el.querySelector('.bossfight').classList.remove('hurt'); void c.el.offsetWidth; c.el.querySelector('.bossfight').classList.add('hurt');
              bossEl.classList.remove('attack'); void bossEl.offsetWidth; bossEl.classList.add('attack');
              if (lives <= 0) return MA.feedback(st, t, r, { onNext: lose, nextLabel: 'Oh nein … ▶' });
              MA.feedback(st, t, r, { onNext: ask });
            }
          },
        });
      };
      const win = () => {
        alive = false; if (w) w.destroy();
        MA.Store.bossDone(c.world.id);
        const secs = (performance.now() - t0) / 1000;
        MA.result(c, { title: `${boss.name.toUpperCase()} BESIEGT!`, emoji: '👑', win: true, lines: [`Zeit: ${fmtTime(secs)}`, `Übrige Herzen: ${'❤️'.repeat(lives)}`, c.world.id === 'final' ? 'Du hast den Rückspiegel-Turm bezwungen! 🏆' : 'Die nächste Welt wartet!'], xp: 80 + lives * 15 });
      };
      const lose = () => {
        alive = false; if (w) w.destroy();
        MA.result(c, { title: 'NIEDERLAGE …', emoji: boss.icon, lines: [`Der ${boss.name} hat noch ${hp} HP.`, 'Tipp: Übe im Training oder schau in die Lern-Story – dann klappt es!'], xp: (HP - hp) * 5, next: { label: '📖 Lern-Story ansehen', go: () => c.toMode('story') } });
      };
      draw(); ask();
      return { destroy() { alive = false; if (w) w.destroy(); } };
    },
  };
})();
