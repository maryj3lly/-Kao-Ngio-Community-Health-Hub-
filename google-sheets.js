const CLIENT_ID = "121730968281-4ng2d9ae739s34g2vs2f7vup99sgh2rj.apps.googleusercontent.com";
const SPREADSHEET_ID = "1a89ZBrl-tNd-_jeWLY8U-2hgaHJHc6jGqV4NjiXYa3E";
const SHEET_NAME = "Tool Records";
const HEADERS = ["รหัส", "เครื่องมือ", "สร้างเมื่อ", "แก้ไขล่าสุด", "ผู้บันทึก", "ข้อมูล JSON", "ลบเมื่อ"];
const SCOPE = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email";
const LOCAL_STORAGE_KEY = "community-health-hub.records.v1";

let accessToken = "";
let userEmail = "";
let tokenClient;
let tokenExpiresAt = 0;
let sheetReady = false;

export function isGoogleConfigured() {
  return CLIENT_ID.endsWith(".apps.googleusercontent.com");
}

export function isLocalMode() {
  return location.protocol === "file:" || !isGoogleConfigured();
}

function waitForIdentity() {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      if (window.google?.accounts?.oauth2) return resolve();
      if (Date.now() - started > 10000) {
        return reject(new Error("โหลด Google Sign-In ไม่สำเร็จ กรุณาตรวจการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่"));
      }
      window.setTimeout(check, 100);
    };
    check();
  });
}

export async function signIn() {
  if (location.protocol === "file:") {
    throw new Error("Google Sign-In ใช้กับ file:// ไม่ได้ กรุณาเปิดเว็บไซต์ผ่าน HTTPS หรือ local web server ที่ลงทะเบียนใน OAuth");
  }
  if (!isGoogleConfigured()) {
    throw new Error("ยังไม่ได้ตั้งค่า Google OAuth Client ID ใน assets/js/google-sheets.js");
  }
  await waitForIdentity();
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
          await ensureSheet();
          resolve({ email: userEmail });
        } catch (error) {
          accessToken = "";
          userEmail = "";
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
  sheetReady = false;
  if (token && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(token, () => {});
  }
}

export function getSignedInEmail() {
  if (accessToken && Date.now() >= tokenExpiresAt) {
    accessToken = "";
    userEmail = "";
    sheetReady = false;
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
      sheetReady = false;
    }
    throw new Error(apiMessage);
  }
  return result;
}

function sheetUrl(path = "") {
  return `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}${path}`;
}

async function ensureSheet() {
  if (sheetReady) return;
  const spreadsheet = await apiRequest(sheetUrl("?fields=sheets.properties(sheetId,title)"));
  const hasSheet = spreadsheet.sheets?.some(sheet => sheet.properties?.title === SHEET_NAME);
  if (!hasSheet) {
    try {
      await apiRequest(sheetUrl(":batchUpdate"), {
        method: "POST",
        body: JSON.stringify({ requests: [{ addSheet: { properties: { title: SHEET_NAME } } }] })
      });
    } catch (error) {
      if (!error.message.toLowerCase().includes("already exists")) throw error;
    }
  }
  const header = await apiRequest(sheetUrl(`/values/${encodeURIComponent(`${SHEET_NAME}!A1:G1`)}`));
  if (!header.values?.[0]?.length) {
    await apiRequest(sheetUrl(`/values/${encodeURIComponent(`${SHEET_NAME}!A1:G1`)}?valueInputOption=RAW`), {
      method: "PUT",
      body: JSON.stringify({ values: [HEADERS] })
    });
  } else if (HEADERS.some((value, index) => header.values[0][index] !== value)) {
    throw new Error(`แท็บ ${SHEET_NAME} มีหัวตารางไม่ตรงกับระบบ กรุณาสำรองข้อมูลและตรวจสอบหัวตารางก่อน`);
  }
  sheetReady = true;
}

async function readRows() {
  await ensureSheet();
  const data = await apiRequest(sheetUrl(`/values/${encodeURIComponent(`${SHEET_NAME}!A2:G`)}`));
  return (data.values || []).map((row, index) => {
    let payload;
    try {
      payload = JSON.parse(row[5] || "{}");
    } catch {
      throw new Error(`แถว ${index + 2} ในแท็บ ${SHEET_NAME} มีข้อมูล JSON ไม่ถูกต้อง`);
    }
    return {
      id: row[0] || "",
      toolId: row[1] || "",
      createdAt: row[2] || "",
      updatedAt: row[3] || "",
      userEmail: row[4] || "",
      payload,
      deletedAt: row[6] || "",
      rowNumber: index + 2
    };
  });
}

export async function listRecords(toolId) {
  if (isLocalMode()) {
    return readLocalRecords()
      .filter(record => record.toolId === toolId && !record.deletedAt)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }
  return (await readRows())
    .filter(record => record.toolId === toolId && !record.deletedAt)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
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
  await ensureSheet();
  const now = new Date().toISOString();
  const values = [[
    existingRecord?.id || crypto.randomUUID(),
    toolId,
    existingRecord?.createdAt || now,
    now,
    userEmail,
    JSON.stringify(payload),
    ""
  ]];

  if (existingRecord) {
    const currentRecord = (await readRows()).find(record => record.id === existingRecord.id && !record.deletedAt);
    if (!currentRecord) throw new Error("ไม่พบรายการเดิม อาจถูกลบหรือแก้ไขจากชีตแล้ว กรุณารีเฟรชรายการ");
    await apiRequest(sheetUrl(`/values/${encodeURIComponent(`${SHEET_NAME}!A${currentRecord.rowNumber}:G${currentRecord.rowNumber}`)}?valueInputOption=RAW`), {
      method: "PUT",
      body: JSON.stringify({ values })
    });
    return;
  }

  await apiRequest(sheetUrl(`/values/${encodeURIComponent(`${SHEET_NAME}!A:G`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`), {
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
  await ensureSheet();
  const currentRecord = (await readRows()).find(item => item.id === record.id && !item.deletedAt);
  if (!currentRecord) throw new Error("ไม่พบรายการนี้ อาจถูกลบไปแล้ว กรุณารีเฟรชรายการ");
  const values = [[currentRecord.id, currentRecord.toolId, currentRecord.createdAt, new Date().toISOString(), userEmail, JSON.stringify(currentRecord.payload), new Date().toISOString()]];
  await apiRequest(sheetUrl(`/values/${encodeURIComponent(`${SHEET_NAME}!A${currentRecord.rowNumber}:G${currentRecord.rowNumber}`)}?valueInputOption=RAW`), {
    method: "PUT",
    body: JSON.stringify({ values })
  });
}
