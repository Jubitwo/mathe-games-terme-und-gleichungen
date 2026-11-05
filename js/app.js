/* =========================================================
   Mathe Games: Terme & Gleichungen – Bildschirme
   #/            Start
   #/karte       Weltkarte (7 Welten + Rückspiegel-Turm)
   #/w/<id>      Welt: Lern-Story, Niveau, Spielmodi
   #/spiel       laufendes Spiel
   #/spick       Spickzettel (alle Merksätze)
   #/erfolge     XP & Abzeichen
   #/info        Infos für Lehrkräfte
   ========================================================= */
(function () {
  const S = MA.Store;
  const app = document.getElementById('app');
  const ALL = () => MA.WORLDS.concat([MA.FINAL]);
  const byId = (id) => ALL().find((w) => w.id === id);
  let current = null, pending = null;

  const syncTop = () => {
    const sb = document.getElementById('btn-sound'); if (sb) sb.textContent = S.data.sound ? '🔊' : '🔇';
    const xp = document.querySelector('.top-xp'); if (xp) xp.textContent = `LV ${S.level()}`;
  };
  document.getElementById('btn-sound').addEventListener('click', () => { S.data.sound = !S.data.sound; S.save(); syncTop(); MA.Sound.click(); });

  const stop = () => { if (current) { current.destroy(); current = null; } MA.keyTarget = null; };
  function route() {
    const [a, b] = location.hash.replace(/^#\/?/, '').split('/');
    if (a !== 'spiel') stop();
    document.body.dataset.screen = a || 'start';
    window.scrollTo(0, 0);
    if (!a) return start();
    if (a === 'karte') return map();
    if (a === 'w' && byId(b)) return world(byId(b));
    if (a === 'spiel' && pending) return game();
    if (a === 'spick') return spick();
    if (a === 'erfolge') return trophies();
    if (a === 'info') return info();
    location.hash = '#/karte';
  }
  window.addEventListener('hashchange', route);

  /* ---------- Start ---------- */
  function start() {
    const sym = ['x²', '(a+b)²', '=', '÷', '½', '2ab', '−', 'x', '·', '( )', 'a²−b²', '?'];
    app.innerHTML = `<section class="screen start">
      <div class="float-syms">${Array.from({ length: 18 }, (_, i) => `<span style="left:${(i * 41) % 100}%;animation-delay:${-(i * 1.9) % 14}s;animation-duration:${11 + (i % 5) * 2}s">${sym[i % sym.length]}</span>`).join('')}</div>
      <div class="logo"><div class="pixel l1">MATHE</div><div class="pixel l2">GAMES</div></div>
      <div class="subtitle pixel">TERME &amp; GLEICHUNGEN</div>
      <div class="owl-intro"><span class="owl big">🦉</span><div class="bubble">Hi! Ich bin <b>Professor Eule</b>. Gemeinsam erobern wir 7 Welten – von Klammern bis Formeln. Bereit?</div></div>
      <button type="button" class="btn btn-start pixel">▶ START</button>
      <div class="start-score pixel">XP ${String(S.data.xp).padStart(5, '0')} · LV ${S.level()}</div>
    </section>`;
    const go = () => { MA.Sound.coin(); location.hash = '#/karte'; };
    app.querySelector('.btn-start').addEventListener('click', go);
    MA.keyTarget = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
    syncTop();
  }

  /* ---------- Weltkarte ---------- */
  const starsOf = (id) => [1, 2, 3].map((l) => S.stars(id, l));
  function map() {
    MA.keyTarget = null;
    const ws = ALL();
    app.innerHTML = `<section class="screen map">
      <h1 class="pixel h-title">WELTKARTE</h1>
      <p class="h-sub">Tippe auf eine Welt. Empfehlung: von oben nach unten – Lern-Story ➜ Training ➜ Boss.</p>
      <div class="path">${ws.map((w, i) => {
        const st = starsOf(w.id), sum = st.reduce((a, b) => a + b, 0), boss = S.data.bosses.includes(w.id), story = S.data.stories.includes(w.id);
        return `<a class="node ${i % 2 ? 'r' : 'l'} ${w.id === 'final' ? 'final' : ''}" href="#/w/${w.id}" style="--c:${w.color}">
          <div class="node-ic">${w.icon}${boss ? '<span class="crown">👑</span>' : ''}</div>
          <div class="node-tx"><div class="node-nr pixel">${w.id === 'final' ? 'FINALE' : 'WELT ' + w.nr}</div><div class="node-t">${w.title}</div><div class="node-s">${w.topic}</div>
          <div class="node-m">${w.story ? `<span class="${story ? 'ok' : ''}">📖</span>` : ''}<span class="nst">${'★'.repeat(sum)}${'☆'.repeat(9 - sum)}</span></div></div></a>`;
      }).join('<div class="link"></div>')}</div>
      <div class="map-links"><a class="btn btn-ghost" href="#/spick">📒 Spickzettel</a><a class="btn btn-ghost" href="#/erfolge">🏆 Erfolge</a><a class="btn btn-ghost" href="#/info">👩‍🏫 Lehrkräfte</a></div>
    </section>`;
    syncTop();
  }

  /* ---------- Welt ---------- */
  function world(w) {
    MA.keyTarget = null;
    let level = S.data.level || 1;
    const isFinal = w.id === 'final';
    const modes = isFinal ? ['training', 'blitz', 'boss'] : ['story', 'training'].concat(w.hasSteps ? ['schritt'] : []).concat(['blitz', 'boss']);
    app.innerHTML = `<section class="screen world" style="--c:${w.color}">
      <div class="crumbs"><a href="#/karte" class="btn btn-ghost">◀ Karte</a></div>
      <div class="w-head"><div class="w-ic">${w.icon}</div><div><div class="pixel w-nr">${isFinal ? 'FINALE' : 'WELT ' + w.nr}</div><h1 class="w-title">${w.title}</h1><div class="w-topic">${w.topic}</div></div></div>
      ${isFinal ? '<div class="panel finfo">🤖 Im Rückspiegel-Turm kommen Aufgaben aus <b>allen 7 Welten</b> – wie ein Test zum Kapitelende. Schaffst du den Mega-Robo?</div>' : `<details class="panel merke-panel" ${S.data.stories.includes(w.id) ? '' : 'open'}><summary><span class="pixel">📒 MERKE</span><span class="sum-hint">antippen</span></summary>${MA.merkeHTML(w)}</details>`}
      <div class="panel"><div class="pixel ph">1 · NIVEAU WÄHLEN</div>
        <div class="levels">${[1, 2, 3].map((l) => `<button type="button" class="lvl" data-l="${l}"><span class="lvl-stars">${MA.LEVELS[l].s}</span><span class="lvl-n">${MA.LEVELS[l].n}</span><span class="lvl-got">${MA.starStr(S.stars(w.id, l))}</span></button>`).join('')}</div></div>
      <div class="panel"><div class="pixel ph">2 · SPIEL WÄHLEN</div><div class="modes">${modes.map((m) => {
        const M = MA.MODES[m], done = m === 'story' && S.data.stories.includes(w.id), bossDone = m === 'boss' && S.data.bosses.includes(w.id);
        return `<button type="button" class="mcard ${m}" data-m="${m}"><span class="m-ic">${m === 'boss' ? w.boss.icon : M.icon}</span><span class="m-tx"><b>${m === 'boss' ? `Boss: ${w.boss.name}` : M.name}${done || bossDone ? ' ✔' : ''}</b><small>${m === 'story' && !done ? 'Starte hier, wenn das Thema neu ist!' : M.desc}</small></span></button>`;
      }).join('')}</div></div>
    </section>`;
    const paint = () => app.querySelectorAll('.lvl').forEach((b) => b.classList.toggle('on', +b.dataset.l === level));
    app.querySelectorAll('.lvl').forEach((b) => b.addEventListener('click', () => { level = +b.dataset.l; S.data.level = level; S.save(); paint(); MA.Sound.click(); }));
    app.querySelectorAll('.mcard').forEach((b) => b.addEventListener('click', () => startGame(w, b.dataset.m, level)));
    paint();
  }
  function startGame(w, mode, level) {
    pending = { w, mode, level };
    MA.Sound.coin();
    if (location.hash === '#/spiel') game(); else location.hash = '#/spiel';
  }

  /* ---------- Spiel ---------- */
  function game() {
    stop();
    const p = pending, M = MA.MODES[p.mode];
    app.innerHTML = `<section class="screen game" data-mode="${p.mode}" style="--c:${p.w.color}">
      <div class="game-top"><button type="button" class="btn btn-ghost g-quit" aria-label="Beenden">✕</button>
        <div class="g-title"><span>${p.w.icon}</span><span class="g-name">${p.mode === 'boss' ? p.w.boss.name : M.name}</span>${p.mode !== 'story' ? `<span class="g-lvl">${MA.LEVELS[p.level].s}</span>` : ''}</div>
        ${p.w.id !== 'final' && p.mode !== 'story' ? '<button type="button" class="btn btn-ghost g-merke" aria-label="Merke">📒</button>' : ''}
      </div><div class="hud"></div><div class="game-body"></div></section>`;
    const hud = app.querySelector('.hud');
    const ctx = {
      world: p.w, level: p.level, el: app.querySelector('.game-body'),
      hud: (h) => (hud.innerHTML = h),
      retry: () => game(),
      back: () => (location.hash = '#/w/' + p.w.id),
      toMode: (m, l) => { if (m === 'story' && !p.w.story) return ctx.back(); startGame(p.w, m, l || p.level); },
    };
    app.querySelector('.g-quit').addEventListener('click', () => { if (app.querySelector('.result') || p.mode === 'story' || confirm('Spiel wirklich beenden?')) ctx.back(); });
    const gm = app.querySelector('.g-merke'); if (gm) gm.addEventListener('click', () => MA.showMerke(p.w.id));
    current = MA.Games[p.mode].start(ctx);
  }

  /* ---------- Spickzettel ---------- */
  function spick() {
    MA.keyTarget = null;
    app.innerHTML = `<section class="screen spick"><div class="crumbs"><a href="#/karte" class="btn btn-ghost">◀ Karte</a></div>
      <h1 class="pixel h-title">SPICKZETTEL</h1><p class="h-sub">Alle Regeln auf einen Blick – perfekt zum Wiederholen vor der Arbeit.</p>
      ${MA.WORLDS.map((w) => `<div class="panel spick-w" style="--c:${w.color}"><div class="spick-h">${w.icon} <b>${w.nr}. ${w.topic}</b></div>${MA.merkeHTML(w)}</div>`).join('')}
      <button type="button" class="btn btn-ghost" onclick="window.print()">🖨️ Drucken</button></section>`;
  }

  /* ---------- Erfolge ---------- */
  function trophies() {
    MA.keyTarget = null;
    const d = S.data, lvl = S.level(), into = d.xp % 250;
    app.innerHTML = `<section class="screen trophies"><div class="crumbs"><a href="#/karte" class="btn btn-ghost">◀ Karte</a></div>
      <h1 class="pixel h-title">ERFOLGE</h1>
      <div class="panel"><div class="pixel lvbig">LEVEL ${lvl}</div><div class="xpbar"><div style="width:${(into / 250) * 100}%"></div></div><div>${d.xp} XP · noch ${250 - into} XP bis Level ${lvl + 1}</div>
      <div class="stats">📖 ${d.stories.length}/7 Storys · 👑 ${d.bosses.length}/8 Bosse · 🎮 ${d.games} Spiele</div></div>
      <div class="badge-grid">${MA.BADGES.map((b) => `<div class="badge ${d.badges.includes(b.id) ? 'got' : ''}"><div class="b-icon">${b.icon}</div><div class="b-name">${b.name}</div><div class="b-desc">${b.desc}</div></div>`).join('')}</div></section>`;
  }

  /* ---------- Lehrkräfte ---------- */
  function info() {
    MA.keyTarget = null;
    app.innerHTML = `<section class="screen info"><div class="crumbs"><a href="#/karte" class="btn btn-ghost">◀ Karte</a></div>
      <h1 class="pixel h-title">FÜR LEHRKRÄFTE</h1>
      <div class="panel"><div class="pixel ph">WORUM GEHT ES?</div><p>Selbstlern-Spiel zum Kapitel <b>„Terme und Gleichungen“ (Klasse 8)</b>. Die Welten folgen den Abschnitten des Kapitels:</p>
        <ol>${MA.WORLDS.map((w) => `<li>${w.icon} ${w.topic}</li>`).join('')}</ol><p>Dazu der <b>Rückspiegel-Turm</b> mit gemischten Aufgaben aller Abschnitte.</p></div>
      <div class="panel"><div class="pixel ph">SO ARBEITEN DIE LERNENDEN</div><ul>
        <li><b>📖 Lern-Story:</b> Professor Eule erklärt das Thema Schritt für Schritt, mit Mini-Check nach jeder Seite.</li>
        <li><b>🎯 Training:</b> 10 Aufgaben, gestufte Tipps, „📒 Merke“, 2. Versuch und ausführlicher Lösungsweg. Sterne: 9 / 7 / 5 Punkte.</li>
        <li><b>🪜 Schritt für Schritt</b> (Gleichungen, Bruchgleichungen, Formeln): Jeder Umformungsschritt wird einzeln gewählt und in den Rechenweg geschrieben.</li>
        <li><b>⚡ Blitz</b> und <b>⚔️ Boss-Kampf</b> für Festigung und Motivation.</li>
        <li><b>Niveaus:</b> ★ G · ★★ M · ★★★ E – z. B. (x + 4)² auf G, (4 − 2x)² auf M, (2a + 3b)² auf E.</li>
        <li>Terme werden über <b>Lückenkästchen</b> eingegeben (z. B. □x² □x □). Typische Fehler wie fehlendes 2ab werden erkannt und erklärt.</li></ul></div>
      <div class="panel"><div class="pixel ph">DATENSCHUTZ</div><p>Kein Login, kein Server, keine Cookies, keine externen Dienste. Der Fortschritt bleibt nur auf dem eigenen Handy.</p>
        <button type="button" class="btn btn-alt btn-reset">🗑 Fortschritt auf diesem Gerät löschen</button></div></section>`;
    app.querySelector('.btn-reset').addEventListener('click', () => { if (confirm('Wirklich alle Sterne, XP und Abzeichen löschen?')) { S.reset(); syncTop(); MA.toast('Fortschritt gelöscht.'); } });
  }

  syncTop();
  route();
})();
