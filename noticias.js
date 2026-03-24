import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getFirestore, collection, getDocs, orderBy, query } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

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

// ── Categorias ────────────────────────────────────────────────────────────────
var CATS = {
  culto:    { label: 'Culto',    cls: 'tag-culto'    },
  evento:   { label: 'Evento',   cls: 'tag-evento'   },
  mensagem: { label: 'Mensagem', cls: 'tag-mensagem' },
  missoes:  { label: 'Missões',  cls: 'tag-missoes'  }
};

var noticiasMap = {};


function fmtData(iso) {
  if (!iso) return '';
  var p = iso.split('-');
  return p.length === 3 ? p[2]+'/'+p[1]+'/'+p[0] : iso;
}

// ── Modal ─────────────────────────────────────────────────────────────────────
var lightboxImagens = [];
var lightboxIdx = 0;

function criarModal() {
  if (document.getElementById('noticiaModalOverlay')) return;
  var overlay = document.createElement('div');
  overlay.className = 'noticia-modal-overlay';
  overlay.id = 'noticiaModalOverlay';
  overlay.innerHTML =
    '<div class="noticia-modal" role="dialog" aria-modal="true">' +
      '<button class="noticia-modal-close" aria-label="Fechar">&#x2715;</button>' +
      '<div class="noticia-modal-img" id="noticiaModalImg"></div>' +
      '<div class="noticia-modal-body">' +
        '<div class="noticia-tag-wrapper" id="noticiaModalMeta"></div>' +
        '<h2 class="noticia-modal-titulo" id="noticiaModalTitulo"></h2>' +
        '<div class="noticia-modal-texto" id="noticiaModalTexto"></div>' +
        '<div class="noticia-modal-galeria" id="noticiaModalGaleria" style="display:none;"></div>' +
      '</div>' +
    '</div>';
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) fecharModal();
  });
  overlay.querySelector('.noticia-modal-close').addEventListener('click', fecharModal);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var lb = document.getElementById('noticiaLightbox');
      if (lb && lb.classList.contains('aberto')) { fecharLightbox(); return; }
      fecharModal();
    }
  });
  document.body.appendChild(overlay);

  // Lightbox
  var lb = document.createElement('div');
  lb.id = 'noticiaLightbox';
  lb.className = 'noticia-lightbox';
  lb.innerHTML =
    '<button class="lb-close" aria-label="Fechar">&#x2715;</button>' +
    '<button class="lb-prev" aria-label="Anterior">&#8592;</button>' +
    '<img class="lb-img" id="lbImg" src="" alt="">' +
    '<button class="lb-next" aria-label="Próxima">&#8594;</button>' +
    '<span class="lb-counter" id="lbCounter"></span>';
  lb.querySelector('.lb-close').addEventListener('click', fecharLightbox);
  lb.querySelector('.lb-prev').addEventListener('click', function() { navegarLightbox(-1); });
  lb.querySelector('.lb-next').addEventListener('click', function() { navegarLightbox(1); });
  lb.addEventListener('click', function(e) { if (e.target === lb) fecharLightbox(); });
  document.body.appendChild(lb);
}

window.abrirLightbox = function(idx) {
  lightboxIdx = idx;
  var lb = document.getElementById('noticiaLightbox');
  document.getElementById('lbImg').src = lightboxImagens[idx];
  document.getElementById('lbCounter').textContent = (idx + 1) + ' / ' + lightboxImagens.length;
  lb.querySelector('.lb-prev').style.display = lightboxImagens.length > 1 ? '' : 'none';
  lb.querySelector('.lb-next').style.display = lightboxImagens.length > 1 ? '' : 'none';
  lb.classList.add('aberto');
};

function fecharLightbox() {
  var lb = document.getElementById('noticiaLightbox');
  if (lb) lb.classList.remove('aberto');
}

function navegarLightbox(dir) {
  lightboxIdx = (lightboxIdx + dir + lightboxImagens.length) % lightboxImagens.length;
  document.getElementById('lbImg').src = lightboxImagens[lightboxIdx];
  document.getElementById('lbCounter').textContent = (lightboxIdx + 1) + ' / ' + lightboxImagens.length;
}

function abrirModal(n) {
  var overlay = document.getElementById('noticiaModalOverlay');
  if (!overlay) return;
  var cat      = CATS[n.categoria] || { label: n.categoria || '', cls: '' };
  var catClass = 'cat-' + (n.categoria || 'culto');

  var imgEl = document.getElementById('noticiaModalImg');
  imgEl.className = 'noticia-modal-img ' + catClass;
  if (n.imagem) {
    imgEl.innerHTML =
      '<img src="' + n.imagem + '" alt="' + n.titulo + '">' +
      '<div class="noticia-img-overlay"></div>';
  } else {
    imgEl.innerHTML =
      '<div class="noticia-modal-img-placeholder">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">' +
          '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/>' +
          '<path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>' +
          '<line x1="6" y1="1" x2="6" y2="4"/>' +
          '<line x1="10" y1="1" x2="10" y2="4"/>' +
          '<line x1="14" y1="1" x2="14" y2="4"/>' +
        '</svg>' +
      '</div>';
  }

  document.getElementById('noticiaModalMeta').innerHTML =
    '<span class="noticia-tag ' + cat.cls + '">' + cat.label + '</span>' +
    (n.data ? '<span class="noticia-data">' + fmtData(n.data) + '</span>' : '');

  document.getElementById('noticiaModalTitulo').textContent = n.titulo;
  document.getElementById('noticiaModalTexto').innerHTML    = n.resumo;

  var galeriaEl = document.getElementById('noticiaModalGaleria');
  lightboxImagens = Array.isArray(n.imagens) ? n.imagens : [];
  if (lightboxImagens.length) {
    galeriaEl.innerHTML =
      '<p class="galeria-titulo">Fotos</p>' +
      '<div class="galeria-grid">' +
        lightboxImagens.map(function(url, i) {
          return '<button class="modal-foto-thumb" onclick="abrirLightbox(' + i + ')">' +
                   '<img src="' + url + '" loading="lazy" alt="Foto ' + (i + 1) + '">' +
                 '</button>';
        }).join('') +
      '</div>';
    galeriaEl.style.display = 'block';
  } else {
    galeriaEl.style.display = 'none';
  }

  overlay.querySelector('.noticia-modal').scrollTop = 0;
  overlay.classList.add('aberto');
  document.body.style.overflow = 'hidden';
}

