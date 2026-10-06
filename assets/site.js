/* Tavellion v9 (design C "Chad at work") — shared behaviour + animations
   menu · scroll-reveal · diagram reveal · 10/80/10 bar · count-up · live Chad task feed · contact form */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- mobile menu ----
  var burger = document.querySelector('.nav-burger');
  var list = document.getElementById('navlist');
  if (burger && list) {
    burger.addEventListener('click', function () {
      var open = list.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    list.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { list.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }

  // ---- count-up ----
  function countUp(el) {
    if (reduce) return;
    var raw = el.getAttribute('data-count');
    if (raw === null) return;
    var target = parseFloat(raw);
    var dec = (raw.split('.')[1] || '').length;
    var dur = 1500, start = null;
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(dec);
    }
    requestAnimationFrame(tick);
  }

  function atOrAbove(el, pad) {
    var r = el.getBoundingClientRect();
    return r.top < window.innerHeight * pad && r.bottom > -80;
  }

  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var divs = Array.prototype.slice.call(document.querySelectorAll('.divide'));
  var diags = Array.prototype.slice.call(document.querySelectorAll('.diagram-wrap'));
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));

  function revealPass(pad) {
    reveals.forEach(function (el) { if (!el.classList.contains('in') && atOrAbove(el, pad)) el.classList.add('in'); });
    divs.forEach(function (el) { if (!el.classList.contains('in') && atOrAbove(el, 1.05)) el.classList.add('in'); });
    diags.forEach(function (el) { if (!el.classList.contains('in') && atOrAbove(el, 1.15)) el.classList.add('in'); });
    counters.forEach(function (el) { if (!el.getAttribute('data-done') && atOrAbove(el, 1.05)) { el.setAttribute('data-done', '1'); countUp(el); } });
  }

  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          if (en.target.hasAttribute('data-count')) { en.target.setAttribute('data-done', '1'); countUp(en.target); }
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { if (!el.classList.contains('in')) io.observe(el); });
    divs.forEach(function (el) { io.observe(el); });
    diags.forEach(function (el) { io.observe(el); });
    counters.forEach(function (el) { io.observe(el); });
  }

  if (reduce) {
    reveals.forEach(function (el) { el.classList.add('in'); });
    divs.forEach(function (el) { el.classList.add('in'); });
    diags.forEach(function (el) { el.classList.add('in'); });
    counters.forEach(function (el) { el.setAttribute('data-done', '1'); });
  } else {
    revealPass(1.05);
    window.addEventListener('scroll', function () { revealPass(1.05); }, { passive: true });
    window.addEventListener('resize', function () { revealPass(1.05); });
  }

  // ---- live Chad task feed (hero) ----
  var feed = document.querySelector('.demo-feed');
  if (feed && !reduce) {
    var tasks = [
      { who: 'Sales', anim: 'work-point', text: 'Drafting proposal for <b>ACM d.o.o.</b>' },
      { who: 'Knowledge', anim: 'work-type', text: 'Searching <b>2,340 documents</b> for the Q3 report' },
      { who: 'Ops', anim: 'work-lift', text: 'Syncing CRM &amp; ERP — <b>142 records</b> updated' },
      { who: 'Support', anim: 'work-scan', text: 'Answering ticket <b>#4821</b> from the knowledge base' },
      { who: 'Reports', anim: 'work-tally', text: 'Assembling the <b>weekly ops digest</b>' },
      { who: 'Email', anim: 'work-sway', text: 'Sorting <b>38 new messages</b> — 3 need you' }
    ];
    var bubble = document.querySelector('.demo-chad .bubble');
    var MAX = 5, i = 0;

    function line(state) {
      var t = tasks[i % tasks.length];
      var d = document.createElement('div');
      d.className = 'tl2 ' + (state === 'working' ? 'working' : 'done');
      var st = state === 'working' ? '<span class="st"><i></i></span>' : '<span class="st">✓</span>';
      d.innerHTML = st + '<span class="tx"><b>' + t.who + '</b> · ' + t.text + '</span>';
      return d;
    }
    function append(d) {
      feed.appendChild(d);
      requestAnimationFrame(function () { d.classList.add('show'); });
      while (feed.children.length > MAX) feed.removeChild(feed.firstChild);
    }

    // seed with two completed lines only if the page didn't ship static ones (no-JS fallback)
    if (feed.children.length < 2) { for (var s = 0; s < 2; s++) { i++; append(line('done')); } }

    function setAnim(cls) {
      var im = document.querySelector('.demo-chad img');
      if (!im) return;
      ['work-type','work-sway','work-point','work-scan','work-lift','work-nod','work-tally'].forEach(function (c) { im.classList.remove(c); });
      if (cls) im.classList.add(cls);
    }
    function cycle() {
      i++;
      var w = line('working');
      append(w);
      setAnim(tasks[i % tasks.length].anim);
      if (bubble) bubble.textContent = 'Working on it…';
      setTimeout(function () {
        w.classList.remove('working');
        w.classList.add('done');
        w.querySelector('.st').innerHTML = '✓';
        if (bubble) bubble.textContent = 'Done ✓';
        setTimeout(cycle, 900);
      }, 2400);
    }
    setTimeout(cycle, 1200);
  }

  // ---- contact form (mailto, client-side only) ----
  var form = document.getElementById('proposal-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = function (id) { var el = document.getElementById(id); return el ? (el.value || '').trim() : ''; };
      var name = g('name'), company = g('company'), email = g('email'), problem = g('problem'), size = g('size');
      if (!name || !company || !email || !problem) {
        window.alert('Please fill in your name, company, email and the problem you want to solve.');
        return;
      }
      var checks = Array.prototype.map.call(form.querySelectorAll('.checks input:checked'), function (c) { return c.value; }).join(', ');
      var subject = 'Proposal request — ' + company;
      var body = 'Name: ' + name + '\nCompany: ' + company + '\nEmail: ' + email + '\n';
      if (size) body += 'Company size: ' + size + '\n';
      if (checks) body += 'Relevant areas: ' + checks + '\n';
      body += '\nProblem / goal:\n' + problem + '\n\n---\nSent from tavellion.com contact form';
      window.location.href = 'mailto:info@tavellion.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }
})();
