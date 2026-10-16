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

/* ---- MEET AVELLION: constellation · typewriter widget · mode cycle · stack marquee ---- */
(function () {
  if (!document.getElementById('listenWidget')) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* reveal the listening widget when the section is on screen */
  var sec = document.querySelector('.meet-sec');
  if (sec) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { sec.classList.add('in'); } });
      }, { threshold: 0.15 }).observe(sec);
    } else { sec.classList.add('in'); }
  }

  /* stack marquee (duplicate content for seamless loop) */
  var track = document.getElementById('stripTrack');
  if (track) {
    var items = ['Google','CRM','SharePoint','SAP','Email','Slack','Drive','Asana','Jira','Teams','Outlook','Files'];
    var half = '';
    items.forEach(function (it, i) {
      half += '<span class="item' + (it === 'CRM' ? ' hot' : '') + '">' + it + '</span><span class="sep">&#183;</span>';
    });
    track.innerHTML = half + half;
  }

  /* typewriter widget */
  var typeEl = document.getElementById('lwType');
  var modesEl = document.getElementById('lwModes');
  var bars = Array.prototype.slice.call(document.querySelectorAll('.lw-modes i'));
  var prompts = [
    'Pull last month\'s expenses',
    'Draft the follow-up for the overdue accounts',
    'Summarize open tickets for the standup',
    'Prepare the client proposal from the rate card'
  ];
  var modeNames = ['Voice', 'Text', 'Data'];
  if (typeEl) {
    if (reduced) { typeEl.textContent = prompts[0]; }
    else {
      var pi = 0, ci = 0, deleting = false, mi = 0;
      (function tick () {
        var full = prompts[pi];
        if (!deleting) {
          ci++;
          if (ci >= full.length) { ci = full.length; deleting = true; }
          typeEl.textContent = full.slice(0, ci);
          setTimeout(tick, 46 + Math.random() * 40);
        } else {
          setTimeout(function () {
            ci -= 3;
            if (ci <= 0) {
              ci = 0; deleting = false;
              pi = (pi + 1) % prompts.length;
              mi = (mi + 1) % modeNames.length;
              setMode(mi);
            }
            typeEl.textContent = full.slice(0, Math.max(ci, 0));
            tick();
          }, 26);
        }
      })();
    }
    function setMode (i) {
      bars.forEach(function (b, j) { b.classList.toggle('on', j === i); });
      modesEl.innerHTML = modeNames.map(function (n, j) { return j === i ? '<b>' + n + '</b>' : n; }).join(' &middot; ');
    }
  }

  /* constellation canvas */
  var cv = document.getElementById('meetNet');
  if (cv && !reduced && cv.getContext) {
    var ctx = cv.getContext('2d');
    var nodes = [], W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var LINK = 130, visible = false;
    function resize () {
      var r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }
    function seed () {
      nodes = [];
      var n = Math.round((W * H) / 26000);
      for (var i = 0; i < n; i++) {
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18,
          r: Math.random() * 1.6 + .6
        });
      }
    }
    function frame () {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            var o = (1 - Math.sqrt(d2) / LINK) * .35;
            ctx.strokeStyle = 'rgba(31,156,224,' + o.toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(31,156,224,.5)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    function start () { if (!visible) { visible = true; resize(); requestAnimationFrame(frame); } }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? start() : (visible = false); }); }, { threshold: 0.05 }).observe(cv);
    } else start();
    window.addEventListener('resize', resize, { passive: true });
  }
})();
