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
  var first = sheet.getRange(1, 1).getValue();
  var lastHeaderCell = sheet.getRange(1, headers.length).getValue();
  var expectedLast = headers[headers.length - 1];
  if (sheet.getLastRow() === 0 || first !== headers[0] || lastHeaderCell !== expectedLast) {
    // Clear a wide header area then set to remove any stale column headers from schema changes
    sheet.getRange(1, 1, 1, 26).setValues([Array(26).fill('')]);
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

function normalizeKey_(v) {
  if (v === null || v === undefined) return '';
  if (v instanceof Date && !isNaN(v.getTime())) {
    var y = v.getFullYear();
    var m = ('0' + (v.getMonth() + 1)).slice(-2);
    var d = ('0' + v.getDate()).slice(-2);
    return y + '-' + m + '-' + d;
  }
  if (typeof v === 'string') {
    var s = v.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    var d = new Date(s);
    if (!isNaN(d.getTime())) {
      var y = d.getFullYear();
      var m = ('0' + (d.getMonth() + 1)).slice(-2);
      var dd = ('0' + d.getDate()).slice(-2);
      return y + '-' + m + '-' + dd;
    }
    return s;
  }
  if (typeof v === 'number' && v > 30000) {
    var adj = v;
    if (v > 60) adj = v - 1;
    var epoch = Date.UTC(1899, 11, 30);
    var dt = new Date(epoch + Math.round(adj) * 86400000);
    var y = dt.getUTCFullYear();
    var m = ('0' + (dt.getUTCMonth() + 1)).slice(-2);
    var dd = ('0' + dt.getUTCDate()).slice(-2);
    return y + '-' + m + '-' + dd;
  }
  return String(v).trim();
}

/**
 * Format "Last Submitted At" for the Daily tab as IST (UTC+5:30).
 * Matches the formatting used by the Vercel/Node sheets backend.
 * Example output: "07-06-2026 23:05:42 IST"
 */
function formatLastSubmittedAtIST_(isoString) {
  if (!isoString) return '';
  var utc = new Date(isoString);
  if (isNaN(utc.getTime())) {
    return isoString;
  }
  // IST offset: +5.5 hours
  var IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  var ist = new Date(utc.getTime() + IST_OFFSET_MS);

  function pad(n) { return ('0' + n).slice(-2); }

  var dd = pad(ist.getUTCDate());
  var mm = pad(ist.getUTCMonth() + 1);
  var yyyy = ist.getUTCFullYear();
  var hh = pad(ist.getUTCHours());
  var min = pad(ist.getUTCMinutes());
  var ss = pad(ist.getUTCSeconds());

  return dd + '-' + mm + '-' + yyyy + ' ' + hh + ':' + min + ':' + ss + ' IST';
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
    payload.cncEntriesJson,
  ];
}

function upsertDaily_(dailySheet, payload) {
  ensureHeaders_(dailySheet, DAILY_HEADERS);

  // Force key columns (date, shift) and "Last Submitted At" (col 8) to plain text.
  // This ensures the IST-formatted timestamp is stored literally and is not
  // re-interpreted or shifted by the spreadsheet's timezone setting (prevents GMT display).
  dailySheet.getRange(1, 1, Math.max(dailySheet.getLastRow(), 1000), 2).setNumberFormat('@');
  dailySheet.getRange(1, 8, Math.max(dailySheet.getLastRow(), 1000), 1).setNumberFormat('@');

  var lastRow = dailySheet.getLastRow();
  var matchRow = -1;

  if (lastRow > 1) {
    var dates = dailySheet.getRange(2, 1, lastRow - 1, 2).getValues();
    for (var i = 0; i < dates.length; i++) {
      if (normalizeKey_(dates[i][0]) === payload.productionDate && normalizeKey_(dates[i][1]) === payload.shift) {
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
      formatLastSubmittedAtIST_(payload.submittedAt),
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
      formatLastSubmittedAtIST_(payload.submittedAt),
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
    Logger.log('Daily tab target: %s (Last Submitted At will be written in IST)', DAILY_TAB_NAME);

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