import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

// ── Firebase ──────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            'AIzaSyChJNokBlnAuUR5K6vVnI8QL03NCG-_7eA',
  authDomain:        'site-ibbnpvh.firebaseapp.com',
  projectId:         'site-ibbnpvh',
  storageBucket:     'site-ibbnpvh.firebasestorage.app',
  messagingSenderId: '462547977634',
  appId:             '1:462547977634:web:f70734bd274c0a8dbe9efb',
  measurementId:     'G-8B61PPFXVN'
};
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── Reveal on scroll ──────────────────────────────────────────────────────────
const reveals = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
reveals.forEach(r => obs.observe(r));

// ── Nav shrink on scroll ─────────────────────────────────────────────────────
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

// ── Nav active link on scroll ────────────────────────────────────────────────
(function() {
  var sections = document.querySelectorAll('section[id]');
  var links = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !links.length) return;
  function update() {
    var scrollY = window.scrollY || window.pageYOffset;
    var current = '';
    sections.forEach(function(s) {
      if (scrollY >= s.offsetTop - 200) current = s.getAttribute('id');
    });
    links.forEach(function(a) {
      a.classList.remove('active');
      if (a.getAttribute('href') === '#' + current) a.classList.add('active');
    });
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// ── Hamburger menu toggle ────────────────────────────────────────────────────
(function() {
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (!toggle || !links) return;
  toggle.addEventListener('click', function() {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
  });
  // Close menu when clicking a link
  links.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', function() {
      toggle.classList.remove('active');
      links.classList.remove('open');
    });
  });
})();

// ── Back to top button ───────────────────────────────────────────────────────
(function() {
  var btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', function() {
    var y = window.scrollY || window.pageYOffset;
    if (y > 600) btn.classList.add('visible');
    else btn.classList.remove('visible');
  }, { passive: true });
  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


// ── Formulário de oração ──────────────────────────────────────────────────────
window.enviarOracao = async function() {
  const nome   = document.getElementById('oracaoNome').value.trim();
  const tipo   = document.getElementById('oracaoTipo').value;
  const pedido = document.getElementById('oracaoPedido').value.trim();

  if (!pedido) {
    alert('Por favor, escreva seu pedido de oração.');
    return;
  }

  // Salvar no Firestore
  try {
    await addDoc(collection(db, 'oracoes'), {
      nome:  nome || 'Anônimo',
      tipo,
      texto: pedido,
      data:  new Date().toISOString().split('T')[0],
      lida:  false
    });
  } catch(err) {
    console.error('Erro ao salvar pedido de oração:', err);
  }

  // Abrir WhatsApp
  const numero = '5569XXXXXXXXX'; // ✏️ Substitua pelo número real
  const msg = encodeURIComponent(
    '🙏 *Pedido de Oração*\n\n' +
    (nome ? `*Nome:* ${nome}\n` : '') +
    (tipo ? `*Área:* ${tipo}\n` : '') +
    `\n*Pedido:*\n${pedido}`
  );
  window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');

  // Mostrar mensagem de sucesso
  document.getElementById('oracaoForm').style.display    = 'none';
  document.getElementById('oracaoSucesso').style.display = 'block';
};

// ── Banner de cookies ─────────────────────────────────────────────────────────
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

// ── Partículas no hero (com interação do mouse) ─────────────────────────────
(function() {
  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var particles = [];
  var W, H;
  var mouse = { x: -9999, y: -9999 };
  var mouseRadius = 120;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Track mouse position relative to canvas
  var hero = document.getElementById('hero');
  if (hero) {
    hero.addEventListener('mousemove', function(e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    hero.addEventListener('mouseleave', function() {
      mouse.x = -9999; mouse.y = -9999;
    });
  }

  var count = Math.min(100, Math.max(50, Math.floor(W * H / 12000)));
  for (var i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.1,
      baseAlpha: Math.random() * 0.5 + 0.1,
      gold: Math.random() > 0.65,
      pulse: Math.random() * Math.PI * 2
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(function(p) {
      // Pulse effect for gold particles
      if (p.gold) {
        p.pulse += 0.02;
        p.alpha = p.baseAlpha + Math.sin(p.pulse) * 0.15;
      }

      // Mouse repulsion / attraction
      var mdx = p.x - mouse.x;
      var mdy = p.y - mouse.y;
      var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < mouseRadius && mdist > 0) {
        var force = (mouseRadius - mdist) / mouseRadius * 0.8;
        p.x += (mdx / mdist) * force;
        p.y += (mdy / mdist) * force;
      }

      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      if (p.gold) {
        ctx.fillStyle = 'rgba(255,191,0,' + Math.max(0, p.alpha) + ')';
        // Subtle glow for gold particles
        ctx.shadowColor = 'rgba(255,191,0,0.3)';
        ctx.shadowBlur = 6;
      } else {
        ctx.fillStyle = 'rgba(255,255,255,' + p.alpha + ')';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Connecting lines
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 110) {
          var lineAlpha = 0.08 * (1 - dist/110);
          // Gold tint if both particles are gold
          var isGoldLine = particles[i].gold && particles[j].gold;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = isGoldLine
            ? 'rgba(255,191,0,' + lineAlpha * 1.5 + ')'
            : 'rgba(255,255,255,' + lineAlpha + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Mouse glow effect
    if (mouse.x > 0 && mouse.y > 0) {
      var grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouseRadius);
      grad.addColorStop(0, 'rgba(255,191,0,0.04)');
      grad.addColorStop(1, 'rgba(255,191,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(mouse.x - mouseRadius, mouse.y - mouseRadius, mouseRadius * 2, mouseRadius * 2);
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

// ── Contador animado ──────────────────────────────────────────────────────────
function animateCounter(el) {
  var target   = parseInt(el.getAttribute('data-target'), 10);
  var startVal = Math.max(0, parseInt(el.getAttribute('data-start') || '0', 10));
  var prefix   = el.getAttribute('data-prefix')   || '';
  var suffix   = el.getAttribute('data-suffix')   || '';
  var duration = Math.max(200, parseInt(el.getAttribute('data-duration') || '2000', 10));
  var thousands = el.getAttribute('data-thousands') === 'true';
  if (isNaN(target)) return;

  function format(n) {
    return thousands ? n.toLocaleString('pt-BR') : String(n);
  }

  var tsStart = null;
  function step(timestamp) {
    if (!tsStart) tsStart = timestamp;
    var progress = Math.min((timestamp - tsStart) / duration, 1);
    var ease     = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + format(Math.floor(startVal + (target - startVal) * ease)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = prefix + format(target) + suffix;
  }
  requestAnimationFrame(step);
}

var statObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      document.querySelectorAll('.sobre-stat-num[data-target]').forEach(animateCounter);
      statObserver.disconnect();
    }
  });
}, { threshold: 0.5 });
var statRow = document.querySelector('.sobre-stat-row');
if (statRow) statObserver.observe(statRow);
