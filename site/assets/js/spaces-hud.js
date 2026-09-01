/* ILLUSORR Spaces — HUD. Drives the field: every control changes the scene. */
(() => {
'use strict';

const field = window.spacesField;
if (!field) return;

const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

const panels = $$('.panel');
const fabs   = $$('.fab');
const gate   = $('#gate');
const menu   = $('#menu');

/* ── panels ───────────────────────────────────────────── */
function setPanelOpen(on) { document.body.classList.toggle('panel-open', on); }

function closeAll() {
  panels.forEach((p) => p.classList.remove('open'));
  setPanelOpen(false);
  menu.classList.remove('open');
  const t = document.getElementById('talk');
  if (t && t.classList.contains('open')) {
    t.classList.remove('open');
    document.body.classList.remove('is-talking');
    field.setChatter(true);
  }
  fabs.forEach((f) => { if (f.dataset.p !== 'voice') f.classList.remove('on'); });
}
function open(name) {
  const p = $('.panel[data-panel="' + name + '"]');
  const already = p && p.classList.contains('open');
  closeAll();
  if (p && !already) {
    p.classList.add('open');
    setPanelOpen(true);
    $$('.fab[data-p="' + name + '"]').forEach((f) => {
      if (f.dataset.p !== 'voice') f.classList.add('on');
    });
  }
}

/* the account button opens the side menu; its rows deep-link into panels */
$('#account').addEventListener('click', (e) => {
  e.stopPropagation();
  const wasOpen = menu.classList.contains('open');
  closeAll();
  if (!wasOpen) { menu.classList.add('open'); setPanelOpen(true); }
});
$('#menuX').addEventListener('click', (e) => { e.stopPropagation(); closeAll(); });
$$('.row[data-p]').forEach((r) => {
  r.addEventListener('click', (e) => { e.stopPropagation(); open(r.dataset.p); });
});
fabs.forEach((f) => f.addEventListener('click', (e) => { e.stopPropagation(); open(f.dataset.p); }));
$$('[data-close]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); closeAll(); }));
window.spacesUI = { closeAll };

/* ── destinations ─────────────────────────────────────── */
const wgrid = $('#wgrid');
field.WORLDS.forEach((w, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'w' + (i === 0 ? ' on' : '');
  b.style.backgroundImage = 'url(' + w.img + ')';
  b.innerHTML = '<b>' + w.n + '</b><em>' + w.o + '</em>';
  b.addEventListener('click', () => { field.setWorld(i, true); closeAll(); });
  wgrid.appendChild(b);
});
window.spacesUI.onWorld = (i, w) => {
  $('#r-dest').textContent = w.n;
  $('#r-owner').textContent = 'ILLUSORR';
  $$('.w', wgrid).forEach((c, n) => c.classList.toggle('on', n === i));
  const mw = $('#menuWorld');
  if (mw) mw.textContent = w.n;
};
window.spacesUI.onWorld(0, field.WORLDS[0]);

/* ── surface play styles ──────────────────────────────── */
const surfOpts = $('#surfOpts');
field.SURFACES.forEach((p, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'opt' + (i === 0 ? ' on' : '');
  b.innerHTML = '<div class="nm"><span class="dot"></span>' + p.nm + '</div><div class="ds">' + p.ds + '</div>';
  b.addEventListener('click', () => field.setSurface(i));
  surfOpts.appendChild(b);
});
window.spacesUI.onSurface = (i, p) => {
  $$('.opt', surfOpts).forEach((o, n) => o.classList.toggle('on', n === i));
  const m = $('#menuSurf');
  if (m) m.textContent = p.nm;
};
window.spacesUI.onSurface(field.surfaceIndex(), field.SURFACES[field.surfaceIndex()]);

/* ── inventory: placing actually adds geometry ────────── */
$$('#invOpts .opt').forEach((b) => {
  b.addEventListener('click', () => {
    const piece = b.dataset.piece;
    const on = !field.isPlaced(piece);
    field.place(piece, on);
    b.classList.toggle('on', on);
    if (piece === 'screen' && !on) {
      field.setShare('off');
      $$('#shareOpts .opt').forEach((o) => o.classList.toggle('on', o.dataset.share === 'off'));
    }
  });
});

/* ── screen share ───────────────────────────────────────
   These call the real capture APIs, so the browser shows its own picker and
   permission prompt. The option only latches once the stream is live. */
function markShare(mode) {
  $$('#shareOpts .opt').forEach((o) => o.classList.toggle('on', o.dataset.share === mode));
  const screenOpt = $('#invOpts .opt[data-piece="screen"]');
  if (screenOpt) screenOpt.classList.toggle('on', field.isPlaced('screen'));
  $$('.fab[data-p="share"]').forEach((f) => f.classList.toggle('is-live', mode !== 'off'));
  const note = $('#shareNote');
  if (note) {
    note.textContent = mode === 'off'
      ? 'Casting places the surface in the world if it is not already there.'
      : (mode === 'cam' ? 'Your camera is live on the surface. Stop it here or in the browser bar.'
                        : 'Your display is live on the surface. Stop it here or in the browser bar.');
  }
}
window.spacesUI.onShareEnded = () => markShare('off');

$$('#shareOpts .opt').forEach((b) => {
  b.addEventListener('click', async () => {
    const mode = b.dataset.share;
    const note = $('#shareNote');
    if (mode !== 'off' && note) note.textContent = 'Waiting for you to choose what to share…';
    try {
      await field.setShare(mode);
      markShare(mode);
      if (mode !== 'off') closeAll();
    } catch (err) {
      markShare('off');
      if (note) {
        note.textContent = /not allowed|permission|denied/i.test(String(err && err.name || err))
          ? 'Permission denied — the browser blocked the capture.'
          : 'Nothing was shared.';
      }
    }
  });
});

/* ── voice ────────────────────────────────────────────── */
const meterBars = $$('#meter i');
let micOn = true;
function setMic(on) {
  micOn = on;
  field.setMic(on);
  $$('.fab[data-p="voice"]').forEach((f) => {
    f.classList.toggle('muted', !on);
    f.classList.toggle('on', on);
  });
  const mRow = $('#menuMic');
  if (mRow) mRow.textContent = on ? 'On' : 'Muted';
  $$('#voiceOpts .opt').forEach((o) => o.classList.toggle('on', (o.dataset.mic === 'on') === on));
}
$$('#voiceOpts .opt').forEach((b) => b.addEventListener('click', () => setMic(b.dataset.mic === 'on')));
setMic(true);
setInterval(() => {
  meterBars.forEach((b) => { b.style.height = (micOn ? 14 + Math.random() * 86 : 5) + '%'; });
}, 130);

/* ── chat: speak into the world ───────────────────────── */
$$('.msg[data-from]').forEach((m) => {
  m.addEventListener('click', () => openTalk(m.dataset.from));
});

/* Embedded in another page: strip the interface and let the scene run. */
const EMBED = /(?:\?|&)embed=1/.test(location.search);
if (EMBED) document.body.classList.add('embed');

/* ── responsive chrome ──────────────────────────────────
   On phones the rail becomes the only dock, so the bottom-right pair is
   moved into it rather than floating as a second cluster. Reparenting keeps
   one scroll region and one tab order; the buttons keep their listeners. */
(function dock() {
  const rail = $('.rail');
  const pair = $('.pair');
  if (!rail || !pair) return;
  const kids = $$('.fab', pair);
  const home = document.createComment('pair');
  pair.parentNode.insertBefore(home, pair);
  const mq = matchMedia('(max-width:720px)');

  function place() {
    if (mq.matches) {
      kids.forEach((k, i) => { k.classList.toggle('is-paired', i === 0); rail.appendChild(k); });
    } else {
      kids.forEach((k) => { k.classList.remove('is-paired'); pair.appendChild(k); });
    }
  }
  place();
  mq.addEventListener ? mq.addEventListener('change', place) : mq.addListener(place);
})();

/* ── VR setup ───────────────────────────────────────────
   A real WebXR capability check rather than a mock: the panel reports what
   this browser and headset can actually do, and the button only lights when
   an immersive session is genuinely available. */
const vrDot = $('#vrDot'), vrHead = $('#vrHead'), vrSub = $('#vrSub');
const vrGo = $('#vrGo'), vrNote = $('#vrNote'), vrDevice = $('#vrDevice');
let vrSupported = false;

function vrState(kind, head, sub, device) {
  vrDot.className = 'vr-dot' + (kind ? ' is-' + kind : '');
  vrHead.textContent = head;
  vrSub.textContent = sub;
  if (device) vrDevice.textContent = device;
  vrGo.disabled = kind !== 'ready';
}

function guessDevice() {
  const ua = navigator.userAgent;
  if (/OculusBrowser|Quest/i.test(ua)) return 'Meta Quest';
  if (/Vive|HTC/i.test(ua)) return 'HTC Vive';
  if (/Pico/i.test(ua)) return 'Pico';
  if (/Vision ?Pro|visionOS/i.test(ua)) return 'Apple Vision Pro';
  if (/Windows/i.test(ua)) return 'PC headset via SteamVR';
  return 'Connected headset';
}

(async function checkVR() {
  if (!navigator.xr) {
    vrState('none', 'No headset detected',
      'This browser has no WebXR. Open the space in a headset browser, or on desktop Chrome with a headset connected.', 'None');
    return;
  }
  try {
    const ok = await navigator.xr.isSessionSupported('immersive-vr');
    if (ok) {
      vrSupported = true;
      vrState('ready', 'Headset ready', 'An immersive session is available. Put the headset on before you enter.', guessDevice());
    } else {
      const ar = await navigator.xr.isSessionSupported('immersive-ar').catch(() => false);
      vrState('none', ar ? 'AR only on this device' : 'No headset detected',
        ar ? 'This device offers passthrough AR but not an immersive VR session.'
           : 'WebXR is present but no headset is connected right now.', ar ? 'AR device' : 'None');
    }
  } catch (e) {
    const blocked = /security/i.test(String(e && e.name || e));
    vrState('none', blocked ? 'VR blocked in this frame' : 'Could not reach WebXR',
      blocked ? 'Open the space in its own tab to use a headset — embedded frames are denied XR access.'
              : 'The browser refused the capability check.', blocked ? 'Blocked' : 'Unknown');
  }
})();

$$('#vrComfort .opt').forEach((b) => {
  b.addEventListener('click', () => {
    $$('#vrComfort .opt').forEach((o) => o.classList.remove('on'));
    b.classList.add('on');
    localStorage.setItem('spaces.comfort', b.dataset.comfort);
  });
});
const savedComfort = localStorage.getItem('spaces.comfort');
if (savedComfort) {
  $$('#vrComfort .opt').forEach((o) => o.classList.toggle('on', o.dataset.comfort === savedComfort));
}

vrGo.addEventListener('click', async (e) => {
  e.stopPropagation();
  if (!vrSupported || !field.enterVR) return;
  vrGo.disabled = true;
  vrNote.textContent = 'Starting the session…';
  try {
    await field.enterVR();
    vrNote.textContent = 'You are in. Take the headset off to return to the desktop view.';
    closeAll();
  } catch (err) {
    vrGo.disabled = false;
    vrNote.textContent = 'The session did not start — the headset may be in use by another app.';
  }
});

/* ── ambience ─────────────────────────────────────────────
   Decoded and played through Web Audio rather than the <audio> element:
   the Opus stream is valid but progressive playback stalls on it, and a
   decoded buffer also gives us a clean gain ramp and gapless looping.
   Autoplay rules still apply, so it starts on the gate click. */
const soundBtn = $('#sound');
const soundLabel = $('#soundLabel');
const TARGET = 0.42;

let actx = null, gain = null, node = null, buffer = null, loading = null;
/* One-time reset: the ambience preference persisted across visits, so a
   single tap of "off" months ago left the space silent forever after. The
   experience is meant to open with sound. Anyone who turns it off from
   here on still has that respected — this only clears the legacy value. */
if (!localStorage.getItem('spaces.ambience.v2')) {
  localStorage.removeItem('spaces.ambience');
  localStorage.setItem('spaces.ambience.v2', '1');
}
let wanted = localStorage.getItem('spaces.ambience') !== 'off';

function load() {
  if (loading) return loading;
  loading = fetch('../assets/audio/at-first.ogg')
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('audio ' + r.status))))
    .then((b) => actx.decodeAudioData(b))
    .then((buf) => { buffer = buf; return buf; })
    .catch(() => { loading = null; return null; });
  return loading;
}

