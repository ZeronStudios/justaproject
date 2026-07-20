(function() {

  /* ══════════════════════════════════════════════════════════════
     CINEMATIC INTRO — JET & TRICOLOR SMOKE
  ══════════════════════════════════════════════════════════════ */
  (function() {
    var intro = document.querySelector('.intro');
    var jetWrap = document.querySelector('.jet-wrapper');
    var jetCont = document.querySelector('.jet-container');
    var canvas = document.getElementById('smoke-canvas');
    if (!intro || !jetWrap || !canvas) return;

    var ctx = canvas.getContext('2d');
    var W, H;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    var SAFFRON = { r: 255, g: 153, b: 51 };
    var WHITE   = { r: 255, g: 255, b: 255 };
    var GREEN   = { r: 19,  g: 136, b: 8 };
    var STREAMS = [SAFFRON, WHITE, GREEN];

    var particles = [];
    var startTime = null;
    var DURATION = 8000;

    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function jetX(elapsed) {
      var t = Math.min(elapsed / DURATION, 1);
      var x;
      if (t < 0.18) {
        var p = easeInOut(t / 0.18);
        x = -28 + p * 78;
      } else if (t < 0.32) {
        var p = (t - 0.18) / 0.14;
        x = 50 + p * 8;
      } else if (t < 0.52) {
        var p = (t - 0.32) / 0.2;
        p = p * p * (3 - 2 * p);
        x = 58 + p * 65;
      } else {
        x = 123;
      }
      return x;
    }

    function jetBanking(elapsed) {
      var t = Math.min(elapsed / DURATION, 1);
      if (t < 0.18) {
        var p = t / 0.18;
        return p * 6;
      } else if (t < 0.32) {
        return 6 * (1 - (t - 0.18) / 0.14);
      } else if (t < 0.52) {
        var p = (t - 0.32) / 0.2;
        return -p * 5;
      }
      return 0;
    }

    function emit(elapsed) {
      var t = elapsed / DURATION;
      if (t > 0.52) return;
      var jx = jetX(elapsed);
      var px = (jx / 100) * W;
      var py = H * 0.42 + Math.sin(elapsed * 0.003) * 12;

      for (var i = 0; i < 3; i++) {
        var si = Math.floor(Math.random() * 3);
        var color = STREAMS[si];
        var yOff = (si - 1) * 12 + (Math.random() - 0.5) * 5;
        particles.push({
          x: px - 8 + Math.random() * 16,
          y: py + yOff + (Math.random() - 0.5) * 3,
          vx: -1 - Math.random() * 3,
          vy: (Math.random() - 0.5) * 0.4,
          color: color,
          size: 3 + Math.random() * 5,
          alpha: 0.4 + Math.random() * 0.6,
          life: 80 + Math.random() * 60
        });
      }
    }

    function update(elapsed) {
      var t = elapsed / DURATION;
      var billow = Math.max(0, Math.min(1, (t - 0.48) / 0.12));

      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.life--;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        p.vx += (Math.random() - 0.5) * 0.12;
        p.vy += (Math.random() - 0.5) * 0.08;
        if (billow > 0) {
          p.vx += (Math.random() - 0.5) * billow * 2;
          p.vy += (Math.random() - 0.5) * billow * 1.5;
          p.size += 0.15 * billow;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.size += 0.015;
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var alpha = p.alpha * Math.min(1, p.life / 25);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgb(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function frame(ts) {
      if (!startTime) startTime = ts;
      var elapsed = ts - startTime;

      if (elapsed > DURATION + 1200) {
        intro.style.transition = 'opacity 0.8s ease';
        intro.style.opacity = '0';
        setTimeout(function() { intro.style.display = 'none'; }, 800);
        return;
      }

      var t = elapsed / DURATION;
      var jx = jetX(elapsed);
      var banking = jetBanking(elapsed);
      var yOsc = Math.sin(elapsed * 0.003) * 12;

      jetWrap.style.transform = 'translateX(' + jx + 'vw) translateY(' + yOsc + 'px)';

      var roll = 0;
      if (t >= 0.18 && t < 0.32) {
        var rp = (t - 0.18) / 0.14;
        roll = rp * 360;
        var wobble = Math.sin(rp * Math.PI * 4) * 3;
        if (jetCont) jetCont.style.transform = 'rotateZ(' + banking + 'deg) rotateY(' + roll + 'deg) rotateX(' + wobble + 'deg)';
      } else if (jetCont) {
        jetCont.style.transform = 'rotateZ(' + banking + 'deg) rotateY(0deg)';
      }

      emit(elapsed);
      update(elapsed);
      draw();

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  })();

  const overlay = document.querySelector('.modal-overlay');
  const sections = document.querySelectorAll('.scene');
  const navDots = document.querySelectorAll('.ndot');

  /* ── Helpers: open / close detail panel ─ */
  var CARD_SEL = '.uorb-card, .monument-exhibit, .festival, .dish-exhibit, .aex, .animal-card, .arts-card, .inst-card, .ds-card, .isro-card, .digi-card, .future-card';
  var DETAIL_SEL = '.mex-detail, .fest-detail, .dish-detail, .aex-detail, .animal-detail, .uorb-detail, .arts-detail, .inst-detail, .ds-detail, .isro-detail, .digi-detail, .future-detail';

  function panelOpen() {
    return document.querySelector('.detail-show') !== null;
  }

  var _panelHome = null;

  function closePanel() {
    var closeRadio = document.getElementById('ex-close');
    if (closeRadio) closeRadio.checked = true;
    document.querySelectorAll('.detail-show').forEach(function(p) {
      p.classList.remove('detail-show');
      p.style.zIndex = '';
      p.style.position = '';
      p.style.top = '';
      p.style.left = '';
      p.style.transform = '';
      if (_panelHome && _panelHome.contains(p) === false) {
        _panelHome.appendChild(p);
      }
    });
    _panelHome = null;
    document.querySelectorAll('.card-detail-open').forEach(function(c) {
      c.classList.remove('card-detail-open');
      c.style.transform = '';
      c.style.transformStyle = '';
    });
    if (overlay) overlay.classList.remove('overlay-show');
  }

  function showPanel(panel) {
    closePanel();
    _panelHome = panel.parentNode;
    document.body.appendChild(panel);
    panel.classList.add('detail-show');
    panel.style.zIndex = '2147483647';
    var card = _panelHome.closest ? _panelHome.closest(CARD_SEL) : null;
    if (card) card.classList.add('card-detail-open');
    if (overlay) overlay.classList.add('overlay-show');
    var scrollArea = panel.querySelector('.mex-det-scroll, .fest-det-scroll, .dish-det-scroll, .aex-det-scroll, .animal-det-scroll, .uorb-det-scroll, .arts-det-scroll, .inst-det-scroll, .ds-det-scroll, .isro-det-scroll, .digi-det-scroll, .future-det-scroll');
    if (scrollArea) {
      scrollArea.style.transformStyle = 'flat';
      scrollArea.style.perspective = 'none';
      scrollArea.querySelectorAll(':scope > *').forEach(function(item) {
        item.style.transform = 'none';
        item.style.opacity = '1';
        item.style.transitionDelay = '0s';
      });
    }
  }

  /* ── 1. Click card (not on label/close) → open detail ─ */
  document.querySelectorAll(CARD_SEL).forEach(function(card) {
    card.addEventListener('click', function(e) {
      if (panelOpen()) return;
      if (e.target.closest('.ex-tap-hint, .ex-det-close')) return;
      var detail = this.querySelector(DETAIL_SEL);
      if (detail) {
        showPanel(detail);
        var scroll = detail.querySelector('.mex-det-scroll, .fest-det-scroll, .dish-det-scroll, .aex-det-scroll, .animal-det-scroll, .uorb-det-scroll, .arts-det-scroll, .inst-det-scroll, .ds-det-scroll, .isro-det-scroll, .digi-det-scroll, .future-det-scroll');
        if (scroll) setTimeout(function() { scroll.scrollTop = 0; }, 80);
      }
    });
  });

  /* ── 2. Tap label → open detail ─ */
  document.querySelectorAll('.ex-tap-hint').forEach(function(label) {
    label.addEventListener('click', function(e) {
      if (panelOpen()) return;
      var card = this.closest(CARD_SEL);
      if (!card) return;
      var detail = card.querySelector(DETAIL_SEL);
      if (detail) {
        showPanel(detail);
        var scroll = detail.querySelector('.mex-det-scroll, .fest-det-scroll, .dish-det-scroll, .aex-det-scroll, .animal-det-scroll, .uorb-det-scroll, .arts-det-scroll, .inst-det-scroll, .ds-det-scroll, .isro-det-scroll, .digi-det-scroll, .future-det-scroll');
        if (scroll) setTimeout(function() { scroll.scrollTop = 0; }, 80);
      }
    });
  });

  /* ── 3. Close button ─ */
  document.querySelectorAll('.ex-det-close').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      closePanel();
    });
  });

  /* ── 4. Overlay click + Escape → close ─ */
  if (overlay) overlay.addEventListener('click', function(e) { e.stopPropagation(); closePanel(); });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closePanel();
  });

  /* ── 5. Active section highlight in nav ─ */
  if (sections.length && navDots.length) {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navDots.forEach(function(dot) {
          dot.classList.toggle('active', dot.getAttribute('href') === '#' + id);
        });
      });
    }, { threshold: 0.35, rootMargin: '-60px 0px 0px 0px' });
    sections.forEach(function(s) { obs.observe(s); });
  }

  /* ── 6. Smooth scroll on nav dot click ─ */
  navDots.forEach(function(dot) {
    dot.addEventListener('click', function(e) {
      e.preventDefault();
      var id = this.getAttribute('href').slice(1);
      var t = document.getElementById(id);
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ── 7. Touch swipe down to close detail panel ─ */
  (function() {
    var startY = 0, startX = 0, tracking = false;
    document.querySelectorAll(DETAIL_SEL).forEach(function(panel) {
      panel.addEventListener('touchstart', function(e) {
        var t = e.changedTouches[0];
        startY = t.screenY; startX = t.screenX; tracking = true;
      }, { passive: true });
      panel.addEventListener('touchmove', function(e) {
        if (!tracking) return;
        var t = e.changedTouches[0];
        var dy = t.screenY - startY;
        if (dy > 80 && Math.abs(t.screenX - startX) < dy * 0.6) {
          tracking = false;
          closePanel();
        }
      }, { passive: true });
      panel.addEventListener('touchend', function() { tracking = false; }, { passive: true });
    });
  })();

  /* ── 8. Arrow key section navigation ─ */
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    if (panelOpen()) return;
    e.preventDefault();
    var dir = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : -1;
    var bestIdx = -1, bestDist = Infinity;
    sections.forEach(function(s, i) {
      var dist = Math.abs(s.getBoundingClientRect().top);
      if (dist < bestDist) { bestDist = dist; bestIdx = i; }
    });
    var next = bestIdx + dir;
    if (next >= 0 && next < sections.length) {
      sections[next].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  /* ── 9. Progress bar ─ */
  (function() {
    var bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,var(--saffron),var(--gold),var(--india-green));z-index:9999999;width:0%;transition:width 0.1s linear;';
    document.body.appendChild(bar);
    window.addEventListener('scroll', function() {
      var s = window.scrollY, d = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (d > 0 ? (s / d) * 100 : 0) + '%';
    }, { passive: true });
  })();

  /* ── 10. Mouse-driven 3D perspective tilt on cards ─ */
  (function() {
    var tilt = document.querySelectorAll('[class*="scene"] > div > div[class*="card"],[class*="scene"] > div[class*="card"]');
    if (!tilt.length) return;
    tilt.forEach(function(card) {
      card.style.willChange = 'transform';
      card.style.transformStyle = 'preserve-3d';
      card.addEventListener('mouseenter', function() {
        if (panelOpen()) return;
        card.style.transition = 'transform 0.08s ease-out';
      });
      card.addEventListener('mousemove', function(e) {
        if (panelOpen()) return;
        var r = card.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) / r.width;
        var dy = (e.clientY - r.top - r.height / 2) / r.height;
        card.style.transform = 'perspective(800px) rotateX(' + (-dy * 12) + 'deg) rotateY(' + (dx * 12) + 'deg) translateZ(10px)';
      });
      card.addEventListener('mouseleave', function() {
        card.style.transition = 'transform 0.4s ease-out';
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)';
      });
    });
  })();

  /* ── 11. Global 3D camera perspective following mouse ─ */
  (function() {
    var vw = window.innerWidth, vh = window.innerHeight;
    window.addEventListener('resize', function() { vw = window.innerWidth; vh = window.innerHeight; }, { passive: true });
    var sceneWraps = document.querySelectorAll('.scene');
    sceneWraps.forEach(function(scene) {
      scene.style.transformStyle = 'preserve-3d';
      scene.style.perspective = '1200px';
    });
    document.addEventListener('mousemove', function(e) {
      if (panelOpen()) return;
      var nx = (e.clientX / vw - 0.5) * 2, ny = (e.clientY / vh - 0.5) * 2;
      requestAnimationFrame(function() {
        sceneWraps.forEach(function(s) {
          if (!s._locked) s.style.transform = 'rotateX(' + (-ny * 1.5) + 'deg) rotateY(' + (nx * 1.5) + 'deg)';
        });
      });
    });
    var scrollTimer;
    window.addEventListener('scroll', function() {
      sceneWraps.forEach(function(s) { s._locked = true; });
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function() { sceneWraps.forEach(function(s) { s._locked = false; }); }, 200);
    }, { passive: true });
  })();

  /* ── 12. Scroll-driven 3D reveal for detail panels ─ */
  (function() {
    var reveals = document.querySelectorAll('.mex-det-scroll,.fest-det-scroll,.dish-det-scroll,.aex-det-scroll,.animal-det-scroll,.uorb-det-scroll,.arts-det-scroll,.inst-det-scroll,.ds-det-scroll,.isro-det-scroll,.digi-det-scroll,.future-det-scroll');
    reveals.forEach(function(el) {
      el.style.transformStyle = 'preserve-3d';
      el.style.perspective = '600px';
      el.querySelectorAll(':scope > *').forEach(function(item, i) {
        item.style.transition = 'transform 0.6s cubic-bezier(.22,.61,.36,1), opacity 0.5s ease';
        item.style.transform = 'translateY(30px) translateZ(-20px)';
        item.style.opacity = '0.4';
        item.style.transitionDelay = (i * 0.04) + 's';
      });
    });
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll(':scope > *').forEach(function(item) {
          item.style.transform = 'translateY(0) translateZ(0)';
          item.style.opacity = '1';
        });
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.1 });
    reveals.forEach(function(el) { obs.observe(el); });
  })();

})();
