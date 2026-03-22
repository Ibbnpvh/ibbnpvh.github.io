// ── Lógica extraída de admin-4.html ──────────────────────────────────────────

const STORAGE_KEY = 'ibbnpvh_cms';

function makeState() {
  return { noticias: [], galeria: [], oracoes: [] };
}

// ID sequencial para evitar colisão de Date.now() em chamadas síncronas
let _idSeq = 0;
function nextId() { return String(Date.now()) + '_' + (++_idSeq); }

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}

function loadState() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch (e) {}
  return makeState();
}

function salvarNoticia(state, fields) {
  const { id, titulo, categoria, data, resumo, imagem, status } = fields;
  if (!titulo || !titulo.trim()) return { ok: false, error: 'Título obrigatório' };
  if (!resumo || !resumo.trim()) return { ok: false, error: 'Resumo obrigatório' };

  if (id) {
    // edição
    const idx = state.noticias.findIndex(n => n.id === id);
    if (idx !== -1) state.noticias[idx] = { id, titulo, categoria, data, resumo, imagem, status };
  } else {
    // criação
    state.noticias.push({ id: nextId(), titulo, categoria, data, resumo, imagem, status });
  }
  return { ok: true };
}

function deletarNoticia(state, id) {
  const before = state.noticias.length;
  state.noticias = state.noticias.filter(n => n.id !== id);
  return state.noticias.length < before;
}

function salvarGaleria(state, fields) {
  const { tipo, legenda, url, videoId } = fields;
  if (tipo === 'foto') {
    if (!url || !url.trim()) return { ok: false, error: 'URL da foto obrigatória' };
    state.galeria.push({ id: nextId(), tipo, legenda, url });
    return { ok: true };
  }
  if (tipo === 'video') {
    if (!videoId || !videoId.trim()) return { ok: false, error: 'ID do vídeo obrigatório' };
    state.galeria.push({ id: nextId(), tipo, legenda, videoId });
    return { ok: true };
  }
  return { ok: false, error: 'Tipo inválido' };
}

