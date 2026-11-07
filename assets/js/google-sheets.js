import { formSchemas } from "./tool-forms.js";

const CLIENT_ID = "121730968281-4ng2d9ae739s34g2vs2f7vup99sgh2rj.apps.googleusercontent.com";
const SPREADSHEET_ID = "1a89ZBrl-tNd-_jeWLY8U-2hgaHJHc6jGqV4NjiXYa3E";
const LOCAL_STORAGE_KEY = "community-health-hub.records.v1";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email";

const SHEETS = {
  "community-mapping": {
    title: "แผนที่เดินดิน",
    columns: [
      { header: "id", key: "id", source: "record" },
      { header: "ชื่อสถานที่", key: "placeName" },
      { header: "ประเภทสถานที่", key: "pointType" },
      { header: "หมู่บ้าน", key: "village" },
      { header: "รายละเอียด", key: "details" },
      { header: "ละติจูด", key: "latitude" },
      { header: "ลองจิจูด", key: "longitude" },
      { header: "วันที่บันทึก", key: "createdAt", source: "record" },
      { header: "โรคประจำตัวที่พบ", key: "chronicConditions" },
      { header: "จำนวนผู้ป่วยเบาหวาน", key: "diabeticCount" },
      { header: "จำนวนผู้ป่วยความดันโลหิตสูง", key: "hypertensionCount" },
      { header: "จำนวนผู้ป่วยโรคหัวใจ", key: "heartDiseaseCount" },
      { header: "จำนวนผู้ป่วยโรคไต", key: "kidneyDiseaseCount" },
      { header: "จำนวนผู้ป่วยโรคหลอดเลือดสมอง", key: "strokeCount" },
      { header: "จำนวนผู้ป่วยโรคอื่นๆ", key: "otherConditionCount" },
      { header: "จำนวนผู้ป่วยติดบ้าน", key: "homeboundCount" },
      { header: "จำนวนผู้ป่วยติดเตียง", key: "bedriddenCount" },
      { header: "จำนวนผู้พิการ", key: "disabilityCount" },
      { header: "จำนวนผู้สูงอายุ", key: "elderlyCount" },
      { header: "จำนวนเด็กเล็ก", key: "youngChildCount" },
      { header: "วันที่สำรวจ", key: "surveyDate" }
    ]
  },
  genogram: {
    title: "ผังเครือญาติ",
    columns: [
      { header: "id", key: "id", source: "record" },
      { header: "รหัสครัวเรือน", key: "householdCode" },
      { header: "ชื่อบุคคล", key: "memberCode" },
      { header: "ความสัมพันธ์", key: "relationship" },
      { header: "วันเกิด", key: "birthDate" },
      { header: "หมายเหตุ", key: "notes" },
      { header: "วันที่บันทึก", key: "createdAt", source: "record" }
    ]
  },
  organization: {
    title: "องค์กรชุมชน",
    columns: [
      { header: "id", key: "id", source: "record" },
      { header: "ชื่อองค์กร", key: "groupName" },
      { header: "ประเภทองค์กร", key: "groupType" },
      { header: "ผู้ประสานงาน", key: "contactPerson" },
      { header: "เบอร์ติดต่อ", key: "phone" },
      { header: "หมู่บ้าน", key: "village" },
      { header: "รายละเอียด", key: "summary" },
      { header: "วันที่บันทึก", key: "createdAt", source: "record" }
    ]
  },
  "community-health": {
    title: "ระบบสุขภาพ",
    columns: [
      { header: "id", key: "id", source: "record" },
      { header: "รหัสบุคคล", key: "personCode" },
      { header: "ชื่อรายการ", key: "resourceName" },
      { header: "ประเภทข้อมูล", key: "resourceType" },
      { header: "รายละเอียด", key: "details" },
      { header: "วันที่บันทึก", key: "createdAt", source: "record" }
    ]
  },
  "community-calendar": {
    title: "ปฏิทินชุมชน",
    columns: [
      { header: "id", key: "id", source: "record" },
      { header: "ชื่อกิจกรรม", key: "title" },
      { header: "วันที่", key: "date" },
      { header: "สถานที่", key: "place" },
      { header: "ผู้รับผิดชอบ", key: "responsibleGroup" },
      { header: "รายละเอียด", key: "details" },
      { header: "วันที่บันทึก", key: "createdAt", source: "record" }
    ]
  },
  "community-history": {
    title: "ประวัติศาสตร์ชุมชน",
    columns: [
      { header: "id", key: "id", source: "record" },
      { header: "หัวข้อ", key: "title" },
      { header: "ปีหรือช่วงเวลา", key: "period" },
      { header: "รายละเอียด", key: "story" },
      { header: "แหล่งข้อมูล", key: "source" },
      { header: "วันที่บันทึก", key: "createdAt", source: "record" }
    ]
  },
  "life-history": {
    title: "ประวัติชีวิต",
    columns: [
      { header: "id", key: "id", source: "record" },
      { header: "รหัสบุคคล", key: "participantCode" },
      { header: "ชื่อเรื่อง", key: "headline" },
      { header: "เรื่องราว", key: "story" },
      { header: "ผู้บันทึก", key: "recorder", source: "user" },
      { header: "วันที่บันทึก", key: "createdAt", source: "record" }
    ]
  },
  households: {
    title: "ครัวเรือน",
    columns: [
      { header: "id", key: "id", source: "record" },
      { header: "ชื่อครัวเรือน", key: "householdName" },
      { header: "หมู่บ้าน", key: "village" },
      { header: "จำนวนสมาชิก", key: "memberCount" },
      { header: "รายละเอียด", key: "details" },
      { header: "วันที่บันทึก", key: "createdAt", source: "record" }
    ]
  }
};

