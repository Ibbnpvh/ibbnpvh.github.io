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


function fmtData(iso) {
  if (!iso) return '';
  var p = iso.split('-');
  return p.length === 3 ? p[2]+'/'+p[1]+'/'+p[0] : iso;
}

// ── Render ────────────────────────────────────────────────────────────────────
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

      var catClass = 'cat-' + (n.categoria || 'culto');

      var imgHtml = n.imagem
        ? '<div class="noticia-img ' + catClass + '">' +
            '<img src="' + n.imagem + '" alt="' + n.titulo + '" loading="lazy" onerror="this.parentElement.classList.add(\'no-img\')">' +
            '<div class="noticia-img-overlay"></div>' +
          '</div>'
        : '<div class="noticia-img ' + catClass + '">' +
            '<div class="noticia-img-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg></div>' +
          '</div>';

      card.innerHTML = imgHtml +
        '<div class="noticia-body">' +
          '<div class="noticia-tag-wrapper">' +
            '<span class="noticia-tag ' + cat.cls + '">' + cat.label + '</span>' +
            (n.data ? '<span class="noticia-data">' + fmtData(n.data) + '</span>' : '') +
          '</div>' +
          '<h2 class="noticia-titulo">' + n.titulo + '</h2>' +
          '<div class="noticia-resumo">' + n.resumo + '</div>' +
          '<button class="noticia-ler"><span>Ler mais</span>' +
            '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' +
          '</button>' +
        '</div>';

      grid.insertBefore(card, empty);
    });

    // Expand/colapso inline ao clicar em "Ler mais"
    grid.addEventListener('click', function(e) {
      var btn = e.target.closest('.noticia-ler');
      if (!btn) return;
      var resumo = btn.previousElementSibling;
      var aberto = resumo.classList.toggle('expandido');
      btn.classList.toggle('aberto', aberto);
      var span = btn.querySelector('span');
      if (span) span.textContent = aberto ? 'Ver menos' : 'Ler mais';
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