function fecharModal() {
  var overlay = document.getElementById('noticiaModalOverlay');
  if (overlay) overlay.classList.remove('aberto');
  document.body.style.overflow = '';
}

// ── Render ─────────────────────────────────────────────────────────────────────
async function renderNoticias() {
  var grid    = document.getElementById('noticiasGrid');
  var empty   = document.getElementById('emptyState');
  var filtros = document.querySelector('.noticias-filtros');

  try {
    var snap = await getDocs(query(collection(db, 'noticias'), orderBy('data', 'desc')));
    var noticias = snap.docs
      .map(function(d) { return Object.assign({ id: d.id }, d.data()); })
      .filter(function(n) { return n.status === 'publicada'; });

    if (!noticias.length) {
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    if (filtros) filtros.style.display = 'flex';

    noticias.forEach(function(n, i) {
      var cat  = CATS[n.categoria] || { label: n.categoria || '', cls: '' };
      var card = document.createElement('article');
      card.className        = 'noticia-card reveal' + (i === 0 ? ' destaque' : '');
      card.dataset.categoria = n.categoria || '';
      card.dataset.nid = n.id;
      noticiasMap[n.id] = n;

      var catClass = 'cat-' + (n.categoria || 'culto');

      var temFotos = Array.isArray(n.imagens) && n.imagens.length > 0;
      var badgeHtml = temFotos
        ? '<span class="card-fotos-badge">' +
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>' +
            ' ' + n.imagens.length +
          '</span>'
        : '';

      var imgHtml = n.imagem
        ? '<div class="noticia-img ' + catClass + '">' +
            '<img src="' + n.imagem + '" alt="' + n.titulo + '" loading="lazy" onerror="this.parentElement.classList.add(\'no-img\')">' +
            '<div class="noticia-img-overlay"></div>' +
            badgeHtml +
          '</div>'
        : '<div class="noticia-img ' + catClass + '">' +
            '<div class="noticia-img-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg></div>' +
            badgeHtml +
          '</div>';

      card.innerHTML = imgHtml +
        '<div class="noticia-body">' +
          '<div class="noticia-tag-wrapper">' +
            '<span class="noticia-tag ' + cat.cls + '">' + cat.label + '</span>' +
            (n.data ? '<span class="noticia-data">' + fmtData(n.data) + '</span>' : '') +
          '</div>' +
          '<h2 class="noticia-titulo">' + n.titulo + '</h2>' +
          '<div class="noticia-resumo">' + n.resumo + '</div>' +
          '<button class="noticia-ler"><span>Ver mais</span>' +
            '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' +
          '</button>' +
        '</div>';

      grid.insertBefore(card, empty);
    });

    // Abre modal ao clicar em "Ler mais"
    criarModal();
    grid.addEventListener('click', function(e) {
      var btn = e.target.closest('.noticia-ler');
      if (!btn) return;
      var card = btn.closest('.noticia-card');
      var id   = card && card.dataset.nid;
      if (id && noticiasMap[id]) abrirModal(noticiasMap[id]);
    });

    // Ativa o reveal nas cards recém-criadas
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.noticia-card.reveal').forEach(function(r) { obs.observe(r); });

  } catch (err) {
    console.error('Erro ao carregar notícias:', err);
    empty.style.display = 'block';
  }
}

renderNoticias();

// Reveal nos elementos estáticos
var obsStatic = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(function(r) { obsStatic.observe(r); });

// ── Filtro (exposto globalmente pois o HTML usa onclick) ──────────────────────
window.filtrar = function(cat, btn) {
  document.querySelectorAll('.filtro-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  var cards    = document.querySelectorAll('.noticia-card');
  var visiveis = 0;
  cards.forEach(function(c) {
    if (cat === 'todos' || c.dataset.categoria === cat) {
      c.style.display = ''; visiveis++;
    } else {
      c.style.display = 'none';
    }
  });
  document.getElementById('emptyState').style.display = visiveis === 0 ? 'block' : 'none';
};

// ── Cookies ───────────────────────────────────────────────────────────────────
(function() {
  var consent = localStorage.getItem('cookie_consent');
  if (!consent) document.getElementById('cookie-banner').style.display = 'flex';
  else if (consent === 'accepted') gtag('consent', 'update', { analytics_storage: 'granted' });
})();

window.aceitarCookies = function() {
  localStorage.setItem('cookie_consent', 'accepted');
  gtag('consent', 'update', { analytics_storage: 'granted' });
  document.getElementById('cookie-banner').style.display = 'none';
};

window.rejeitarCookies = function() {
  localStorage.setItem('cookie_consent', 'rejected');
  document.getElementById('cookie-banner').style.display = 'none';
};

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

// ── Partículas no hero ───────────────────────────────────────────────────────
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

  for (var i = 0; i < 50; i++) {
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

// ── Back to top ──────────────────────────────────────────────────────────────
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
