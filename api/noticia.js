export default async function handler(req, res) {
  const parts = req.url.split('/');
  const id = parts[parts.length - 1].split('?')[0];

  if (!id) return res.redirect(302, '/noticias.html');

  try {
    const r = await fetch(
      'https://firestore.googleapis.com/v1/projects/site-ibbnpvh/databases/(default)/documents/noticias/' +
      id + '?key=AIzaSyChJNokBlnAuUR5K6vVnI8QL03NCG-_7eA'
    );
    if (!r.ok) throw new Error('not found');

    const data = await r.json();
    const f = data.fields || {};
    const titulo    = f.titulo?.stringValue  || 'Notícia — IBBNPVH';
    const resumoHtml = f.resumo?.stringValue  || '';
    const resumo    = resumoHtml.replace(/<[^>]+>/g, '').trim();
    const descricao = resumo.length > 300 ? resumo.substring(0, 300) + '…' : resumo;
    const imagem    = f.imagem?.stringValue  || 'https://ibbnpvh.com.br/logo.png';
    const url       = 'https://ibbnpvh.com.br/noticias/' + id;

    console.log('[noticia] id:', id, '| imagem:', imagem);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${titulo} — IBBNPVH</title>
  <meta name="description"            content="${descricao}">
  <meta property="og:title"           content="${titulo} — IBBNPVH">
  <meta property="og:description"     content="${descricao}">
  <meta property="og:image"           content="${imagem}">
  <meta property="og:url"             content="${url}">
  <meta property="og:type"            content="article">
  <meta property="og:site_name"       content="Igreja Batista Bíblica Nova Porto Velho">
  <meta name="twitter:card"           content="summary_large_image">
  <meta name="twitter:title"          content="${titulo} — IBBNPVH">
  <meta name="twitter:description"    content="${descricao}">
  <meta name="twitter:image"          content="${imagem}">
  <meta http-equiv="refresh"          content="0;url=/noticias.html#${id}">
</head>
<body>
  <script>window.location.replace('/noticias.html#${id}');</script>
</body>
</html>`);

  } catch (err) {
    res.redirect(302, '/noticias.html');
  }
}