function ramp(to, ms) {
  if (!gain) return;
  const now = actx.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(to, now + ms / 1000);
}

function paint(on, busy) {
  soundBtn.classList.toggle('is-on', on && !busy);
  soundBtn.setAttribute('aria-pressed', String(on));
  soundLabel.textContent = busy ? 'Loading…' : (on ? 'Ambience on' : 'Ambience off');
}

async function setSound(on) {
  wanted = on;
  localStorage.setItem('spaces.ambience', on ? 'on' : 'off');

  if (!on) {
    paint(false);
    ramp(0, 600);
    if (node) { const n = node; node = null; setTimeout(() => { try { n.stop(); } catch (e) {} }, 650); }
    return;
  }

  if (!actx) {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    gain = actx.createGain();
    gain.gain.value = 0;
    gain.connect(actx.destination);
  }
  if (actx.state === 'suspended') await actx.resume();

  paint(true, !buffer);
  if (!buffer) await load();
  if (!buffer || !wanted) { paint(wanted, false); return; }

  if (!node) {
    node = actx.createBufferSource();
    node.buffer = buffer;
    node.loop = true;
    node.connect(gain);
    node.start(0);
  }
  paint(true, false);
  ramp(TARGET, 900);
}

soundBtn.addEventListener('click', (e) => { e.stopPropagation(); setSound(!wanted); });