let accessToken = "";
let userEmail = "";
let tokenClient;
let tokenExpiresAt = 0;
let sheetMetadata = new Map();

export function isGoogleConfigured() {
  return CLIENT_ID.endsWith(".apps.googleusercontent.com");
}

export function isLocalMode() {
  return location.protocol === "file:" || !isGoogleConfigured();
}

export async function signIn() {
  if (location.protocol === "file:") {
    throw new Error("Google Sign-In ใช้กับ file:// ไม่ได้ กรุณาเปิดเว็บไซต์ผ่าน HTTPS หรือ local web server ที่ลงทะเบียนใน OAuth");
  }
  if (!isGoogleConfigured()) {
    throw new Error("ยังไม่ได้ตั้งค่า Google OAuth Client ID ใน assets/js/google-sheets.js");
  }
  if (!window.google?.accounts?.oauth2) {
    throw new Error("Google Sign-In ยังโหลดไม่เสร็จ กรุณากดเข้าสู่ระบบอีกครั้ง");
  }
  return new Promise((resolve, reject) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: async response => {
        if (response.error) {
          reject(new Error(response.error_description || response.error));
          return;
        }
        accessToken = response.access_token;
        tokenExpiresAt = Date.now() + Number(response.expires_in || 3600) * 1000;
        try {
          const identity = await apiRequest("https://www.googleapis.com/oauth2/v3/userinfo");
          userEmail = identity.email || "";
          if (!userEmail) throw new Error("ไม่สามารถยืนยันบัญชี Google ได้");
          await ensureSheets();
          resolve({ email: userEmail });
        } catch (error) {
          accessToken = "";
          userEmail = "";
          sheetMetadata = new Map();
          reject(error);
        }
      },
      error_callback: error => reject(new Error(error.message || "เข้าสู่ระบบ Google ไม่สำเร็จ"))
    });
    tokenClient.requestAccessToken({ prompt: "" });
  });
}

export function signOut() {
  const token = accessToken;
  accessToken = "";
  userEmail = "";
  tokenExpiresAt = 0;
  sheetMetadata = new Map();
  if (token && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(token, () => {});
  }
}

export function getSignedInEmail() {
  if (accessToken && Date.now() >= tokenExpiresAt) {
    accessToken = "";
    userEmail = "";
    sheetMetadata = new Map();
  }
  return userEmail;
}

function readLocalRecords() {
  let value;
  try {
    value = localStorage.getItem(LOCAL_STORAGE_KEY);
  } catch {
    throw new Error("เบราว์เซอร์ปิดกั้นการจัดเก็บข้อมูลในเครื่อง กรุณาเปิดผ่าน local web server หรือ HTTPS");
  }
  if (!value) return [];
  let records;
  try {
    records = JSON.parse(value);
  } catch {
    throw new Error("ข้อมูลในเครื่องเสียหาย อ่านรายการไม่ได้ กรุณาสำรองข้อมูลก่อนล้างข้อมูลเว็บไซต์");
  }
  if (!Array.isArray(records)) throw new Error("รูปแบบข้อมูลในเครื่องไม่ถูกต้อง");
  return records;
}

