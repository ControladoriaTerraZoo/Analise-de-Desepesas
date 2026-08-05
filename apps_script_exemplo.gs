/**
 * Apps Script Web App usado pelo dashboard SG&A para ler a planilha ao vivo — dados
 * financeiros (abas "2025"/"2026") E a lista de usuários (aba "USUARIOS") — sem
 * precisar deixar um link de "Publicar na Web" público, e sem duplicar credenciais
 * dentro do HTML do dashboard.
 *
 * A aba "USUARIOS" deve ter estas colunas, nesta ordem:
 *   nome | email | senha | papel | ativo | forcarTrocaSenha
 * A coluna "forcarTrocaSenha" é nova — use "sim" para uma senha temporária que a
 * pessoa precisa trocar no primeiro acesso, ou deixe em branco/"não" caso contrário.
 *
 * COMO IMPLANTAR:
 * 1. Abra a planilha de origem (a mesma com as abas "2025", "2026" e "USUARIOS").
 * 2. Menu Extensões → Apps Script.
 * 3. Apague o conteúdo do arquivo "Código.gs" e cole todo este arquivo no lugar.
 * 4. Troque o valor de TOKEN abaixo por uma senha longa e aleatória só sua.
 * 5. Menu Implantar → Nova implantação.
 *    - Tipo: "App da Web".
 *    - Executar como: "Eu" (sua conta — assim o script lê/edita a planilha com a SUA
 *      permissão, sem precisar abrir a planilha em si para ninguém).
 *    - Quem pode acessar: "Qualquer pessoa" (é o token abaixo que protege o acesso,
 *      não o login do Google — se usar "Qualquer pessoa com Conta Google" o dashboard
 *      não consegue buscar os dados, porque o navegador não faz login automático).
 * 6. Clique em Implantar, autorize o script quando pedido, e copie a URL gerada
 *    (termina em /exec).
 * 7. Me passe essa URL e o TOKEN para eu embutir no dashboard.
 *
 * Sempre que atualizar o TOKEN ou o código, é preciso criar uma NOVA implantação
 * (ou editar a implantação existente em Implantar → Gerenciar implantações) para as
 * mudanças valerem na URL publicada.
 */

var TOKEN = "TROQUE_ESTE_TOKEN_POR_UM_SEGREDO_SEU";
var USUARIOS_SHEET = "USUARIOS";
var USUARIOS_COLS = ["nome", "email", "senha", "papel", "ativo", "forcarTrocaSenha"];

function sheetToCsv(sheet, tz) {
  var values = sheet.getDataRange().getValues();
  return values.map(function (row) {
    return row.map(function (cell) {
      var s;
      if (Object.prototype.toString.call(cell) === "[object Date]") {
        // ISO (yyyy-MM-dd) evita qualquer ambiguidade de formato de data por localidade.
        s = Utilities.formatDate(cell, tz, "yyyy-MM-dd");
      } else {
        s = String(cell);
      }
      if (s.indexOf(",") > -1 || s.indexOf('"') > -1 || s.indexOf("\n") > -1) {
        s = '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }).join(",");
  }).join("\n");
}

function textResponse(text, mime) {
  return ContentService.createTextOutput(text).setMimeType(mime || ContentService.MimeType.TEXT);
}

function doGet(e) {
  var token = (e.parameter.token || "");
  if (token !== TOKEN) return textResponse("Acesso negado.");

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tz = ss.getSpreadsheetTimeZone();

  if (e.parameter.sheet === USUARIOS_SHEET) {
    var usersSheet = ss.getSheetByName(USUARIOS_SHEET);
    if (!usersSheet) return textResponse("Aba 'USUARIOS' nao encontrada na planilha.");
    return textResponse(sheetToCsv(usersSheet, tz), ContentService.MimeType.CSV);
  }

  var ano = e.parameter.ano;
  if (ano !== "2025" && ano !== "2026") {
    return textResponse("Parametro 'ano' ou 'sheet' invalido.");
  }
  var sheet = ss.getSheetByName(ano);
  if (!sheet) return textResponse("Aba '" + ano + "' nao encontrada na planilha.");
  return textResponse(sheetToCsv(sheet, tz), ContentService.MimeType.CSV);
}

// Recebe a troca de senha do primeiro acesso e grava direto na aba USUARIOS, para
// valer em qualquer navegador/computador (não só no que a pessoa usou para trocar).
function doPost(e) {
  var token = (e.parameter.token || "");
  if (token !== TOKEN) return textResponse("Acesso negado.");

  var email = String(e.parameter.email || "").trim().toLowerCase();
  var novaSenha = String(e.parameter.novaSenha || "");
  if (!email || !novaSenha) return textResponse("Parametros 'email'/'novaSenha' ausentes.");

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(USUARIOS_SHEET);
  if (!sheet) return textResponse("Aba 'USUARIOS' nao encontrada na planilha.");

  var values = sheet.getDataRange().getValues();
  var header = values[0].map(function (h) { return String(h).trim().toLowerCase(); });
  var emailCol = header.indexOf("email");
  var senhaCol = header.indexOf("senha");
  var forcarCol = header.indexOf("forcartrocasenha");
  if (emailCol === -1 || senhaCol === -1) return textResponse("Colunas 'email'/'senha' nao encontradas.");

  for (var r = 1; r < values.length; r++) {
    if (String(values[r][emailCol]).trim().toLowerCase() === email) {
      sheet.getRange(r + 1, senhaCol + 1).setValue(novaSenha);
      if (forcarCol !== -1) sheet.getRange(r + 1, forcarCol + 1).setValue("não");
      return textResponse("OK");
    }
  }
  return textResponse("Usuario nao encontrado.");
}
