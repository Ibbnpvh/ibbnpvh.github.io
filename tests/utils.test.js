// ── Funções extraídas de noticias.js e admin-4.html ──────────────────────────

function fmtData(iso) {
  if (!iso) return '';
  var p = iso.split('-');
  return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
}

// Extraída de admin-4.html (formatDate)
function formatDate(iso) {
  if (!iso) return '—';
  var p = iso.split('-');
  return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
}

// Extraída de admin-4.html (catBadge)
const BADGE_MAP = {
  culto:    'badge-culto',
  evento:   'badge-evento',
  mensagem: 'badge-mensagem',
  missoes:  'badge-missoes',
};
function catBadge(cat) {
  return BADGE_MAP[cat] || 'badge-gray';
}

// Extraída de main.js (lógica de easing do animateCounter)
function cubicEaseOut(progress) {
  return 1 - Math.pow(1 - progress, 3);
}

function computeCounter(target, start, progress) {
  var ease = cubicEaseOut(Math.min(progress, 1));
  return Math.floor(start + (target - start) * ease);
}

// ── Testes ───────────────────────────────────────────────────────────────────

describe('fmtData (noticias.js)', () => {
  it('formata data ISO corretamente', () => {
    expect(fmtData('2026-03-22')).toBe('22/03/2026');
  });

  it('formata data com mês e dia de um dígito', () => {
    expect(fmtData('1993-01-05')).toBe('05/01/1993');
  });

  it('retorna string vazia para entrada vazia', () => {
    expect(fmtData('')).toBe('');
  });

  it('retorna a entrada original se não estiver no formato ISO', () => {
    expect(fmtData('invalido')).toBe('invalido');
    expect(fmtData('22/03/2026')).toBe('22/03/2026');
  });

  it('retorna string vazia para null/undefined', () => {
    expect(fmtData(null)).toBe('');
    expect(fmtData(undefined)).toBe('');
  });
});

describe('formatDate (admin-4.html)', () => {
  it('formata data ISO corretamente', () => {
    expect(formatDate('2026-03-22')).toBe('22/03/2026');
  });

  it('retorna "—" para entrada vazia ou nula', () => {
    expect(formatDate('')).toBe('—');
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });

  it('retorna a entrada original se não for ISO válido', () => {
    expect(formatDate('abc')).toBe('abc');
  });
});

describe('catBadge (admin-4.html)', () => {
  it('retorna a classe correta para cada categoria', () => {
    expect(catBadge('culto')).toBe('badge-culto');
    expect(catBadge('evento')).toBe('badge-evento');
    expect(catBadge('mensagem')).toBe('badge-mensagem');
    expect(catBadge('missoes')).toBe('badge-missoes');
  });

  it('retorna badge-gray para categoria desconhecida', () => {
    expect(catBadge('desconhecida')).toBe('badge-gray');
    expect(catBadge('')).toBe('badge-gray');
    expect(catBadge(undefined)).toBe('badge-gray');
  });
});

describe('animateCounter — easing cúbico (main.js)', () => {
  it('começa em 0 quando progress=0', () => {
    expect(computeCounter(30, 0, 0)).toBe(0);
  });

  it('chega ao target quando progress=1', () => {
    expect(computeCounter(30, 0, 1)).toBe(30);
  });

  it('respeita o valor inicial (data-start)', () => {
    expect(computeCounter(100, 50, 1)).toBe(100);
    expect(computeCounter(100, 50, 0)).toBe(50);
  });

  it('está entre o início e o target no meio do progresso', () => {
    var val = computeCounter(100, 0, 0.5);
    expect(val).toBeGreaterThan(0);
    expect(val).toBeLessThan(100);
  });

  it('desacelera no final (easing out) — progresso 0.9 > 90% do target', () => {
    // Com ease-out, 90% do tempo já cobre mais de 90% do percurso
    var val = computeCounter(100, 0, 0.9);
    expect(val).toBeGreaterThan(90);
  });

  it('nunca ultrapassa o target', () => {
    expect(computeCounter(30, 0, 1.5)).toBe(30);
  });
});
