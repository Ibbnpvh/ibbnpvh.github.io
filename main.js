  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  reveals.forEach(r => obs.observe(r));


  // Formulário de oração
  function enviarOracao() {
    const nome = document.getElementById('oracaoNome').value;
    const tipo = document.getElementById('oracaoTipo').value;
    const pedido = document.getElementById('oracaoPedido').value.trim();

    if (!pedido) {
      alert('Por favor, escreva seu pedido de oração.');
      return;
    }

    // Montar mensagem para WhatsApp
    const numero = '5569XXXXXXXXX'; // ✏️ Substitua pelo número real
    const msg = encodeURIComponent(
      '🙏 *Pedido de Oração*\n\n' +
      (nome ? `*Nome:* ${nome}\n` : '') +
      (tipo ? `*Área:* ${tipo}\n` : '') +
      `\n*Pedido:*\n${pedido}`
    );

    // Abrir WhatsApp
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');

    // Mostrar mensagem de sucesso
    document.getElementById('oracaoForm').style.display = 'none';
    document.getElementById('oracaoSucesso').style.display = 'block';
  }

  // Mobile nav

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

  // ── PARTÍCULAS NO HERO ──
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

    // Criar partículas
    for (var i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.1,
        gold: Math.random() > 0.7
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(function(p) {
        // Mover
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        // Desenhar partícula
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? 'rgba(255,191,0,' + p.alpha + ')'
          : 'rgba(255,255,255,' + p.alpha + ')';
        ctx.fill();
      });

      // Linhas de conexão entre partículas próximas
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

  // ── CONTADOR ANIMADO ──
  // Atributos suportados:
  //   data-target   (obrigatório) — valor final
  //   data-start    — valor inicial (padrão: 0)
  //   data-prefix   — texto antes do número (ex: "+", "R$")
  //   data-suffix   — texto depois do número (ex: "%", "k", " anos")
  //   data-duration — duração em ms (padrão: 2000)
  //   data-thousands — "true" para separador de milhar (padrão: false)
  function animateCounter(el) {
    var target   = parseInt(el.getAttribute('data-target'), 10);
    var startVal = Math.max(0, parseInt(el.getAttribute('data-start') || '0', 10));
    var prefix   = el.getAttribute('data-prefix')   || '';
    var suffix   = el.getAttribute('data-suffix')   || '';
    var duration = Math.max(200, parseInt(el.getAttribute('data-duration') || '2000', 10));
    var thousands = el.getAttribute('data-thousands') === 'true';

    if (isNaN(target)) return;

    function format(n) {
      if (thousands) return n.toLocaleString('pt-BR');
      return String(n);
    }

    var tsStart = null;

    function step(timestamp) {
      if (!tsStart) tsStart = timestamp;
      var elapsed  = timestamp - tsStart;
      var progress = Math.min(elapsed / duration, 1);
      // Easing cúbico — desacelera no final
      var ease    = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(startVal + (target - startVal) * ease);
      el.textContent = prefix + format(current) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + format(target) + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  // Disparar quando a seção Sobre entrar na tela
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