function deletarGaleria(state, id) {
  const before = state.galeria.length;
  state.galeria = state.galeria.filter(g => g.id !== id);
  return state.galeria.length < before;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const noticiaBase = (overrides = {}) => ({
  id: '',
  titulo: 'Título teste',
  categoria: 'culto',
  data: '2026-03-22',
  resumo: 'Resumo do evento.',
  imagem: '',
  status: 'publicada',
  ...overrides,
});

// ── Testes: Storage ───────────────────────────────────────────────────────────

describe('saveState / loadState', () => {
  beforeEach(() => localStorage.clear());

  it('persiste e recupera o estado corretamente', () => {
    const state = makeState();
    state.noticias.push({ id: '1', titulo: 'Teste', status: 'publicada' });
    saveState(state);

    const loaded = loadState();
    expect(loaded.noticias).toHaveLength(1);
    expect(loaded.noticias[0].titulo).toBe('Teste');
  });

  it('retorna estado inicial se localStorage estiver vazio', () => {
    const state = loadState();
    expect(state.noticias).toEqual([]);
    expect(state.galeria).toEqual([]);
    expect(state.oracoes).toEqual([]);
  });

  it('retorna estado inicial se JSON corrompido', () => {
    localStorage.setItem(STORAGE_KEY, '{ broken');
    const state = loadState();
    expect(state.noticias).toEqual([]);
  });

  it('sobrescreve estado anterior ao salvar novamente', () => {
    const s1 = makeState();
    s1.noticias.push({ id: '1', titulo: 'Primeiro' });
    saveState(s1);

    const s2 = makeState();
    s2.noticias.push({ id: '2', titulo: 'Segundo' });
    saveState(s2);

    expect(loadState().noticias[0].titulo).toBe('Segundo');
  });
});

// ── Testes: Notícias CRUD ─────────────────────────────────────────────────────

describe('salvarNoticia — criação', () => {
  it('adiciona notícia válida ao estado', () => {
    const state = makeState();
    const res = salvarNoticia(state, noticiaBase());
    expect(res.ok).toBe(true);
    expect(state.noticias).toHaveLength(1);
    expect(state.noticias[0].titulo).toBe('Título teste');
  });

  it('gera ID único para cada notícia criada', () => {
    const state = makeState();
    salvarNoticia(state, noticiaBase());
    salvarNoticia(state, noticiaBase({ titulo: 'Outra notícia' }));
    const ids = state.noticias.map(n => n.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('rejeita notícia sem título', () => {
    const state = makeState();
    const res = salvarNoticia(state, noticiaBase({ titulo: '' }));
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/título/i);
    expect(state.noticias).toHaveLength(0);
  });

  it('rejeita notícia com título apenas espaços', () => {
    const state = makeState();
    const res = salvarNoticia(state, noticiaBase({ titulo: '   ' }));
    expect(res.ok).toBe(false);
  });

  it('rejeita notícia sem resumo', () => {
    const state = makeState();
    const res = salvarNoticia(state, noticiaBase({ resumo: '' }));
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/resumo/i);
  });
});

describe('salvarNoticia — edição', () => {
  it('atualiza notícia existente pelo id', () => {
    const state = makeState();
    salvarNoticia(state, noticiaBase());
    const id = state.noticias[0].id;

    salvarNoticia(state, noticiaBase({ id, titulo: 'Título editado' }));
    expect(state.noticias).toHaveLength(1);
    expect(state.noticias[0].titulo).toBe('Título editado');
  });

  it('não duplica ao editar', () => {
    const state = makeState();
    salvarNoticia(state, noticiaBase());
    const id = state.noticias[0].id;
    salvarNoticia(state, noticiaBase({ id, titulo: 'Editado' }));
    expect(state.noticias).toHaveLength(1);
  });

  it('não altera outras notícias ao editar uma', () => {
    const state = makeState();
    salvarNoticia(state, noticiaBase({ titulo: 'Notícia 1' }));
    salvarNoticia(state, noticiaBase({ titulo: 'Notícia 2' }));
    const id = state.noticias[0].id;

    salvarNoticia(state, noticiaBase({ id, titulo: 'Notícia 1 editada' }));
    expect(state.noticias.find(n => n.titulo === 'Notícia 2')).toBeTruthy();
  });
});

describe('deletarNoticia', () => {
  it('remove a notícia com o id correto', () => {
    const state = makeState();
    salvarNoticia(state, noticiaBase());
    const id = state.noticias[0].id;

    const removeu = deletarNoticia(state, id);
    expect(removeu).toBe(true);
    expect(state.noticias).toHaveLength(0);
  });

  it('retorna false se id não existir', () => {
    const state = makeState();
    expect(deletarNoticia(state, 'id-inexistente')).toBe(false);
  });

  it('não remove outras notícias ao deletar uma', () => {
    const state = makeState();
    salvarNoticia(state, noticiaBase({ titulo: 'Manter' }));
    salvarNoticia(state, noticiaBase({ titulo: 'Deletar' }));
    const idDeletar = state.noticias[1].id;

    deletarNoticia(state, idDeletar);
    expect(state.noticias).toHaveLength(1);
    expect(state.noticias[0].titulo).toBe('Manter');
  });
});

// ── Testes: Galeria CRUD ──────────────────────────────────────────────────────

describe('salvarGaleria — foto', () => {
  it('adiciona foto com URL válida', () => {
    const state = makeState();
    const res = salvarGaleria(state, { tipo: 'foto', url: 'https://example.com/foto.jpg', legenda: 'Culto' });
    expect(res.ok).toBe(true);
    expect(state.galeria).toHaveLength(1);
    expect(state.galeria[0].tipo).toBe('foto');
    expect(state.galeria[0].url).toBe('https://example.com/foto.jpg');
  });

  it('rejeita foto sem URL', () => {
    const state = makeState();
    const res = salvarGaleria(state, { tipo: 'foto', url: '', legenda: '' });
    expect(res.ok).toBe(false);
    expect(state.galeria).toHaveLength(0);
  });

  it('rejeita foto com URL apenas de espaços', () => {
    const state = makeState();
    const res = salvarGaleria(state, { tipo: 'foto', url: '   ', legenda: '' });
    expect(res.ok).toBe(false);
  });
});

describe('salvarGaleria — vídeo', () => {
  it('adiciona vídeo com ID válido', () => {
    const state = makeState();
    const res = salvarGaleria(state, { tipo: 'video', videoId: 'Z4-n41DbRDc', legenda: 'Pregação' });
    expect(res.ok).toBe(true);
    expect(state.galeria[0].videoId).toBe('Z4-n41DbRDc');
  });

  it('rejeita vídeo sem ID', () => {
    const state = makeState();
    const res = salvarGaleria(state, { tipo: 'video', videoId: '', legenda: '' });
    expect(res.ok).toBe(false);
  });
});

describe('deletarGaleria', () => {
  it('remove o item correto da galeria', () => {
    const state = makeState();
    salvarGaleria(state, { tipo: 'foto', url: 'https://a.com/1.jpg', legenda: '' });
    salvarGaleria(state, { tipo: 'foto', url: 'https://a.com/2.jpg', legenda: '' });
    const id = state.galeria[0].id;

    deletarGaleria(state, id);
    expect(state.galeria).toHaveLength(1);
    expect(state.galeria[0].url).toBe('https://a.com/2.jpg');
  });

  it('retorna false para id inexistente', () => {
    const state = makeState();
    expect(deletarGaleria(state, 'nao-existe')).toBe(false);
  });
});
