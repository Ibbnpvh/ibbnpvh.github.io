// ── Lógica extraída de noticias.js ───────────────────────────────────────────

function fmtData(iso) {
  if (!iso) return '';
  var p = iso.split('-');
  return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
}

const CATS = {
  culto:    { label: 'Culto',    cls: 'tag-culto'    },
  evento:   { label: 'Evento',   cls: 'tag-evento'   },
  mensagem: { label: 'Mensagem', cls: 'tag-mensagem' },
  missoes:  { label: 'Missões',  cls: 'tag-missoes'  },
};

function getNoticasPublicadas(raw) {
  var noticias = [];
  try { noticias = (JSON.parse(raw) || {}).noticias || []; } catch (e) {}
  return noticias
    .filter(function (n) { return n.status === 'publicada'; })
    .sort(function (a, b) { return (b.data || '').localeCompare(a.data || ''); });
}

function buildCardHTML(noticia, isDestaque) {
  var cat = CATS[noticia.categoria] || { label: noticia.categoria || '', cls: '' };
  var imgHtml = noticia.imagem
    ? '<div class="noticia-img"><img src="' + noticia.imagem + '" alt="' + noticia.titulo + '" loading="lazy"></div>'
    : '';
  return {
    className: 'noticia-card reveal' + (isDestaque ? ' destaque' : ''),
    categoria: noticia.categoria || '',
    html: imgHtml +
      '<div class="noticia-body">' +
        '<div class="noticia-meta">' +
          '<span class="noticia-tag ' + cat.cls + '">' + cat.label + '</span>' +
          (noticia.data ? '<span class="noticia-data">' + fmtData(noticia.data) + '</span>' : '') +
        '</div>' +
        '<h2 class="noticia-titulo">' + noticia.titulo + '</h2>' +
        '<p class="noticia-resumo">' + noticia.resumo + '</p>' +
      '</div>',
  };
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

const noticiaPublicada = (overrides = {}) => ({
  id: '1',
  titulo: 'Culto de domingo',
  categoria: 'culto',
  data: '2026-03-22',
  resumo: 'Texto do resumo.',
  imagem: '',
  status: 'publicada',
  ...overrides,
});

// ── Testes ───────────────────────────────────────────────────────────────────

describe('getNoticasPublicadas — filtro e ordenação', () => {
  it('retorna apenas notícias com status "publicada"', () => {
    const raw = JSON.stringify({
      noticias: [
        noticiaPublicada({ id: '1', status: 'publicada' }),
        noticiaPublicada({ id: '2', status: 'rascunho'  }),
      ],
    });
    const result = getNoticasPublicadas(raw);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('ordena da mais recente para a mais antiga', () => {
    const raw = JSON.stringify({
      noticias: [
        noticiaPublicada({ id: 'A', data: '2026-01-01' }),
        noticiaPublicada({ id: 'B', data: '2026-03-22' }),
        noticiaPublicada({ id: 'C', data: '2025-12-31' }),
      ],
    });
    const result = getNoticasPublicadas(raw);
    expect(result.map(n => n.id)).toEqual(['B', 'A', 'C']);
  });

  it('retorna lista vazia se não há notícias publicadas', () => {
    const raw = JSON.stringify({
      noticias: [
        noticiaPublicada({ status: 'rascunho' }),
      ],
    });
    expect(getNoticasPublicadas(raw)).toHaveLength(0);
  });

  it('retorna lista vazia se localStorage estiver vazio', () => {
    expect(getNoticasPublicadas(null)).toHaveLength(0);
    expect(getNoticasPublicadas('')).toHaveLength(0);
  });

  it('retorna lista vazia se JSON for inválido', () => {
    expect(getNoticasPublicadas('{ broken json')).toHaveLength(0);
  });

  it('lida com notícias sem data sem lançar erro', () => {
    const raw = JSON.stringify({
      noticias: [
        noticiaPublicada({ id: '1', data: '' }),
        noticiaPublicada({ id: '2', data: '2026-03-22' }),
      ],
    });
    expect(() => getNoticasPublicadas(raw)).not.toThrow();
  });
});

describe('buildCardHTML — geração de HTML dos cards', () => {
  it('primeiro item recebe classe "destaque"', () => {
    const card = buildCardHTML(noticiaPublicada(), true);
    expect(card.className).toContain('destaque');
  });

  it('demais itens não recebem classe "destaque"', () => {
    const card = buildCardHTML(noticiaPublicada(), false);
    expect(card.className).not.toContain('destaque');
  });

  it('inclui imagem no HTML quando preenchida', () => {
    const n = noticiaPublicada({ imagem: 'https://example.com/foto.jpg' });
    const card = buildCardHTML(n, false);
    expect(card.html).toContain('<img');
    expect(card.html).toContain('https://example.com/foto.jpg');
  });

  it('não inclui bloco de imagem quando vazia', () => {
    const card = buildCardHTML(noticiaPublicada({ imagem: '' }), false);
    expect(card.html).not.toContain('<img');
  });

  it('aplica classe CSS correta para cada categoria', () => {
    const categorias = ['culto', 'evento', 'mensagem', 'missoes'];
    categorias.forEach(cat => {
      const card = buildCardHTML(noticiaPublicada({ categoria: cat }), false);
      expect(card.html).toContain('tag-' + cat);
    });
  });

  it('exibe data formatada no card', () => {
    const card = buildCardHTML(noticiaPublicada({ data: '2026-03-22' }), false);
    expect(card.html).toContain('22/03/2026');
  });

  it('não exibe span de data quando campo está vazio', () => {
    const card = buildCardHTML(noticiaPublicada({ data: '' }), false);
    expect(card.html).not.toContain('noticia-data');
  });

  it('usa categoria genérica para categorias desconhecidas', () => {
    const card = buildCardHTML(noticiaPublicada({ categoria: 'nova-cat' }), false);
    expect(card.html).toContain('nova-cat');
  });

  it('define data-categoria corretamente', () => {
    const card = buildCardHTML(noticiaPublicada({ categoria: 'culto' }), false);
    expect(card.categoria).toBe('culto');
  });
});

describe('filtrar — visibilidade por categoria', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <article class="noticia-card" data-categoria="culto">Culto</article>
      <article class="noticia-card" data-categoria="evento">Evento</article>
      <article class="noticia-card" data-categoria="mensagem">Mensagem</article>
      <div id="emptyState" style="display:none;"></div>
    `;
  });

  function filtrar(cat) {
    var cards = document.querySelectorAll('.noticia-card');
    var visiveis = 0;
    cards.forEach(function (c) {
      if (cat === 'todos' || c.dataset.categoria === cat) {
        c.style.display = ''; visiveis++;
      } else {
        c.style.display = 'none';
      }
    });
    document.getElementById('emptyState').style.display = visiveis === 0 ? 'block' : 'none';
    return visiveis;
  }

  it('"todos" exibe todos os cards', () => {
    const count = filtrar('todos');
    expect(count).toBe(3);
    document.querySelectorAll('.noticia-card').forEach(c => {
      expect(c.style.display).not.toBe('none');
    });
  });

  it('filtra corretamente por categoria específica', () => {
    const count = filtrar('culto');
    expect(count).toBe(1);
    expect(document.querySelector('[data-categoria="culto"]').style.display).not.toBe('none');
    expect(document.querySelector('[data-categoria="evento"]').style.display).toBe('none');
  });

  it('exibe empty state quando filtro não tem resultados', () => {
    const count = filtrar('missoes');
    expect(count).toBe(0);
    expect(document.getElementById('emptyState').style.display).toBe('block');
  });

  it('esconde empty state quando há resultados', () => {
    filtrar('missoes'); // primeiro esconde tudo
    filtrar('culto');   // depois filtra por culto
    expect(document.getElementById('emptyState').style.display).toBe('none');
  });
});
