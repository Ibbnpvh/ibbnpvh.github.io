import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

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

// ── Partículas no hero ────────────────────────────────────────────────────────
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

  for (var i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
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
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.08 * (1 - dist/100)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
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

// ── Galeria do Firestore ──────────────────────────────────────────────────────
(async function() {
  var grid = document.getElementById('galeriaGrid');
  if (!grid) return;

  try {
    var snap = await getDocs(collection(db, 'galeria'));
    var galeria = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (!galeria.length) return;

    grid.innerHTML = '';
    galeria.forEach(function(item) {
      var el = document.createElement('div');
      el.className   = 'galeria-item' + (item.tipo === 'video' ? ' galeria-video' : '');
      el.style.cssText = 'cursor:default;position:relative;overflow:hidden;';

      if (item.tipo === 'video') {
        el.innerHTML =
          '<iframe src="https://www.youtube.com/embed/' + item.videoId + '" ' +
          'style="position:absolute;inset:0;width:100%;height:100%;border:0;" ' +
          'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
          'allowfullscreen loading="lazy"></iframe>';
      } else {
        el.innerHTML =
          '<img src="' + item.url + '" alt="' + (item.legenda || 'Galeria IBBNPVH') + '" ' +
          'style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s ease;" ' +
          'loading="lazy" onerror="this.parentElement.style.display=\'none\'">' +
          (item.legenda
            ? '<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(13,26,74,0.8));padding:1.5rem 1rem .8rem;">' +
              '<span style="font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,0.8);font-family:\'Jost\',sans-serif;">' + item.legenda + '</span>' +
              '</div>'
            : '');
      }
      grid.appendChild(el);
    });
  } catch(err) {
    console.error('Erro ao carregar galeria:', err);
  }
})();