/* Decoding needs no gesture, only playback does — so fetch and decode now
   and the ambience is already in hand when the gate is dismissed. */
(function warm() {
  if (!wanted) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  actx = new Ctx();
  gain = actx.createGain();
  gain.gain.value = 0;
  gain.connect(actx.destination);
  load();
})();
paint(false);
soundLabel.textContent = wanted ? 'Ambience' : 'Ambience off';

/* ── the guests, as conversants ────────────────────────────
   Each sphere is backed by Claude with its own persona, and answers out
   loud through speech synthesis with a voice tuned per character. */
const talk = $('#talk');
const talkLog = $('#talkLog');
const talkForm = $('#talkForm');
const talkIn = $('#talkIn');
const talkSend = $('#talkSend');
const talkVoice = $('#talkVoice');

/* Voice selection is the difference between a person and a robot here.
   A bare /female/ match lands on the compact eSpeak-class voices on most
   systems, which is what made these sound synthetic. Instead we score every
   installed voice: the neural/premium engines (Google, Siri, Microsoft
   *Online Natural*, Apple's Enhanced set) win, the legacy compact ones are
   pushed to the bottom, and pitch stays near 1 — pitch-shifting a synth
   voice is what produces the chipmunk effect. */
const NATURAL = [
  [/natural|neural|premium|enhanced/i, 100],
  [/^google /i,                         70],
  [/siri/i,                             65],
  [/samantha|serena|allison|ava|joanna|zoe|isha|nicky/i, 55],
  [/daniel|arthur|oliver|matthew|tom|aaron/i,            55],
  [/karen|moira|fiona|tessa|kate|stephanie/i,            40],
  [/alex|victoria|jenny|aria|emma|libby|sonia/i,         38],
  [/compact|espeak|festival|pico|robot|whisper|novelty/i, -120],
  [/albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|hysterical|jester|organ|superstar|trinoids|wobble|zarvox/i, -200],
];

