(function () {
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  document.documentElement.classList.add('js');

  // mobile menu
  var nav = $('.nav'), burger = $('.burger');
  burger.addEventListener('click', function () { burger.setAttribute('aria-expanded', nav.classList.toggle('open')); });
  $$('.nav a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); });
  });

  // sections fade in while scrolling
  var items = $$('.sh, .gal img, .row, .about > *, .contact > *');
  items.forEach(function (el) { el.classList.add('rv'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else items.forEach(function (el) { el.classList.add('in'); });

  // the map connects to Google only after a click
  var btn = $('#load-map'), map = $('#map');
  btn.addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = 'https://maps.google.com/maps?q=Kerkstraat,+Tiel&z=15&output=embed';
    f.title = 'Map: Kerkstraat, Tiel';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    map.appendChild(f);
    map.classList.add('on');
  });

  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
})();

// Portfolio demo only: no network requests, storage or real reservations.
(function () {
  var dlg = document.getElementById('booking');
  if (!dlg) return;
  var SERVICES = [
    ['Signature haircut', 28, 45], ['Skin fade', 30, 45], ['Beard sculpt', 18, 30],
    ['Straight razor shave', 28, 30], ['Cut & beard', 42, 60], ['Kids cut', 18, 30]
  ];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var $ = function (id) { return document.getElementById(id); };
  var form = $('bk-form'), sel = $('bk-service'), grid = $('cal-grid'), title = $('cal-title');
  var slotsEl = $('slots'), sum = $('bk-sum'), err = $('bk-err'), done = $('bk-done'), head = dlg.querySelector('.bk-head');
  var menu = document.querySelector('.nav');
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var first = new Date(today.getFullYear(), today.getMonth(), 1);
  var view = new Date(first);
  var chosen = { date: null, time: null };

  SERVICES.forEach(function (s, i) {
    var o = document.createElement('option'); o.value = i;
    o.textContent = s[0] + ' · €' + s[1] + ' · ' + s[2] + ' min'; sel.appendChild(o);
  });

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function key(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function isOpen(d) { return d.getDay() >= 2 && d.getDay() <= 6 && d > today; }   // Tue to Sat, from tomorrow
  function longDate(d) { return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()]; }

  function drawCal() {
    title.textContent = MONTHS[view.getMonth()] + ' ' + view.getFullYear();
    $('cal-prev').disabled = view <= first;
    $('cal-next').disabled = view >= new Date(first.getFullYear(), first.getMonth() + 2, 1);
    grid.innerHTML = '';
    var lead = (new Date(view.getFullYear(), view.getMonth(), 1).getDay() + 6) % 7;
    for (var i = 0; i < lead; i++) grid.appendChild(document.createElement('i'));
    var n = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (var day = 1; day <= n; day++) {
      var d = new Date(view.getFullYear(), view.getMonth(), day), b = document.createElement('button');
      b.type = 'button'; b.textContent = day; b.disabled = !isOpen(d);
      if (+d === +today) b.classList.add('today');
      if (chosen.date && key(chosen.date) === key(d)) b.classList.add('sel');
      b.setAttribute('aria-label', longDate(d) + ' ' + d.getFullYear());
      b.setAttribute('aria-pressed', !!chosen.date && key(chosen.date) === key(d));
      (function (d) { b.addEventListener('click', function () { chosen.date = d; chosen.time = null; drawCal(); drawSlots(); update(); grid.querySelector('.sel').focus(); }); })(d);
      grid.appendChild(b);
    }
  }

  function drawSlots() {
    slotsEl.innerHTML = '';
    if (!chosen.date) { slotsEl.innerHTML = '<p class="bk-hint">Choose a date first.</p>'; return; }
    var duration = SERVICES[sel.value][2];
    for (var m = 9 * 60; m + duration <= 18 * 60; m += 30) {
      var t = pad(Math.floor(m / 60)) + ':' + pad(m % 60), b = document.createElement('button');
      b.type = 'button'; b.textContent = t;
      b.setAttribute('aria-pressed', chosen.time === t);
      if (chosen.time === t) b.classList.add('sel');
      (function (t) { b.addEventListener('click', function () { chosen.time = t; drawSlots(); update(); slotsEl.querySelector('.sel').focus(); }); })(t);
      slotsEl.appendChild(b);
    }
  }
  function update() {
    var s = SERVICES[sel.value];
    sum.textContent = chosen.date && chosen.time
      ? s[0] + ' · ' + longDate(chosen.date) + ' at ' + chosen.time + ' · €' + s[1]
      : (chosen.date ? s[0] + ' · ' + longDate(chosen.date) + ' · choose a time' : 'Nothing selected yet.');
    err.textContent = '';
  }
  $('cal-prev').addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); drawCal(); });
  $('cal-next').addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); drawCal(); });
  sel.addEventListener('change', function () { chosen.time = null; drawSlots(); update(); });

  function show() {
    form.reset();
    Array.prototype.forEach.call(form.querySelectorAll('input'), function (input) { input.classList.remove('bad'); input.removeAttribute('aria-invalid'); });
    today = new Date(); today.setHours(0, 0, 0, 0);
    first = new Date(today.getFullYear(), today.getMonth(), 1);
    form.hidden = false; done.hidden = true; head.hidden = false;
    chosen = { date: null, time: null };
    view = new Date(first);
    // at the end of a month there may be nothing left to book: start on the next one
    var left = false, dd = new Date(today);
    while (dd.getMonth() === today.getMonth()) { dd.setDate(dd.getDate() + 1); if (dd.getMonth() === today.getMonth() && isOpen(dd)) { left = true; break; } }
    if (!left) view = new Date(first.getFullYear(), first.getMonth() + 1, 1);
    drawCal(); drawSlots(); update();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    dlg.scrollTop = 0;
  }
  function clearDetails() { form.reset(); }
  function close() { if (dlg.close) dlg.close(); else { dlg.removeAttribute('open'); clearDetails(); } }
  dlg.addEventListener('close', clearDetails);
  dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.hasAttribute('data-close')) close(); });

  Array.prototype.forEach.call(document.querySelectorAll('[data-booking]'), function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); if (menu) menu.classList.remove('open'); document.querySelector('.burger').setAttribute('aria-expanded', 'false'); show(); });
  });

  Array.prototype.forEach.call(form.querySelectorAll('input'), function (i) {
    i.addEventListener('input', function () { i.classList.remove('bad'); i.removeAttribute('aria-invalid'); err.textContent = ''; });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('bk-name'), phone = $('bk-phone');
    var digits = phone.value.replace(/\D/g, '').length;
    var okPhone = /^[+\d\s().-]+$/.test(phone.value.trim()) && digits >= 8 && digits <= 15;
    name.classList.toggle('bad', !name.value.trim()); phone.classList.toggle('bad', !okPhone);
    name.setAttribute('aria-invalid', !name.value.trim()); phone.setAttribute('aria-invalid', !okPhone);
    if (!chosen.date) { err.textContent = 'Please choose a date.'; grid.querySelector('button:not(:disabled)').focus(); return; }
    if (!chosen.time) { err.textContent = 'Please choose a time.'; slotsEl.querySelector('button:not(:disabled)').focus(); return; }
    if (!name.value.trim()) { err.textContent = 'Please enter your name.'; name.focus(); return; }
    if (!okPhone) { err.textContent = 'Please enter a phone number we can reach you on.'; phone.focus(); return; }
    var s = SERVICES[sel.value];
    $('bk-done-text').textContent = s[0] + ' · €' + s[1] + ' · ' + s[2] + ' min. ' + longDate(chosen.date) + ' ' + chosen.date.getFullYear() + ' at ' + chosen.time + ', for ' + name.value.trim() + '.';
    form.hidden = true; head.hidden = true; done.hidden = false; dlg.scrollTop = 0;
    dlg.setAttribute('aria-labelledby', 'bk-done-title');
    done.querySelector('h2').focus();
  });
  dlg.addEventListener('close', function () { dlg.setAttribute('aria-labelledby', 'bk-title'); $('bk-done-text').textContent = ''; });
})();
