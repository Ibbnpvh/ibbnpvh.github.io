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

  function aceitarCookies() {
    localStorage.setItem('cookie_consent', 'accepted');
    gtag('consent', 'update', { analytics_storage: 'granted' });
    document.getElementById('cookie-banner').style.display = 'none';
  }
  function rejeitarCookies() {
    localStorage.setItem('cookie_consent', 'rejected');
    gtag('consent', 'update', { analytics_storage: 'denied' });
    document.getElementById('cookie-banner').style.display = 'none';
  }

  // Menu sempre visível — sem lógica mobile necessária