/* Gender is a hard constraint, not a preference: the scorer alone could hand
   Kerem a female voice whenever a premium one outranked every male option.
   Named voices are matched first (the reliable signal), then the generic
   male/female tokens some engines expose. */
const MALE_NAMES = /\b(alex|aaron|arthur|daniel|david|fred|george|guy|james|junior|matthew|nathan|oliver|ralph|rishi|ryan|thomas|tom|christopher|eric|liam|brian|mark|reed|rocko)\b/i;
const FEMALE_NAMES = /\b(allison|ava|aria|amber|ashley|catherine|clara|emma|fiona|jenny|joanna|kate|karen|libby|linda|michelle|moira|monica|nicky|nora|paulina|samantha|sara|serena|sonia|susan|tessa|victoria|zoe|zira|isha|jessa|natasha|hazel|maisie)\b/i;
function genderOf(v) {
  const n = v.name;
  if (MALE_NAMES.test(n) || /\bmale\b/i.test(n)) return 'm';
  if (FEMALE_NAMES.test(n) || /female/i.test(n)) return 'f';
  return null;
}

const VOICE = {
  Begum:  { sex: 'f', pitch: 1.0,  rate: 0.96, want: [/serena|samantha|sonia|libby|kate/i], lang: /^en-GB/i },
  Zeynep: { sex: 'f', pitch: 1.04, rate: 1.0,  want: [/ava|joanna|allison|aria|jenny|nicky/i], lang: /^en-US/i },
  Kerem:  { sex: 'm', pitch: 0.94, rate: 0.97, want: [/arthur|oliver|daniel|matthew|tom|alex|guy/i], lang: /^en/i },
};

