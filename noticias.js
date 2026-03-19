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
