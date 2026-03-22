  // ── CMS: Renderizar Notícias do localStorage ──
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

  function renderNoticias() {
    var raw = localStorage.getItem('ibbnpvh_cms');
    var noticias = [];
    try { noticias = (JSON.parse(raw) || {}).noticias || []; } catch(e) {}

    noticias = noticias
      .filter(function(n) { return n.status === 'publicada'; })
      .sort(function(a, b) { return (b.data || '').localeCompare(a.data || ''); });

    var grid    = document.getElementById('noticiasGrid');
    var empty   = document.getElementById('emptyState');
    var filtros = document.querySelector('.noticias-filtros');

    if (!noticias.length) {
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    if (filtros) filtros.style.display = 'flex';

    noticias.forEach(function(n, i) {
      var cat     = CATS[n.categoria] || { label: n.categoria || '', cls: '' };
      var card    = document.createElement('article');
      card.className = 'noticia-card reveal' + (i === 0 ? ' destaque' : '');
      card.dataset.categoria = n.categoria || '';

      var imgHtml = n.imagem
        ? '<div class="noticia-img"><img src="' + n.imagem + '" alt="' + n.titulo + '" loading="lazy" onerror="this.parentElement.style.display=\'none\'"></div>'
        : '';

      card.innerHTML = imgHtml +
        '<div class="noticia-body">' +
          '<div class="noticia-meta">' +
            '<span class="noticia-tag ' + cat.cls + '">' + cat.label + '</span>' +
            (n.data ? '<span class="noticia-data">' + fmtData(n.data) + '</span>' : '') +
          '</div>' +
          '<h2 class="noticia-titulo">' + n.titulo + '</h2>' +
          '<p class="noticia-resumo">' + n.resumo + '</p>' +
        '</div>';

      grid.insertBefore(card, empty);
    });
  }

  renderNoticias();

  // Reveal
  var reveals = document.querySelectorAll('.reveal');
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  reveals.forEach(function(r) { obs.observe(r); });

  // Filtro
  function filtrar(cat, btn) {
    document.querySelectorAll('.filtro-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    var cards = document.querySelectorAll('.noticia-card');
    var visiveis = 0;
    cards.forEach(function(c) {
      if (cat === 'todos' || c.dataset.categoria === cat) {
        c.style.display = ''; visiveis++;
      } else {
        c.style.display = 'none';
      }
    });
    document.getElementById('emptyState').style.display = visiveis === 0 ? 'block' : 'none';
  }

  // Cookies
  (function() {
    var consent = localStorage.getItem('cookie_consent');
    if (!consent) document.getElementById('cookie-banner').style.display = 'flex';
    else if (consent === 'accepted') gtag('consent', 'update', { analytics_storage: 'granted' });
  })();
  function aceitarCookies() {
    localStorage.setItem('cookie_consent', 'accepted');
    gtag('consent', 'update', { analytics_storage: 'granted' });
    document.getElementById('cookie-banner').style.display = 'none';
  }
  function rejeitarCookies() {
    localStorage.setItem('cookie_consent', 'rejected');
    document.getElementById('cookie-banner').style.display = 'none';
  }