let who = null;                       // active guest name
let history = {};                     // per-guest transcript
let voiceOn = localStorage.getItem('spaces.voice') !== 'off';
let voices = [];
let picked = {};                      // resolved voice per character
let busy = false;

function score(v, cfg) {
  let n = 0;
  NATURAL.forEach(([re, pts]) => { if (re.test(v.name)) n += pts; });
  if (cfg.want.some((re) => re.test(v.name))) n += 60;
  if (cfg.lang.test(v.lang)) n += 30;
  else if (/^en/i.test(v.lang)) n += 12;
  if (!v.localService) n += 15;       // remote voices are the good ones
  return n;
}

function loadVoices() {
  voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
  picked = {};
  const en = voices.filter((v) => /^en/i.test(v.lang));
  const pool = en.length ? en : voices;
  const taken = new Set();
  // men first: male voices are the scarcer set on most systems, so let Kerem
  // claim one before the two female parts take their pick
  const order = Object.keys(VOICE).sort((a, b) => (VOICE[a].sex === 'm' ? -1 : 1) - (VOICE[b].sex === 'm' ? -1 : 1));
  order.forEach((name) => {
    const cfg = VOICE[name];
    const rank = (list) => list.slice().sort((a, b) => score(b, cfg) - score(a, cfg));
    const right = rank(pool.filter((v) => genderOf(v) === cfg.sex));
    const unknown = rank(pool.filter((v) => genderOf(v) === null));
    // right gender, then unnamed voices, and only then anything at all
    const v = right.find((x) => !taken.has(x.name)) || right[0]
           || unknown.find((x) => !taken.has(x.name)) || unknown[0]
           || rank(pool)[0];
    if (v) { picked[name] = v; taken.add(v.name); }
  });
}
loadVoices();
if (window.speechSynthesis) speechSynthesis.onvoiceschanged = loadVoices;

/* Long utterances degrade and often truncate, so speak sentence by sentence
   with a beat between them — that pause is most of what reads as "natural". */
function say(name, text) {
  if (!voiceOn || !window.speechSynthesis) return;
  speechSynthesis.cancel();
  const cfg = VOICE[name] || { pitch: 1, rate: 1 };
  const v = picked[name];
  const parts = String(text).match(/[^.!?…]+[.!?…]*/g) || [text];
  parts.forEach((raw, i) => {
    const part = raw.trim();
    if (!part) return;
    const u = new SpeechSynthesisUtterance(part);
    if (v) u.voice = v;
    u.pitch = cfg.pitch + (i ? 0.015 : 0);   // drift a touch across a turn
    u.rate = cfg.rate * (part.length < 28 ? 0.97 : 1);
    u.volume = 0.95;
    speechSynthesis.speak(u);
  });
}

function line(text, mine, cls) {
  const el = document.createElement('div');
  el.className = 'tm' + (mine ? ' me' : '') + (cls ? ' ' + cls : '');
  el.textContent = text;
  talkLog.appendChild(el);
  talkLog.scrollTop = talkLog.scrollHeight;
  return el;
}

