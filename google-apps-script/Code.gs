const WISHES_SHEET_NAME = "Lời chúc";
const RSVP_SHEET_NAME = "Xác nhận tham dự";
const MAX_NAME_LENGTH = 25;
const MAX_MESSAGE_LENGTH = 1000;

function doGet(event) {
  const callback = String(
    event && event.parameter && event.parameter.callback
      ? event.parameter.callback
      : ""
  );
  if (!/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService.createTextOutput("Invalid callback")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  try {
    const sheet = getSheet_(WISHES_SHEET_NAME, ["Tên", "Lời chúc", "Thời gian"]);
    const lastRow = sheet.getLastRow();
    const firstRow = Math.max(2, lastRow - 99);
    const rows =
      lastRow < 2
        ? []
        : sheet.getRange(firstRow, 1, lastRow - firstRow + 1, 3).getDisplayValues();
    const wishes = rows
      .reverse()
      .map((row) => ({
        name: row[0],
        message: row[1],
        date: row[2],
      }))
      .filter((wish) => wish.name && wish.message);
    const json = JSON.stringify(wishes)
      .replace(/</g, "\\u003c")
      .replace(/>/g, "\\u003e")
      .replace(/&/g, "\\u0026");

    return ContentService.createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch (error) {
    console.error("Unable to read wedding wishes:", error);
    return ContentService.createTextOutput(callback + "({error:true});")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function doPost(event) {
  const parameters = (event && event.parameter) || {};
  const requestId = String(parameters.requestId || "").slice(0, 100);
  const kind = String(parameters.kind || "wish");
  let ok = false;

  try {
    const name = String(parameters.name || "").trim();
    if (!name || name.length > MAX_NAME_LENGTH) {
      throw new Error("Invalid name");
    }
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (kind === "wish") {
        const message = String(parameters.message || "").trim();
        if (!message || message.length > MAX_MESSAGE_LENGTH) {
          throw new Error("Invalid wish content");
        }
        getSheet_(WISHES_SHEET_NAME, ["Tên", "Lời chúc", "Thời gian"]).appendRow([
          safeCell_(name),
          safeCell_(message),
          new Date(),
        ]);
      } else if (kind === "rsvp") {
        const attendance = String(parameters.attendance || "");
        const attendeeCount = Number(parameters.attendeeCount);
        if (
          !["yes", "no"].includes(attendance) ||
          !Number.isInteger(attendeeCount) ||
          attendeeCount < 1 ||
          attendeeCount > 10
        ) {
          throw new Error("Invalid RSVP details");
        }
        getSheet_(RSVP_SHEET_NAME, [
          "Họ tên",
          "Xác nhận tham dự",
          "Số người",
          "Thời gian",
        ]).appendRow([
          safeCell_(name),
          attendance === "yes" ? "Có tham dự" : "Không tham dự",
          attendeeCount,
          new Date(),
        ]);
      } else {
        throw new Error("Unknown form type");
      }
    } finally {
      lock.releaseLock();
    }
    ok = true;
  } catch (error) {
    console.error("Unable to save wedding wish:", error);
  }

  const response = JSON.stringify({
    type: "wedding-form-result",
    kind: kind,
    requestId: requestId,
    ok: ok,
  });
  const html =
    "<!doctype html><html><head><meta charset=\"utf-8\"></head><body>" +
    "<script>window.parent.postMessage(" +
    response +
    ",'*');</script></body></html>";
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(
    HtmlService.XFrameOptionsMode.ALLOWALL
  );
}

function getSheet_(name, headers) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error("Bind this script to the wedding spreadsheet.");
  }

  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
  return sheet;
}

function safeCell_(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}
