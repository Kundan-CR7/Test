/**
 * Optional Google-only serverless backend (no Vercel function).
 * Writes to two tabs: Logs (append) and Daily (upsert by date + shift).
 */

var LOG_HEADERS = [
  'Submitted At',
  'Production Date',
  'Shift',
  'CNC Entries',
  'CNC Total Hours',
  'CNC Total Sides',
  'Burma 1 Operator',
  'Burma 1',
  'Burma 2 Operator',
  'Burma 2',
  'Burma 3 Operator',
  'Burma 3',
  'Burma Total',
  'Repair Person',
  'Repair Count',
  'Repair Note',
  'Notes',
  'Text Summary',
  'CNC Details JSON',
];

var DAILY_HEADERS = [
  'Production Date',
  'Shift',
  'CNC Total Hours',
  'CNC Total Sides',
  'Burma Total',
  'CNC Entries',
  'Submissions',
  'Last Submitted At',
];

var LOG_TAB_NAME = 'Logs';
var DAILY_TAB_NAME = 'Daily';

function expectedApiKey_() {
  return PropertiesService.getScriptProperties().getProperty('API_KEY');
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function ensureHeaders_(sheet, headers) {
  if (sheet.getLastRow() === 0 || sheet.getRange(1, 1).getValue() !== headers[0]) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function getOrCreateSheet_(spreadsheet, name) {
  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }
  return sheet;
}

function parseNumber_(value) {
  var parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

function parseCount_(value) {
  var parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

function payloadToLogRow_(payload) {
  function num(value) {
    return value === null || value === undefined ? '' : String(value);
  }

  return [
    payload.submittedAt,
    payload.productionDate,
    payload.shift,
    String(payload.cncEntryCount),
    String(payload.cncTotalHours),
    String(payload.cncTotalSides),
    payload.burma1Operator || '',
    num(payload.burma1),
    payload.burma2Operator || '',
    num(payload.burma2),
    payload.burma3Operator || '',
    num(payload.burma3),
    String(payload.burmaTotal),
    payload.repairPerson || '',
    num(payload.repairCount),
    payload.repairNote || '',
    payload.notes || '',
    payload.textSummary,
    payload.cncEntriesJson,
  ];
}

function upsertDaily_(dailySheet, payload) {
  ensureHeaders_(dailySheet, DAILY_HEADERS);

  var lastRow = dailySheet.getLastRow();
  var matchRow = -1;

  if (lastRow > 1) {
    var dates = dailySheet.getRange(2, 1, lastRow - 1, 2).getValues();
    for (var i = 0; i < dates.length; i++) {
      if (dates[i][0] === payload.productionDate && dates[i][1] === payload.shift) {
        matchRow = i + 2;
        break;
      }
    }
  }

  if (matchRow === -1) {
    dailySheet.appendRow([
      payload.productionDate,
      payload.shift,
      String(payload.cncTotalHours),
      String(payload.cncTotalSides),
      String(payload.burmaTotal),
      String(payload.cncEntryCount),
      1,
      payload.submittedAt,
    ]);
    return;
  }

  var existing = dailySheet.getRange(matchRow, 1, 1, 8).getValues()[0];
  dailySheet.getRange(matchRow, 1, 1, 8).setValues([
    [
      payload.productionDate,
      payload.shift,
      String(parseNumber_(existing[2]) + payload.cncTotalHours),
      String(parseNumber_(existing[3]) + payload.cncTotalSides),
      String(parseNumber_(existing[4]) + payload.burmaTotal),
      String(parseCount_(existing[5]) + payload.cncEntryCount),
      parseCount_(existing[6]) + 1,
      payload.submittedAt,
    ],
  ]);
}

function doPost(e) {
  try {
    var configuredKey = expectedApiKey_();
    if (!configuredKey) {
      return jsonResponse_({ ok: false, error: 'not_configured' });
    }

    var body = JSON.parse(e.postData.contents);
    if (body.apiKey !== configuredKey) {
      return jsonResponse_({ ok: false, error: 'unauthorized' });
    }

    delete body.apiKey;
    var payload = body;
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var logSheet = getOrCreateSheet_(spreadsheet, LOG_TAB_NAME);
    var dailySheet = getOrCreateSheet_(spreadsheet, DAILY_TAB_NAME);

    ensureHeaders_(logSheet, LOG_HEADERS);
    logSheet.appendRow(payloadToLogRow_(payload));
    upsertDaily_(dailySheet, payload);

    return jsonResponse_({ ok: true });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function doOptions() {
  return jsonResponse_({ ok: true });
}