function systemFor(name) {
  const p = field.persona(name) || { role: 'Guest' };
  return [
    'You are ' + name + ', a guest inside ILLUSORR Spaces — a multi-user immersive',
    'environment ILLUSORR shipped in 2021. Your role here is: ' + p.role + '.',
    'The visitor is standing near you in the ' + field.worldName() + ' destination.',
    '',
    'Facts you may rely on: there are five destinations on one selector, all ILLUSORR\'s own;',
    'one avatar travels between all of them; a single HUD carries inventory (place a screen,',
    'podium or seating), screen share (cast a display or webcam onto a surface), spatial voice,',
    'and chat; hosts share a world code and set guest permissions; the surface underfoot is a',
    'contour field with three presets (Field, Current, Still). This web page is a single-player',
    'model of the platform, not the platform itself.',
    '',
    'Speak in first person, in character, warm but unfussy. Two or three short sentences at most —',
    'this is spoken aloud, so no lists, no markdown, no stage directions. If asked something you',
    'cannot know, say so plainly rather than inventing detail.',
  ].join(' ');
}

function openTalk(name) {
  who = name;
  const p = field.persona(name) || {};
  $('#talkName').textContent = name;
  $('#talkRole').textContent = p.role || 'Guest';
  closeAll();
  talk.classList.add('open');
  document.body.classList.add('is-talking');
  field.setChatter(false);
  field.lookAt(name);
  field.hold(name, 60000);
  if (!history[name]) {
    history[name] = [];
    const opener = (p.lines && p.lines[0]) || 'Good to see you.';
    line(opener, false);
    field.speakAs(name, opener);
    say(name, opener);
  }
  talkLog.innerHTML = '';
  history[name].forEach((m) => line(m.content, m.role === 'user'));
  if (!history[name].length) {
    const opener = (p.lines && p.lines[0]) || 'Good to see you.';
    line(opener, false);
  }
  setTimeout(() => talkIn.focus(), 340);
}
window.spacesUI.openTalk = openTalk;

function closeTalk() {
  talk.classList.remove('open');
  document.body.classList.remove('is-talking');
  field.setChatter(true);
  if (window.speechSynthesis) speechSynthesis.cancel();
  who = null;
}
$('#talkX').addEventListener('click', (e) => { e.stopPropagation(); closeTalk(); });

talkVoice.addEventListener('click', (e) => {
  e.stopPropagation();
  voiceOn = !voiceOn;
  localStorage.setItem('spaces.voice', voiceOn ? 'on' : 'off');
  talkVoice.classList.toggle('is-on', voiceOn);
  talkVoice.setAttribute('aria-pressed', String(voiceOn));
  if (!voiceOn && window.speechSynthesis) speechSynthesis.cancel();
});
talkVoice.classList.toggle('is-on', voiceOn);

talkForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = talkIn.value.trim();
  if (!text || busy || !who) return;
  const name = who;
  talkIn.value = '';
  line(text, true);
  history[name].push({ role: 'user', content: text });

  busy = true;
  talkSend.disabled = true;
  const waiting = line('…', false, 'wait');
  field.hold(name, 30000);

  try {
    if (!window.claude || !window.claude.complete) throw new Error('offline');
    const reply = (await window.claude.complete({
      system: systemFor(name),
      messages: history[name].slice(-10),
      max_tokens: 220,
    })).trim();
    waiting.remove();
    line(reply, false);
    history[name].push({ role: 'assistant', content: reply });
    field.speakAs(name, reply);
    say(name, reply);
  } catch (err) {
    waiting.remove();
    const p = field.persona(name);
    const fallback = (p && p.lines[Math.floor(Math.random() * p.lines.length)])
      || 'Say that again — the link dropped.';
    line(fallback, false);
    field.speakAs(name, fallback);
    say(name, fallback);
  } finally {
    busy = false;
    talkSend.disabled = false;
    talkIn.focus();
  }
});

addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && talk.classList.contains('open')) closeTalk();
});

/* ── enter ────────────────────────────────────────────── */
if (EMBED) {
  gate.classList.add('gone');
  document.body.classList.add('entered');
  /* the gate is what normally starts the ambience; embedded, there is no
     gate to click, so arm it on the first gesture instead */
  if (wanted) {
    var armOnce = function () { setSound(true); document.removeEventListener('pointerdown', armOnce); };
    document.addEventListener('pointerdown', armOnce, { once: true });
  }
}

$('#enter').addEventListener('click', () => {
  gate.classList.add('gone');
  document.body.classList.add('entered');   // releases the touch cue
  if (wanted) setSound(true);
  setTimeout(() => field.say('Begum', 'Welcome in — drag to look around.'), 900);
});
})();