function writeLocalRecords(records) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    if (error.name === "QuotaExceededError") throw new Error("พื้นที่จัดเก็บในเบราว์เซอร์เต็ม กรุณาลบข้อมูลที่ไม่ใช้แล้ว");
    throw new Error("บันทึกข้อมูลในเครื่องไม่ได้: " + error.message);
  }
}

async function apiRequest(url, options = {}) {
  if (!accessToken || Date.now() >= tokenExpiresAt) {
    throw new Error("เซสชันหมดอายุ กรุณาเข้าสู่ระบบ Google อีกครั้ง");
  }
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });
  const responseText = await response.text();
  let result = {};
  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error("Google Sheets API ส่งข้อมูลกลับมาในรูปแบบที่ไม่รู้จัก");
    }
  }
  if (!response.ok) {
    const apiMessage = result.error?.message || `Google API ตอบกลับสถานะ ${response.status}`;
    if (response.status === 401) {
      accessToken = "";
      userEmail = "";
      sheetMetadata = new Map();
    }
    throw new Error(apiMessage);
  }
  return result;
}

function sheetUrl(path = "") {
  return `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}${path}`;
}

function columnLetter(columnNumber) {
  let value = columnNumber;
  let result = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }
  return result;
}

async function ensureSheets() {
  if (sheetMetadata.size === Object.keys(SHEETS).length) return;
  const spreadsheet = await apiRequest(sheetUrl("?fields=sheets.properties(sheetId,title)"));
  const availableSheets = new Map(
    (spreadsheet.sheets || []).map(sheet => [sheet.properties.title, sheet.properties.sheetId])
  );
  const validatedSheets = new Map();
  for (const [toolId, definition] of Object.entries(SHEETS)) {
    const sheetId = availableSheets.get(definition.title);
    if (sheetId === undefined) {
      throw new Error(`ไม่พบแท็บ “${definition.title}” ใน Google Sheet กรุณาตรวจชื่อแท็บก่อนบันทึก`);
    }
    const lastColumn = columnLetter(definition.columns.length + 1);
    const headerResult = await apiRequest(sheetUrl(`/values/${encodeURIComponent(`${definition.title}!A1:${lastColumn}1`)}`));
    const headers = headerResult.values?.[0] || [];
    const expectedHeaders = [definition.title, ...definition.columns.map(column => column.header)];
    if (headers.length !== expectedHeaders.length || expectedHeaders.some((value, index) => headers[index] !== value)) {
      throw new Error(`หัวตารางแท็บ “${definition.title}” ไม่ตรงกับฟอร์ม กรุณาตรวจสอบหัวคอลัมน์ก่อนบันทึก`);
    }
    validatedSheets.set(toolId, { ...definition, sheetId, lastColumn });
  }
  sheetMetadata = validatedSheets;
}

function decodeCell(toolId, key, value) {
  if (value === undefined || value === null || value === "") return "";
  const field = formSchemas[toolId].fields.find(item => item.name === key);
  if (field?.options) {
    const match = field.options.find(([optionValue, label]) => value === label || value === optionValue);
    if (match) return match[0];
  }
  if (field?.type === "number") return Number(value);
  return value;
}

async function readRows(toolId) {
  await ensureSheets();
  const definition = sheetMetadata.get(toolId);
  const data = await apiRequest(sheetUrl(`/values/${encodeURIComponent(`${definition.title}!B2:${definition.lastColumn}`)}`));
  return (data.values || []).flatMap((row, index) => {
    const id = row[0] || "";
    if (!id) return [];
    const payload = {};
    for (const [columnIndex, column] of definition.columns.entries()) {
      if (!column.source || column.source === "payload") {
        payload[column.key] = decodeCell(toolId, column.key, row[columnIndex]);
      }
    }
    const createdAtColumn = definition.columns.findIndex(column => column.key === "createdAt");
    const recorderColumn = definition.columns.findIndex(column => column.key === "recorder");
    return [{
      id,
      toolId,
      createdAt: row[createdAtColumn] || "",
      updatedAt: row[createdAtColumn] || "",
      userEmail: recorderColumn < 0 ? "" : row[recorderColumn] || "",
      payload,
      rowNumber: index + 2,
      sheetId: definition.sheetId
    }];
  });
}

