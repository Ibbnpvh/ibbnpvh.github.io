  const reveals = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  reveals.forEach(r => obs.observe(r));


  // ── BANNER DE COOKIES ──
  (function() {
    var consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      document.getElementById('cookie-banner').style.display = 'flex';
    } else if (consent === 'accepted') {
      gtag('consent', 'update', { analytics_storage: 'granted' });
    }
  })();

  window.aceitarCookies = function() {
    localStorage.setItem('cookie_consent', 'accepted');
    gtag('consent', 'update', { analytics_storage: 'granted' });
    document.getElementById('cookie-banner').style.display = 'none';
  };
  window.rejeitarCookies = function() {
    localStorage.setItem('cookie_consent', 'rejected');
    gtag('consent', 'update', { analytics_storage: 'denied' });
    document.getElementById('cookie-banner').style.display = 'none';
  };

  // ── Hamburger menu toggle ──
  (function() {
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    if (!toggle || !links) return;
    toggle.addEventListener('click', function() {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        toggle.classList.remove('active');
        links.classList.remove('open');
      });
    });
  })();

  // ── Nav shrink on scroll ──
  (function() {
    var nav = document.querySelector('nav');
    if (!nav) return;
    var shrunk = false;
    window.addEventListener('scroll', function() {
      var y = window.scrollY || window.pageYOffset;
      if (y > 80 && !shrunk) { nav.classList.add('scrolled'); shrunk = true; }
      else if (y <= 80 && shrunk) { nav.classList.remove('scrolled'); shrunk = false; }
    }, { passive: true });
  })();

  // ── Partículas no hero ──
  (function() {
    var canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var W, H;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (var i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.4 + 0.1,
        gold: Math.random() > 0.7
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(function(p) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold ? 'rgba(255,191,0,' + p.alpha + ')' : 'rgba(255,255,255,' + p.alpha + ')';
        ctx.fill();
      });
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(255,255,255,' + (0.06 * (1 - dist/100)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  })();

  // ── Back to top ──
  (function() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', function() {
      var y = window.scrollY || window.pageYOffset;
      if (y > 400) btn.classList.add('visible');
      else btn.classList.remove('visible');
    }, { passive: true });
    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();
