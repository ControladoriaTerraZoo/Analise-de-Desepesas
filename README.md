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

Dentro do dashboard, abra "Fonte de dados & atualização via Google Sheets" e cole a URL de um
Apps Script publicado como Web App (Extensões → Apps Script, na própria planilha) junto com o
token configurado nele — veja `apps_script_exemplo.gs` para o código de exemplo e o passo a
passo de implantação. O dashboard recalcula tudo no navegador a partir dessa URL, sem precisar
gerar um novo HTML nem expor a planilha por um link público.