export async function listRecords(toolId) {
  if (!SHEETS[toolId]) throw new Error(`ไม่พบการตั้งค่าชีตของเครื่องมือ ${toolId}`);
  if (isLocalMode()) {
    return readLocalRecords()
      .filter(record => record.toolId === toolId && !record.deletedAt)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }
  return (await readRows(toolId))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function localDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export async function saveRecord(toolId, payload, existingRecord = null) {
  if (isLocalMode()) {
    const records = readLocalRecords();
    const now = new Date().toISOString();
    if (existingRecord) {
      const index = records.findIndex(record => record.id === existingRecord.id && !record.deletedAt);
      if (index < 0) throw new Error("ไม่พบรายการเดิม อาจถูกลบไปแล้ว กรุณารีเฟรชรายการ");
      records[index] = {
        ...records[index],
        updatedAt: now,
        payload
      };
    } else {
      records.push({
        id: crypto.randomUUID(),
        toolId,
        createdAt: now,
        updatedAt: now,
        userEmail: "local",
        payload,
        deletedAt: ""
      });
    }
    writeLocalRecords(records);
    return;
  }
  if (!SHEETS[toolId]) throw new Error(`ไม่พบการตั้งค่าชีตของเครื่องมือ ${toolId}`);
  await ensureSheets();
  const definition = sheetMetadata.get(toolId);
  let currentRecord = null;
  if (existingRecord) {
    currentRecord = (await readRows(toolId)).find(record => record.id === existingRecord.id);
    if (!currentRecord) throw new Error("ไม่พบรายการเดิม อาจถูกลบหรือแก้ไขจากชีตแล้ว กรุณารีเฟรชรายการ");
  }
  const record = {
    id: currentRecord?.id || crypto.randomUUID(),
    createdAt: currentRecord?.createdAt || localDate(),
    payload
  };
  const values = [definition.columns.map(column => {
    if (column.source === "record") return record[column.key] || "";
    if (column.source === "user") return userEmail;
    const field = formSchemas[toolId].fields.find(item => item.name === column.key);
    const value = payload[column.key];
    if (field?.options && value !== undefined && value !== "") {
      return field.options.find(([optionValue]) => optionValue === value)?.[1] || value;
    }
    return value ?? "";
  })];

  if (currentRecord) {
    await apiRequest(sheetUrl(`/values/${encodeURIComponent(`${definition.title}!B${currentRecord.rowNumber}:${definition.lastColumn}${currentRecord.rowNumber}`)}?valueInputOption=RAW`), {
      method: "PUT",
      body: JSON.stringify({ values })
    });
    return;
  }

  await apiRequest(sheetUrl(`/values/${encodeURIComponent(`${definition.title}!B:${definition.lastColumn}`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`), {
    method: "POST",
    body: JSON.stringify({ values })
  });
}

export async function archiveRecord(record) {
  if (isLocalMode()) {
    const records = readLocalRecords();
    const index = records.findIndex(item => item.id === record.id && !item.deletedAt);
    if (index < 0) throw new Error("ไม่พบรายการนี้ อาจถูกลบไปแล้ว กรุณารีเฟรชรายการ");
    records[index] = { ...records[index], updatedAt: new Date().toISOString(), deletedAt: new Date().toISOString() };
    writeLocalRecords(records);
    return;
  }
  const rows = await readRows(record.toolId);
  const currentRecord = rows.find(item => item.id === record.id);
  if (!currentRecord) throw new Error("ไม่พบรายการนี้ อาจถูกลบไปแล้ว กรุณารีเฟรชรายการ");
  await apiRequest(sheetUrl(":batchUpdate"), {
    method: "POST",
    body: JSON.stringify({
      requests: [{
        deleteDimension: {
          range: {
            sheetId: currentRecord.sheetId,
            dimension: "ROWS",
            startIndex: currentRecord.rowNumber - 1,
            endIndex: currentRecord.rowNumber
          }
        }
      }]
    })
  });
}
