# Analise de Despesas

Dashboard estático (`index.html`, sem dependências externas) para análise vertical (AV%) das
despesas de SG&A sobre a Receita Líquida, com dados de 2025 e 2026.

## Uso

Abra `index.html` em um navegador (ou publique via GitHub Pages). O arquivo já vem com um
snapshot dos dados extraído da planilha original.

**Acesso:** protegido por login simples (usuário/senha definidos na aba `USUARIOS` da planilha
de origem). Isso é um controle de acesso do lado do cliente, não um backend de autenticação —
não é indicado para dados sigilosos.

## Manter atualizado a partir do Google Sheets

Dentro do dashboard, abra "Fonte de dados & atualização via Google Sheets" e cole os links de
CSV publicado (Arquivo → Compartilhar → Publicar na web) de cada aba (2025 e 2026) da planilha.
O dashboard recalcula tudo no navegador a partir desses links, sem precisar gerar um novo HTML.
