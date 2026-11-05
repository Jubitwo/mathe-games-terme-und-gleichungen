/* =========================================================
   Mathe Games: Terme & Gleichungen – Speicher, Sound, Effekte, Abzeichen
   Alles bleibt lokal im Browser (localStorage). Kein Server.
   ========================================================= */
(function () {
  const KEY = 'matheGamesTerme.v1';

  /* ---------- Speicher ---------- */
  const def = () => ({ name: '', xp: 0, sound: true, best: {}, badges: [], stories: [], bosses: [], games: 0, level: 0, seenTpl: false });
  let data;
  try { data = Object.assign(def(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { data = def(); }
  const S = (MA.Store = {
    get data() { return data; },
    save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* privater Modus o. Ä. */ } },
    reset() { data = def(); S.save(); },
    rec(topic, level) { const k = topic + '|' + level; return (data.best[k] = data.best[k] || { stars: 0, blitz: 0, memory: 0 }); },
    stars(topic, level) { const r = data.best[topic + '|' + level]; return r ? r.stars : 0; },
    setStars(topic, level, st) { const r = S.rec(topic, level); const nw = st > r.stars; if (nw) r.stars = st; S.save(); return nw; },
    setBest(topic, level, field, v, lowerIsBetter) { const r = S.rec(topic, level); const nw = !r[field] || (lowerIsBetter ? v < r[field] : v > r[field]); if (nw) r[field] = v; S.save(); return nw; },
    addXP(n) {
      const before = S.level();
      data.xp += Math.max(0, Math.round(n));
      if (data.xp >= 1000) S.badge('xp1000');
      S.save();
      const after = S.level();
      if (after > before) setTimeout(() => { MA.toast(`🆙 <b>LEVEL ${after}!</b> Weiter so!`, 3500); MA.Sound.coin(); MA.confetti(1800); }, 900);
    },
    level() { return Math.floor(data.xp / 250) + 1; },
    played() { data.games++; S.badge('first'); S.save(); },
    storyDone(w) { if (!data.stories.includes(w)) data.stories.push(w); S.badge('story'); if (MA.WORLDS && data.stories.length >= MA.WORLDS.length) S.badge('allstories'); S.save(); },
    bossDone(w) { if (!data.bosses.includes(w)) data.bosses.push(w); S.badge('boss'); if (w === 'final') S.badge('final'); if (MA.WORLDS && MA.WORLDS.every((x) => data.bosses.includes(x.id))) S.badge('allboss'); S.save(); },
    badge(id) {
      if (data.badges.includes(id)) return false;
      data.badges.push(id); S.save();
      const b = MA.BADGES.find((x) => x.id === id);
      if (b) MA.toast(`${b.icon} Abzeichen freigeschaltet: <b>${b.name}</b>`);
      return true;
    },
  });

  MA.BADGES = [
    { id: 'first', icon: '🎮', name: 'Los geht\'s', desc: 'Das erste Spiel beendet.' },
    { id: 'story', icon: '📖', name: 'Wissbegierig', desc: 'Eine Lern-Story durchgespielt.' },
    { id: 'allstories', icon: '🎓', name: 'Theorie-Profi', desc: 'Alle 7 Lern-Storys durchgespielt.' },
    { id: 'perfect', icon: '💯', name: 'Fehlerfrei', desc: 'Ein Training ohne Fehler.' },
    { id: 'streak', icon: '🔥', name: 'Heiße Serie', desc: '8 richtige Antworten hintereinander.' },
    { id: 'zweiter', icon: '🧗', name: 'Nicht aufgeben!', desc: 'Im zweiten Versuch richtig gelöst.' },
    { id: 'steps', icon: '🪜', name: 'Schritt-Meister', desc: 'Schritt für Schritt: alle 6 Aufgaben ohne Fehler.' },
    { id: 'blitz15', icon: '⚡', name: 'Blitzmerker', desc: 'Mindestens 15 Treffer in einer Blitz-Runde.' },
    { id: 'boss', icon: '⚔️', name: 'Boss-Bezwinger', desc: 'Den ersten Boss besiegt.' },
    { id: 'allboss', icon: '👑', name: 'Herrscher der Welten', desc: 'Alle 7 Bosse besiegt.' },
    { id: 'final', icon: '🤖', name: 'Rückspiegel-Champion', desc: 'Den Mega-Robo im Rückspiegel-Turm besiegt.' },
    { id: 'eprofi', icon: '🏅', name: 'E-Profi', desc: '3 Sterne im Training auf ★★★-Niveau.' },
    { id: 'xp1000', icon: '🚀', name: '1000 XP', desc: '1000 Erfahrungspunkte gesammelt.' },
  ];

  /* ---------- Sound (Web Audio, kein Download nötig) ---------- */
  let ctx = null;
  const tone = (freq, dur = 0.1, type = 'square', vol = 0.06, delay = 0) => {
    if (!data.sound) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      const t0 = ctx.currentTime + delay;
      g.gain.setValueAtTime(vol, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(t0); o.stop(t0 + dur + 0.02);
    } catch (e) { /* kein Audio */ }
  };
  MA.Sound = {
    click: () => tone(660, 0.03, 'square', 0.025),
    ok: () => { tone(660, 0.08); tone(990, 0.12, 'square', 0.06, 0.08); },
    bad: () => { tone(220, 0.15, 'sawtooth', 0.05); tone(160, 0.2, 'sawtooth', 0.05, 0.12); },
    coin: () => { tone(988, 0.07); tone(1319, 0.25, 'square', 0.06, 0.07); },
    win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.14, 'square', 0.06, i * 0.12)),
    tick: () => tone(1200, 0.02, 'square', 0.02),
    boost: () => [400, 500, 650, 850].forEach((f, i) => tone(f, 0.06, 'square', 0.05, i * 0.04)),
    alarm: () => [880, 660, 880, 660].forEach((f, i) => tone(f, 0.12, 'sawtooth', 0.05, i * 0.13)),
  };

  /* ---------- Toasts ---------- */
  MA.toast = (html, ms = 3200) => {
    let box = document.getElementById('toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = html;
    box.appendChild(el);
    setTimeout(() => el.classList.add('out'), ms);
    setTimeout(() => el.remove(), ms + 500);
  };

  /* ---------- Konfetti ---------- */
  MA.confetti = (ms = 2500) => {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.createElement('canvas');
    c.className = 'confetti';
    document.body.appendChild(c);
    const g = c.getContext('2d');
    const W = (c.width = innerWidth), H = (c.height = innerHeight);
    const cols = ['#00f0ff', '#ff2bd6', '#ffe600', '#39ff88', '#ff9f1c', '#9d4dff'];
    const P = Array.from({ length: 160 }, () => ({ x: Math.random() * W, y: -20 - Math.random() * H * 0.5, vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 4, s: 6 + Math.random() * 6, c: cols[(Math.random() * cols.length) | 0], r: Math.random() * 6 }));
    const t0 = performance.now();
    (function fr(t) {
      g.clearRect(0, 0, W, H);
      P.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.r += 0.1; g.fillStyle = p.c; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); g.restore(); });
      if (t - t0 < ms) requestAnimationFrame(fr); else c.remove();
    })(t0);
  };

  /* ---------- kleine DOM-Helfer ---------- */
  MA.h = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };
  MA.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  MA.starStr = (n, max = 3) => '★'.repeat(n) + '☆'.repeat(max - n);
  MA.LEVELS = [{ s: '🤖', n: 'Auto', name: 'passt sich an', word: 'Auto' }, { s: '★', n: 'G', name: 'Grundlegend', word: 'leicht' }, { s: '★★', n: 'M', name: 'Mittel', word: 'mittel' }, { s: '★★★', n: 'E', name: 'Erweitert', word: 'schwer' }];
  MA.PRAISE = ['Stark!', 'Richtig!', 'Super!', 'Volltreffer!', 'Klasse!', 'Genau!', 'Mathe-Profi!', 'Weiter so!', 'Perfekt!'];

  /* Nächste empfohlene Mission (Lern-Story → Training → Boss, Welt für Welt) */
  MA.missionFor = (w) => {
    const S = MA.Store;
    if (w.story && !S.data.stories.includes(w.id)) return { w, mode: 'story', label: 'Lern-Story' };
    if (Math.max(S.stars(w.id, 1), S.stars(w.id, 2), S.stars(w.id, 3)) < 2) return { w, mode: 'training', label: 'Training' };
    if (!S.data.bosses.includes(w.id)) return { w, mode: 'boss', label: 'Boss-Kampf' };
    return null;
  };
  MA.nextMission = () => {
    for (const w of MA.WORLDS) { const m = MA.missionFor(w); if (m) return m; }
    return MA.missionFor(MA.FINAL) || { w: MA.FINAL, mode: 'blitz', label: 'Blitz-Runde' };
  };

  /* Aufgabe holen und Wiederholungen vermeiden */
  MA.taskSource = (topic, level, opts) => {
    const recent = [];
    return () => {
      let t;
      for (let i = 0; i < 25; i++) {
        t = topic.gen(level, opts && opts.steps);
        t.worldId = t.worldId || topic.id;
        const key = t.q + (t.vis || '') + JSON.stringify(t.answer);
        if (!recent.includes(key)) { recent.push(key); if (recent.length > 8) recent.shift(); break; }
      }
      return t;
    };
  };

})();
