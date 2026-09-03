/* Shared form submission and human check.
 *
 * Until now every form on the site ended in "this is a wireframe, so nothing
 * was sent" - the contact form, the brief intake and the collective had no
 * delivery path at all. This module gives all three one.
 *
 * Delivery is a plain URL-encoded POST to the site's own origin, which is the
 * shape Netlify Forms expects: the form is declared statically in the page
 * (see the hidden <form data-netlify="true"> blocks) and the POST carries a
 * matching form-name. Nothing here loads a third-party script, so the site
 * keeps its no-remote-requests rule.
 *
 * To move to another provider, change ENDPOINT to the provider's URL. The
 * body is standard application/x-www-form-urlencoded, which Formspree,
 * Web3Forms and Basin all accept unchanged.
 *
 * Spam handling is three layers, none of which calls out to Google:
 *   honeypot   a field no human sees; anything that fills it is dropped
 *   dwell      a form completed in under four seconds is a script
 *   challenge  a visible arithmetic question, readable by a screen reader
 */
(function () {
  'use strict';

  var MIN_DWELL = 4000;             // ms a real person needs to fill anything in

  /* Delivery target. Netlify Forms is the fallback and needs no configuration;
     it posts back to the site's own root. Fill SUPABASE in to switch: the key
     below is the PUBLISHABLE (anon) key, which is designed to ship in client
     code — the anon role can only INSERT into web.form_submissions and cannot
     read a single row back, which is enforced by RLS, not by hiding the key.
     Never put the service role key here. */
  var SUPABASE = {
    url: 'https://mivkvqibkceaayktqtds.supabase.co',
    key: 'sb_publishable_wK8G1NuUGp5DZSdWX26ZkA_h6d6P0jd'
  };
  var ENDPOINT = '/';               // Netlify Forms posts back to the site root

  function enc(obj) {
    return Object.keys(obj).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k] == null ? '' : obj[k]);
    }).join('&');
  }

  /* ---------- human check ---------- */
  /* Arithmetic rather than a distorted image: it works without CSS, without
     canvas, and a screen reader can read it aloud, which a picture of warped
     letters cannot. */
  function Challenge() {
    var a = 2 + Math.floor(Math.random() * 8);
    var b = 1 + Math.floor(Math.random() * 8);
    this.answer = a + b;
    this.question = a + ' + ' + b;
    this.born = Date.now();
  }
  Challenge.prototype.el = function () {
    var self = this;
    var wrap = document.createElement('div');
    wrap.className = 'il-cap';

    var hp = document.createElement('input');
    hp.type = 'text'; hp.name = 'bot-field'; hp.tabIndex = -1;
    hp.setAttribute('autocomplete', 'off'); hp.setAttribute('aria-hidden', 'true');
    hp.className = 'il-cap-hp';
    this.hp = hp; wrap.appendChild(hp);

    var lab = document.createElement('label');
    lab.className = 'il-cap-lab';
    var q = document.createElement('span');
    q.className = 'il-cap-q';
    q.textContent = 'Quick check: what is ' + this.question + '?';
    var inp = document.createElement('input');
    inp.type = 'text'; inp.inputMode = 'numeric'; inp.className = 'il-cap-in';
    inp.setAttribute('autocomplete', 'off');
    inp.setAttribute('aria-label', 'Answer ' + this.question + ' to confirm you are human');
    this.input = inp;
    lab.appendChild(q); lab.appendChild(inp);
    wrap.appendChild(lab);

    var re = document.createElement('button');
    re.type = 'button'; re.className = 'il-cap-new'; re.textContent = 'New question';
    re.addEventListener('click', function () {
      var c = new Challenge();
      self.answer = c.answer; self.question = c.question;
      q.textContent = 'Quick check: what is ' + c.question + '?';
      inp.setAttribute('aria-label', 'Answer ' + c.question + ' to confirm you are human');
      inp.value = ''; inp.focus();
    });
    wrap.appendChild(re);
    return wrap;
  };
  /* Returns null when the visitor looks human, otherwise the message to show. */
  Challenge.prototype.check = function () {
    if (this.hp && this.hp.value) return 'Something went wrong. Please try again.';
    if (Date.now() - this.born < MIN_DWELL) return 'One moment, then try again.';
    var v = (this.input && this.input.value || '').trim();
    if (!v) return 'Please answer the check question.';
    if (parseInt(v, 10) !== this.answer) return 'That is not the right answer. Try again.';
    return null;
  };

  /* ---------- delivery ---------- */
  function sendSupabase(formName, fields) {
    /* The whole submission is kept in payload as well, so a field added to a
       form later still lands somewhere without a schema migration. */
    var row = {
      kind: formName,
      name: fields.name || null,
      email: fields.email || null,
      page: location.pathname,
      user_agent: navigator.userAgent.slice(0, 400),
      payload: fields
    };
    return fetch(SUPABASE.url.replace(/\/$/, '') + '/rest/v1/form_submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE.key,
        'Authorization': 'Bearer ' + SUPABASE.key,
        'Accept-Profile': 'web',
        'Content-Profile': 'web',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(row)
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return true;
    });
  }

  function sendNetlify(formName, fields) {
    var body = {};
    Object.keys(fields).forEach(function (k) { body[k] = fields[k]; });
    body['form-name'] = formName;
    body['page'] = location.pathname;
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: enc(body)
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return true;
    });
  }

  function send(formName, fields) {
    return (SUPABASE.url && SUPABASE.key)
      ? sendSupabase(formName, fields)
      : sendNetlify(formName, fields);
  }

  window.ILForm = { Challenge: Challenge, send: send, MIN_DWELL: MIN_DWELL };
})();
