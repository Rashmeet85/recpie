/**
 * ==========================================================================
 * Project Usaari Evening School - Google Apps Script Master Database Bridge
 * Initiators of Change (IOC) - 100% Free Cloud Integration
 * ==========================================================================
 */

const API_SECRET_TOKEN = "IOC_USAARI_SECURE_2026";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Verify Security Token
    if (data.token !== API_SECRET_TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Unauthorized. Invalid secret token."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initializeSheetsIfMissing(ss);

    const action = data.action;
    const payload = data.payload;

    if (action === "ping") {
      return ContentService.createTextOutput(JSON.stringify({ status: "ok", message: "Connected to Google Sheet Master!" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "register_student") {
      appendStudentRow(ss, payload);
      return ContentService.createTextOutput(JSON.stringify({ status: "ok", message: "Student registered successfully." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "mark_attendance") {
      recordAttendanceLog(ss, payload);
      updateMonthlyRegister(ss, payload);
      return ContentService.createTextOutput(JSON.stringify({ status: "ok", message: "Attendance logged." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "sync_attendance_batch") {
      const records = payload.records || [];
      records.forEach(r => {
        recordAttendanceLog(ss, r);
        updateMonthlyRegister(ss, r);
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "ok", count: records.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "unknown_action" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function initializeSheetsIfMissing(ss) {
  // 1. Students Sheet
  let studentsSheet = ss.getSheetByName("Students");
  if (!studentsSheet) {
    studentsSheet = ss.insertSheet("Students");
    studentsSheet.appendRow([
      "Student ID", "Full Name", "Gender", "DOB", "Age", "Grade", "Shift", 
      "Guardian Name", "Phone", "Emergency Phone", "Address", "Blood Group", "Status"
    ]);
    studentsSheet.getRange("A1:M1").setFontWeight("bold").setBackground("#EF4444").setFontColor("#FFFFFF");
    studentsSheet.setFrozenRows(1);
  }

  // 2. Attendance Logs Sheet
  let logSheet = ss.getSheetByName("Attendance_Logs");
  if (!logSheet) {
    logSheet = ss.insertSheet("Attendance_Logs");
    logSheet.appendRow([
      "Timestamp", "Date", "Student ID", "Student Name", "Grade", "Status", "Marked By", "Reason Tag", "Notes"
    ]);
    logSheet.getRange("A1:I1").setFontWeight("bold").setBackground("#10B981").setFontColor("#FFFFFF");
    logSheet.setFrozenRows(1);
  }

  // 3. Monthly Register Sheet
  let regSheet = ss.getSheetByName("Monthly_Register");
  if (!regSheet) {
    regSheet = ss.insertSheet("Monthly_Register");
    const header = ["Student ID", "Full Name", "Grade"];
    for (let day = 1; day <= 31; day++) header.push("D" + day);
    header.push("Total Present", "Total Absent", "% Attendance");
    regSheet.appendRow(header);
    regSheet.getRange(1, 1, 1, header.length).setFontWeight("bold").setBackground("#0F172A").setFontColor("#FFFFFF");
    regSheet.setFrozenRows(1);
    regSheet.setFrozenColumns(3);
  }
}

function appendStudentRow(ss, s) {
  const sheet = ss.getSheetByName("Students");
  sheet.appendRow([
    s.studentId, s.fullName, s.gender, s.dateOfBirth, s.calculatedAge, s.grade, s.shift || "Evening",
    s.guardianName, s.primaryPhone, s.emergencyPhone, s.residentialAddress, s.bloodGroup, s.status || "active"
  ]);
}

function recordAttendanceLog(ss, a) {
  const sheet = ss.getSheetByName("Attendance_Logs");
  sheet.appendRow([
    new Date(), a.date, a.studentId, a.studentName || "", a.grade || "",
    a.status.toUpperCase(), a.markedByName || "Educator", a.reasonTag || "", a.customNote || ""
  ]);
}

function updateMonthlyRegister(ss, a) {
  const sheet = ss.getSheetByName("Monthly_Register");
  const dateObj = new Date(a.date);
  const day = dateObj.getDate();
  const colIndex = 3 + day; // D1 is at col 4

  const data = sheet.getDataRange().getValues();
  let studentRow = -1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === a.studentId) {
      studentRow = i + 1;
      break;
    }
  }

  if (studentRow === -1) {
    sheet.appendRow([a.studentId, a.studentName || "", a.grade || ""]);
    studentRow = sheet.getLastRow();
  }

  const cell = sheet.getRange(studentRow, colIndex);
  const statusChar = a.status === "present" ? "P" : "A";
  cell.setValue(statusChar);
  cell.setBackground(a.status === "present" ? "#D1FAE5" : "#FEE2E2");
  cell.setFontColor(a.status === "present" ? "#065F46" : "#991B1B");
  cell.setFontWeight("bold");
}
