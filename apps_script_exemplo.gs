/**
 * Apps Script Web App usado pelo dashboard SG&A para ler a planilha ao vivo,
 * sem precisar deixar um link de "Publicar na Web" público.
 *
 * COMO IMPLANTAR:
 * 1. Abra a planilha de origem (a mesma com as abas "2025" e "2026").
 * 2. Menu Extensões → Apps Script.
 * 3. Apague o conteúdo do arquivo "Código.gs" e cole todo este arquivo no lugar.
 * 4. Troque o valor de TOKEN abaixo por uma senha longa e aleatória só sua.
 * 5. Menu Implantar → Nova implantação.
 *    - Tipo: "App da Web".
 *    - Executar como: "Eu" (sua conta — assim o script lê a planilha com a SUA permissão,
 *      sem precisar abrir a planilha em si para ninguém).
 *    - Quem pode acessar: "Qualquer pessoa" (é o token abaixo que protege o acesso, não
 *      o login do Google — se usar "Qualquer pessoa com Conta Google" o dashboard não
 *      consegue buscar os dados, porque o navegador não faz login automático).
 * 6. Clique em Implantar, autorize o script quando pedido, e copie a URL gerada
 *    (termina em /exec).
 * 7. No dashboard, cole essa URL em "URL do Apps Script (Web App)" e o mesmo TOKEN
 *    em "Token".
 *
 * Sempre que atualizar o TOKEN ou o código, é preciso criar uma NOVA implantação
 * (ou editar a implantação existente em Implantar → Gerenciar implantações) para as
 * mudanças valerem na URL publicada.
 */

var TOKEN = "TROQUE_ESTE_TOKEN_POR_UM_SEGREDO_SEU";

function doGet(e) {
  var token = (e.parameter.token || "");
  if (token !== TOKEN) {
    return ContentService.createTextOutput("Acesso negado.").setMimeType(ContentService.MimeType.TEXT);
  }

  var ano = e.parameter.ano;
  if (ano !== "2025" && ano !== "2026") {
    return ContentService.createTextOutput("Parametro 'ano' invalido (use 2025 ou 2026).")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(ano);
  if (!sheet) {
    return ContentService.createTextOutput("Aba '" + ano + "' nao encontrada na planilha.")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  var tz = ss.getSpreadsheetTimeZone();
  var values = sheet.getDataRange().getValues();
  var csv = values.map(function (row) {
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

  return ContentService.createTextOutput(csv).setMimeType(ContentService.MimeType.CSV);
}
