# IBBNPVH Site

## Arquivos principais
- `index.html` + `main.js` + `style.css` — página principal
- `galeria.html` + `galeria.css` + `galeria.js` — galeria dinâmica
- `noticias.html` — página de notícias
- `sou-novo.html` — página para novos visitantes
- `admin-4.html` — painel admin (Firebase Auth + Firestore + Cloudinary)

## Regras críticas
- `admin-4.html` usa `<script type="module">` — funções chamadas por atributos HTML inline (onclick, onchange, etc.) **devem** estar no `Object.assign(window, {...})` no final do script
- Fotos do Firestore aparecem **somente** em `galeria.html`, nunca em `index.html`
- Branch de desenvolvimento: `claude/explore-max-function-9EDC0`
