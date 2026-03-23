// ── Lógica extraída de main.js ────────────────────────────────────────────────

function buildOracaoMsg(nome, tipo, pedido) {
  return (
    '🙏 *Pedido de Oração*\n\n' +
    (nome ? `*Nome:* ${nome}\n` : '') +
    (tipo ? `*Área:* ${tipo}\n` : '') +
    `\n*Pedido:*\n${pedido}`
  );
}

function buildWhatsappURL(numero, nome, tipo, pedido) {
  const msg = buildOracaoMsg(nome, tipo, pedido);
  return `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
}

function validarOracao(pedido) {
  return !!(pedido && pedido.trim().length > 0);
}

// ── Lógica de cookies (compartilhada entre main.js, noticias.js, sou-novo.js)

const COOKIE_KEY = 'cookie_consent';

function getConsentStatus() {
  return localStorage.getItem(COOKIE_KEY);
}

function aceitarCookies() {
  localStorage.setItem(COOKIE_KEY, 'accepted');
}

function rejeitarCookies() {
  localStorage.setItem(COOKIE_KEY, 'rejected');
}

function deveExibirBanner() {
  return !localStorage.getItem(COOKIE_KEY);
}

// ── Testes: Formulário de Oração ──────────────────────────────────────────────

describe('validarOracao', () => {
  it('retorna true para pedido válido', () => {
    expect(validarOracao('Por favor, ore por mim.')).toBe(true);
  });

  it('retorna false para pedido vazio', () => {
    expect(validarOracao('')).toBe(false);
  });

  it('retorna false para pedido só com espaços', () => {
    expect(validarOracao('   ')).toBe(false);
  });

  it('retorna false para null/undefined', () => {
    expect(validarOracao(null)).toBe(false);
    expect(validarOracao(undefined)).toBe(false);
  });
});

describe('buildOracaoMsg', () => {
  it('inclui nome quando fornecido', () => {
    const msg = buildOracaoMsg('João', '', 'Ore por mim');
    expect(msg).toContain('*Nome:* João');
  });

  it('omite linha de nome quando não fornecido', () => {
    const msg = buildOracaoMsg('', '', 'Ore por mim');
    expect(msg).not.toContain('*Nome:*');
  });

  it('inclui área quando fornecida', () => {
    const msg = buildOracaoMsg('', 'Saúde', 'Ore por mim');
    expect(msg).toContain('*Área:* Saúde');
  });

  it('omite linha de área quando não fornecida', () => {
    const msg = buildOracaoMsg('', '', 'Ore por mim');
    expect(msg).not.toContain('*Área:*');
  });

  it('sempre inclui o pedido', () => {
    const msg = buildOracaoMsg('', '', 'Por favor, ore pela família.');
    expect(msg).toContain('Por favor, ore pela família.');
  });

  it('inclui cabeçalho fixo com emoji', () => {
    const msg = buildOracaoMsg('', '', 'Pedido');
    expect(msg).toContain('🙏 *Pedido de Oração*');
  });

  it('mensagem com todos os campos preenchidos tem estrutura correta', () => {
    const msg = buildOracaoMsg('Maria', 'Família', 'Ore pela minha família.');
    expect(msg).toContain('*Nome:* Maria');
    expect(msg).toContain('*Área:* Família');
    expect(msg).toContain('Ore pela minha família.');
  });
});

describe('buildWhatsappURL', () => {
  it('gera URL com número correto', () => {
    const url = buildWhatsappURL('5569999999999', '', '', 'Ore por mim');
    expect(url).toMatch(/^https:\/\/wa\.me\/5569999999999\?text=/);
  });

  it('codifica caracteres especiais na URL', () => {
    const url = buildWhatsappURL('5569999999999', '', '', 'Oração & fé');
    expect(url).not.toContain('&fé');
    expect(url).toContain(encodeURIComponent('Oração & fé'));
  });

  it('URL inclui a mensagem encodada', () => {
    const url = buildWhatsappURL('5569999999999', 'Ana', 'Saúde', 'Ore por minha saúde');
    const decoded = decodeURIComponent(url.split('?text=')[1]);
    expect(decoded).toContain('*Nome:* Ana');
    expect(decoded).toContain('*Área:* Saúde');
    expect(decoded).toContain('Ore por minha saúde');
  });
});

// ── Testes: Gerenciamento de Cookies ─────────────────────────────────────────

describe('gerenciamento de cookies', () => {
  beforeEach(() => localStorage.clear());

  it('banner deve ser exibido quando não há consentimento', () => {
    expect(deveExibirBanner()).toBe(true);
  });

  it('banner não deve ser exibido após aceitar', () => {
    aceitarCookies();
    expect(deveExibirBanner()).toBe(false);
  });

  it('banner não deve ser exibido após rejeitar', () => {
    rejeitarCookies();
    expect(deveExibirBanner()).toBe(false);
  });

  it('aceitarCookies salva "accepted" no localStorage', () => {
    aceitarCookies();
    expect(getConsentStatus()).toBe('accepted');
  });

  it('rejeitarCookies salva "rejected" no localStorage', () => {
    rejeitarCookies();
    expect(getConsentStatus()).toBe('rejected');
  });

  it('consentimento persiste após segunda chamada', () => {
    aceitarCookies();
    rejeitarCookies(); // usuário muda de ideia
    expect(getConsentStatus()).toBe('rejected');
  });
});

// ── Testes: DOM do banner de cookies ─────────────────────────────────────────

describe('cookie banner — comportamento visual', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `<div id="cookie-banner" style="display:none;"></div>`;
  });

  function initBanner() {
    const banner = document.getElementById('cookie-banner');
    if (!localStorage.getItem(COOKIE_KEY)) {
      banner.style.display = 'flex';
    }
  }

  function aceitarDOM() {
    aceitarCookies();
    document.getElementById('cookie-banner').style.display = 'none';
  }

  function rejeitarDOM() {
    rejeitarCookies();
    document.getElementById('cookie-banner').style.display = 'none';
  }

  it('exibe o banner quando não há consentimento', () => {
    initBanner();
    expect(document.getElementById('cookie-banner').style.display).toBe('flex');
  });

  it('esconde o banner após aceitar', () => {
    initBanner();
    aceitarDOM();
    expect(document.getElementById('cookie-banner').style.display).toBe('none');
  });

  it('esconde o banner após rejeitar', () => {
    initBanner();
    rejeitarDOM();
    expect(document.getElementById('cookie-banner').style.display).toBe('none');
  });

  it('não exibe o banner se já houver consentimento', () => {
    aceitarCookies();
    initBanner();
    expect(document.getElementById('cookie-banner').style.display).toBe('none');
  });
});
