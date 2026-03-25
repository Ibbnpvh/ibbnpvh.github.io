import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getFirestore, collection, getDocs, orderBy, query } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

// ── Firebase ──────────────────────────────────────────────────────────────────
var firebaseConfig = {
  apiKey:            'AIzaSyChJNokBlnAuUR5K6vVnI8QL03NCG-_7eA',
  authDomain:        'site-ibbnpvh.firebaseapp.com',
  projectId:         'site-ibbnpvh',
  storageBucket:     'site-ibbnpvh.firebasestorage.app',
  messagingSenderId: '462547977634',
  appId:             '1:462547977634:web:f70734bd274c0a8dbe9efb'
};
var app = initializeApp(firebaseConfig);
var db  = getFirestore(app);

// ── Estado ────────────────────────────────────────────────────────────────────
var todosItens = [];          // todos os docs do Firestore
var albumAtual = [];          // itens do álbum aberto
var lbIdx = 0;                // índice atual no lightbox
var lbItens = [];             // itens navegáveis no lightbox

// ── Utilitário ────────────────────────────────────────────────────────────────
function fmtContagem(n) {
  return n === 1 ? '1 item' : n + ' itens';
}

// ── Partículas no hero ────────────────────────────────────────────────────────
(function() {
  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var particles = [];
  var W, H;
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
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
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.06 * (1 - dist / 100)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── Hamburger menu ────────────────────────────────────────────────────────────
(function() {
  var toggle = document.getElementById('navToggle');
  var links  = document.getElementById('navLinks');
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

// ── Back to top ───────────────────────────────────────────────────────────────
(function() {
  var btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', function() {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();

// ── Cookie banner ─────────────────────────────────────────────────────────────
(function() {
  var banner = document.getElementById('cookie-banner');
  if (!banner) return;
  if (localStorage.getItem('cookieChoice')) return;
  setTimeout(function() { banner.style.display = 'flex'; }, 1500);
})();
window.aceitarCookies = function() {
  localStorage.setItem('cookieChoice', 'accepted');
  document.getElementById('cookie-banner').style.display = 'none';
};
window.rejeitarCookies = function() {
  localStorage.setItem('cookieChoice', 'rejected');
  document.getElementById('cookie-banner').style.display = 'none';
};

// ── Nav scroll shrink ─────────────────────────────────────────────────────────
(function() {
  var nav = document.querySelector('nav');
  var shrunk = false;
  window.addEventListener('scroll', function() {
    var y = window.scrollY;
    if (y > 80 && !shrunk) { nav.classList.add('scrolled'); shrunk = true; }
    else if (y <= 80 && shrunk) { nav.classList.remove('scrolled'); shrunk = false; }
  }, { passive: true });
})();

// ── Lightbox ──────────────────────────────────────────────────────────────────
var lb = document.getElementById('galeriaLightbox');
var lbContent = document.getElementById('lbContent');
var lbCounter = document.getElementById('lbCounter');
var lbPrev    = document.getElementById('lbPrev');
var lbNext    = document.getElementById('lbNext');

document.getElementById('lbClose').addEventListener('click', fecharLightbox);
lbPrev.addEventListener('click', function() { navegarLb(-1); });
lbNext.addEventListener('click', function() { navegarLb(1); });
lb.addEventListener('click', function(e) { if (e.target === lb) fecharLightbox(); });
document.addEventListener('keydown', function(e) {
  if (!lb.classList.contains('aberto')) return;
  if (e.key === 'Escape')     fecharLightbox();
  if (e.key === 'ArrowLeft')  navegarLb(-1);
  if (e.key === 'ArrowRight') navegarLb(1);
});

function abrirLightbox(idx) {
  lbIdx = idx;
  renderLbItem();
  lb.classList.add('aberto');
  document.body.style.overflow = 'hidden';
}

function fecharLightbox() {
  lb.classList.remove('aberto');
  document.body.style.overflow = '';
  lbContent.innerHTML = '';
}

function navegarLb(dir) {
  lbIdx = (lbIdx + dir + lbItens.length) % lbItens.length;
  renderLbItem();
}

function renderLbItem() {
  var item = lbItens[lbIdx];
  lbCounter.textContent = (lbIdx + 1) + ' / ' + lbItens.length;
  lbPrev.style.display = lbItens.length > 1 ? '' : 'none';
  lbNext.style.display = lbItens.length > 1 ? '' : 'none';
  if (item.tipo === 'video') {
    lbContent.innerHTML =
      '<iframe src="https://www.youtube.com/embed/' + item.videoId + '?autoplay=1" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
      'allowfullscreen></iframe>';
  } else {
    lbContent.innerHTML = '<img src="' + item.url + '" alt="' + (item.legenda || 'Foto IBBNPVH') + '">';
  }
}

// ── Views ─────────────────────────────────────────────────────────────────────
function mostrarViewAlbuns() {
  document.getElementById('view-albuns').style.display = '';
  document.getElementById('view-album').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarViewAlbum() {
  document.getElementById('view-albuns').style.display = 'none';
  document.getElementById('view-album').style.display = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.voltarAlbuns = function() {
  mostrarViewAlbuns();
};

// ── Agrupar itens por álbum ───────────────────────────────────────────────────
function agruparPorAlbum(itens) {
  var mapa = {};
  itens.forEach(function(item) {
    var nome = item.album || 'Geral';
    if (!mapa[nome]) mapa[nome] = [];
    mapa[nome].push(item);
  });
  // Ordenar álbuns: primeiro pela data mais recente de qualquer item do álbum
  var nomes = Object.keys(mapa).sort(function(a, b) {
    var dA = mapa[a].reduce(function(max, x) { return x.data > max ? x.data : max; }, '');
    var dB = mapa[b].reduce(function(max, x) { return x.data > max ? x.data : max; }, '');
    return dB > dA ? 1 : dB < dA ? -1 : 0;
  });
  return nomes.map(function(nome) {
    return { nome: nome, itens: mapa[nome] };
  });
}

// ── Render álbuns ─────────────────────────────────────────────────────────────
function renderAlbuns(albuns) {
  var grid  = document.getElementById('albuns-grid');
  var empty = document.getElementById('albuns-empty');

  if (!albuns.length) {
    grid.style.display  = 'none';
    empty.style.display = '';
    return;
  }
  grid.style.display  = '';
  empty.style.display = 'none';

  grid.innerHTML = albuns.map(function(album, idx) {
    var capa = album.itens.find(function(x) { return x.tipo === 'foto' && x.url; });
    var capaVideo = !capa && album.itens.find(function(x) { return x.tipo === 'video' && x.videoId; });
    var capaHtml;

    if (capa) {
      capaHtml = '<img class="album-capa-img" src="' + capa.url + '" alt="' + album.nome + '" loading="lazy">';
    } else if (capaVideo) {
      capaHtml = '<img class="album-capa-img" src="https://img.youtube.com/vi/' + capaVideo.videoId + '/mqdefault.jpg" alt="' + album.nome + '" loading="lazy">';
    } else {
      capaHtml = '<div class="album-sem-capa"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>';
    }

    var fotos  = album.itens.filter(function(x) { return x.tipo === 'foto'; }).length;
    var videos = album.itens.filter(function(x) { return x.tipo === 'video'; }).length;
    var meta = [];
    if (fotos)  meta.push(fotos  + ' foto' + (fotos  > 1 ? 's' : ''));
    if (videos) meta.push(videos + ' vídeo' + (videos > 1 ? 's' : ''));

    return '<div class="album-card" data-album-idx="' + idx + '">' +
      '<div class="album-capa">' +
        capaHtml +
        '<div class="album-overlay"><div class="album-overlay-icon">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' +
        '</div></div>' +
      '</div>' +
      '<div class="album-info">' +
        '<p class="album-nome">' + album.nome + '</p>' +
        '<span class="album-meta">' + meta.join('<span class="album-meta-dot"> · </span>') + '</span>' +
      '</div>' +
    '</div>';
  }).join('');

  // Card "Mais fotos em breve" — dentro do grid, ao lado dos álbuns
  if (albuns.length < 2) {
    grid.innerHTML += '<div class="mais-breve">' +
      '<div class="mais-breve-inner">' +
        '<span class="mais-breve-icon" aria-hidden="true">✦</span>' +
        '<p class="mais-breve-titulo">Mais fotos em breve</p>' +
        '<p class="mais-breve-sub">Novos registros de cultos, eventos e ministérios serão adicionados em breve.</p>' +
      '</div>' +
    '</div>';
  }

  // Eventos de clique nos cards
  grid.querySelectorAll('.album-card').forEach(function(card) {
    card.addEventListener('click', function() {
      var idx = parseInt(card.dataset.albumIdx, 10);
      abrirAlbum(albuns[idx]);
    });
  });
}

// ── Abrir álbum ───────────────────────────────────────────────────────────────
function abrirAlbum(album) {
  albumAtual = album.itens;
  lbItens = albumAtual;

  document.getElementById('albumTitulo').textContent = album.nome;
  document.getElementById('albumContagem').textContent = fmtContagem(album.itens.length);

  var grid = document.getElementById('album-grid');
  grid.innerHTML = album.itens.map(function(item, idx) {
    if (item.tipo === 'video') {
      var thumb = 'https://img.youtube.com/vi/' + item.videoId + '/mqdefault.jpg';
      return '<div class="album-item" data-lb-idx="' + idx + '">' +
        '<div class="album-item-video">' +
          '<img src="' + thumb + '" alt="' + (item.legenda || 'Vídeo') + '" loading="lazy">' +
        '</div>' +
        '<div class="album-play">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
        '</div>' +
        (item.legenda ? '<div class="album-item-legenda">' + item.legenda + '</div>' : '') +
      '</div>';
    } else {
      return '<div class="album-item" data-lb-idx="' + idx + '">' +
        '<img src="' + item.url + '" alt="' + (item.legenda || 'Foto') + '" loading="lazy" onerror="this.parentElement.style.display=\'none\'">' +
        (item.legenda ? '<div class="album-item-legenda">' + item.legenda + '</div>' : '') +
      '</div>';
    }
  }).join('');

  grid.querySelectorAll('.album-item').forEach(function(el) {
    el.addEventListener('click', function() {
      abrirLightbox(parseInt(el.dataset.lbIdx, 10));
    });
  });

  mostrarViewAlbum();
}

// ── Carregar galeria do Firestore ─────────────────────────────────────────────
async function carregarGaleria() {
  try {
    var snap = await getDocs(query(collection(db, 'galeria'), orderBy('data', 'desc')));
    todosItens = snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
  } catch(e) {
    // Se campo data não existir ainda (docs antigos sem o campo), busca sem ordenação
    try {
      var snap2 = await getDocs(collection(db, 'galeria'));
      todosItens = snap2.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
    } catch(e2) {
      console.error('Erro ao carregar galeria:', e2);
      return;
    }
  }

  var albuns = agruparPorAlbum(todosItens);
  renderAlbuns(albuns);
}

carregarGaleria();
