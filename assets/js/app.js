import { tools, categories } from "./data.js";
import { formSchemas } from "./tool-forms.js";
import { archiveRecord, getSignedInEmail, isLocalMode, listRecords, saveRecord, signIn, signOut } from "./google-sheets.js?oauth=1";
import { locateUser, renderCommunityMap, setDraftMarker } from "./community-map.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const state = { route: "home", activeTool: null, query: "", category: "all", records: [], editing: null, requestId: 0 };
const LOGIN_USERNAME = "admin";
const LOGIN_PASSWORD = "1234";
let workspaceInitialized = false;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function cardTemplate(tool) {
  return `<article class="tool-card">
    <div class="tool-card-top"><span class="tool-symbol ${tool.color}">${tool.icon}</span><span class="tool-number">TOOL / ${tool.number}</span></div>
    <h3>${tool.name}</h3><p>${tool.short}</p>
    <div class="tool-card-bottom"><span class="tool-category">${categories[tool.category]}</span><button class="tool-open" data-open-tool="${tool.id}" type="button">เปิดแบบบันทึก <span>→</span></button></div>
  </article>`;
}

function renderCards(gridId, emptyId, countId, query = "", category = "all") {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  const normalized = query.trim().toLocaleLowerCase("th");
  const filtered = tools.filter(tool => {
    const matchesQuery = !normalized || [tool.name, tool.english, tool.short, categories[tool.category]].join(" ").toLocaleLowerCase("th").includes(normalized);
    return matchesQuery && (category === "all" || tool.category === category);
  });
  grid.innerHTML = filtered.map(cardTemplate).join("");
  const empty = document.getElementById(emptyId);
  if (empty) empty.classList.toggle("hidden", filtered.length > 0);
  const count = document.getElementById(countId);
  if (count) count.textContent = `แสดงเครื่องมือ ${filtered.length} รายการ`;
}

function renderSidebarTools() {
  $("#sidebarTools").innerHTML = tools.map(tool => `<a class="nav-link" href="#tool/${tool.id}" data-nav="tool"><span class="nav-icon">${tool.icon}</span><span>${tool.name}</span></a>`).join("");
}

function fieldTemplate(field) {
  const required = field.required ? " required" : "";
  const maxlength = field.maxLength ? ` maxlength="${field.maxLength}"` : "";
  const placeholder = field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : "";
  if (field.type === "hidden") return `<input type="hidden" name="${field.name}"${required}>`;
  if (field.type === "checkbox") {
    return `<label class="field-checkbox"><input type="checkbox" name="${field.name}"${required}><span>${escapeHtml(field.label)}</span></label>`;
  }
  if (field.type === "select") {
    const options = field.options.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("");
    const blankOption = field.required ? '<option value="" selected disabled>เลือกข้อมูล</option>' : "";
    return `<label class="data-field"><span>${escapeHtml(field.label)}</span><select name="${field.name}"${required}>${blankOption}${options}</select></label>`;
  }
  if (field.type === "textarea") {
    return `<label class="data-field"><span>${escapeHtml(field.label)}</span><textarea name="${field.name}" rows="4"${maxlength}${placeholder}${required}></textarea></label>`;
  }
  const min = field.min !== undefined ? ` min="${field.min}"` : "";
  const max = field.max !== undefined ? ` max="${field.max}"` : "";
  return `<label class="data-field"><span>${escapeHtml(field.label)}</span><input type="${field.type}" name="${field.name}"${maxlength}${placeholder}${min}${max}${required}></label>`;
}

function renderDetail(tool) {
  const schema = formSchemas[tool.id];
  state.requestId += 1;
  state.records = [];
  state.editing = null;
  $("#toolDetail").innerHTML = `
    <div class="detail-hero"><span class="tool-symbol ${tool.color}">${tool.icon}</span><div><div class="eyebrow">TOOL / ${tool.number} · ${tool.english.toUpperCase()}</div><h1>${tool.name}</h1><p>${tool.short}</p><span class="detail-status"><i></i> ${isLocalMode() ? "แบบทดลอง · บันทึกในเครื่องนี้" : `บันทึกลงแท็บ ${tool.id === "households" ? "ครัวเรือน" : tool.name} ใน Google Sheet`}</span></div></div>
    <div class="tool-purpose"><strong>วัตถุประสงค์</strong><p>${tool.purpose}</p></div>
    <div class="tool-safety"><strong>ข้อควรทราบ</strong><p>${escapeHtml(schema.notice)}</p></div>
    ${isLocalMode() ? '<div class="local-storage-warning" role="note"><strong>โหมดทดลอง — บันทึกในเครื่องนี้เท่านั้น</strong><p>ข้อมูลจะไม่ซิงก์ไป Google Sheet หรืออุปกรณ์อื่น และอาจหายเมื่อเคลียร์ข้อมูลเว็บไซต์ หากต้องการบันทึกจริง ให้เปิดเว็บไซต์ผ่าน HTTPS และลงชื่อเข้าใช้ Google</p></div>' : ""}
    <div class="auth-required hidden" id="authRequired"><h2>เชื่อมต่อบัญชี Google เพื่อดูข้อมูล</h2><p>ใช้บัญชี Google ใดก็ได้ที่มีสิทธิ์แก้ไขชีต ระบบจะขอเชื่อมต่อเมื่อเปิดดูหรือบันทึกข้อมูล</p><button class="button button-primary" id="connectGoogleButton" type="button">เชื่อมต่อ Google</button><span id="authStatus" class="record-status" role="status" aria-live="polite"></span></div>
    <div class="tool-workspace hidden" id="toolWorkspace">
      <form class="record-form" id="recordForm">
        <div class="workspace-heading"><div><div class="eyebrow dark-eyebrow">DATA ENTRY</div><h2 id="recordFormTitle">เพิ่มรายการ</h2></div><span class="workspace-owner" id="workspaceOwner"></span></div>
        <p class="schema-notice">${escapeHtml(schema.notice)}</p>
        ${tool.id === "community-mapping" ? `
          <div class="map-toolbar"><button class="button button-outline" id="locateButton" type="button">⌖ ใช้ตำแหน่ง GPS ปัจจุบัน</button><span id="mapCoordinates" role="status">เลือกตำแหน่งบนแผนที่หรือใช้ GPS</span></div>
          <div class="community-map" id="communityMap" aria-label="แผนที่ชุมชน"></div>
          <p class="map-attribution-note">เลือกตำแหน่งโดยแตะ/คลิกบนแผนที่ หรือใช้ GPS จากอุปกรณ์ ต้องเปิดผ่าน HTTPS และอนุญาตการเข้าถึงตำแหน่ง</p>` : ""}
        <div class="data-fields">${schema.fields.map(fieldTemplate).join("")}</div>
        <div class="form-actions"><button class="button button-primary" type="submit" id="saveRecordButton">บันทึกข้อมูล</button><button class="button button-outline hidden" type="button" id="cancelEditButton">ยกเลิกแก้ไข</button><span id="recordStatus" class="record-status" role="status" aria-live="polite"></span></div>
      </form>
      <section class="record-list-section"><div class="workspace-heading"><div><div class="eyebrow dark-eyebrow">SAVED RECORDS</div><h2>รายการที่บันทึก</h2></div><button class="button button-outline" id="refreshRecordsButton" type="button">รีเฟรช</button></div><div class="record-list" id="recordList"></div></section>
    </div>`;
  $("#toolDetail").dataset.toolId = tool.id;
  $("#recordForm").addEventListener("submit", onRecordSubmit);

  if (!isLocalMode() && !getSignedInEmail()) {
    $("#authRequired").classList.remove("hidden");
    return;
  }
  loadToolRecords(tool);
}

function optionLabel(field, value) {
  const option = field.options?.find(([optionValue]) => optionValue === value);
  return option ? option[1] : value;
}

function recordTitle(toolId, payload) {
  const primaryFields = {
    "community-mapping": "placeName",
    genogram: "memberCode",
    organization: "groupName",
    "community-health": "resourceName",
    "community-calendar": "title",
    "community-history": "title",
    "life-history": "headline",
    households: "householdName"
  };
  return payload[primaryFields[toolId]] || "รายการข้อมูล";
}

function appendRecordCard(list, record, schema, toolId) {
  const article = document.createElement("article");
  article.className = "record-card";
  const heading = document.createElement("div");
  heading.className = "record-card-heading";
  const title = document.createElement("h3");
  title.textContent = recordTitle(toolId, record.payload);
  const date = document.createElement("time");
  date.textContent = record.createdAt ? new Date(record.createdAt).toLocaleString("th-TH") : "";
  heading.append(title, date);
  article.append(heading);

  const details = document.createElement("dl");
  for (const field of schema.fields) {
    if (field.type === "hidden" || field.type === "checkbox") continue;
    const value = record.payload[field.name];
    if (value === undefined || value === null || value === "") continue;
    const term = document.createElement("dt");
    term.textContent = field.label;
    const description = document.createElement("dd");
    description.textContent = field.type === "select" ? optionLabel(field, String(value)) : String(value);
    details.append(term, description);
  }
  article.append(details);

  const actions = document.createElement("div");
  actions.className = "record-actions";
  const edit = document.createElement("button");
  edit.type = "button";
  edit.className = "button button-outline";
  edit.dataset.editRecord = record.id;
  edit.textContent = "แก้ไข";
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "button button-outline danger-button";
  remove.dataset.archiveRecord = record.id;
  remove.textContent = "ลบ";
  actions.append(edit, remove);
  article.append(actions);
  list.append(article);
}

async function loadToolRecords(tool) {
  const requestId = ++state.requestId;
  $("#authRequired").classList.add("hidden");
  $("#toolWorkspace").classList.remove("hidden");
  $("#workspaceOwner").textContent = getSignedInEmail() || (isLocalMode() ? "บันทึกในเบราว์เซอร์เครื่องนี้" : "");
  $("#recordStatus").textContent = "กำลังโหลดข้อมูล...";
  try {
    const records = await listRecords(tool.id);
    if (requestId !== state.requestId || state.activeTool?.id !== tool.id) return false;
    state.records = records;
    const list = $("#recordList");
    list.replaceChildren();
    if (!records.length) {
      const empty = document.createElement("p");
      empty.className = "record-empty";
      empty.textContent = "ยังไม่มีข้อมูลที่บันทึกไว้";
      list.append(empty);
    } else {
      records.forEach(record => appendRecordCard(list, record, formSchemas[tool.id], tool.id));
    }
    $("#recordStatus").textContent = "";
    if (tool.id === "community-mapping") {
      try {
        renderCommunityMap($("#communityMap"), records, setMapCoordinates);
        if (state.editing?.payload) {
          setDraftMarker(Number(state.editing.payload.latitude), Number(state.editing.payload.longitude));
        }
      } catch (error) {
        $("#recordStatus").textContent = `โหลดแผนที่ไม่สำเร็จ: ${error.message}`;
      }
    }
    return true;
  } catch (error) {
    if (requestId !== state.requestId) return false;
    $("#recordStatus").textContent = `โหลดข้อมูลไม่สำเร็จ: ${error.message}`;
    if (!isLocalMode() && !getSignedInEmail()) {
      $("#toolWorkspace").classList.add("hidden");
      $("#authRequired").classList.remove("hidden");
    }
    return false;
  }
}

function setMapCoordinates(latitude, longitude) {
  const form = $("#recordForm");
  if (!form) return;
  form.elements.latitude.value = latitude.toFixed(7);
  form.elements.longitude.value = longitude.toFixed(7);
  $("#mapCoordinates").textContent = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  setDraftMarker(latitude, longitude);
}

function clearEditing() {
  state.editing = null;
  const form = $("#recordForm");
  if (!form) return;
  form.reset();
  $("#recordFormTitle").textContent = "เพิ่มรายการ";
  $("#saveRecordButton").textContent = "บันทึกข้อมูล";
  $("#cancelEditButton").classList.add("hidden");
  $("#recordStatus").textContent = "";
  if ($("#mapCoordinates")) $("#mapCoordinates").textContent = "เลือกตำแหน่งบนแผนที่หรือใช้ GPS";
  setDraftMarker(null, null);
}

function beginEdit(record) {
  const form = $("#recordForm");
  state.editing = record;
  for (const [name, value] of Object.entries(record.payload)) {
    const input = form.elements.namedItem(name);
    if (!input) continue;
    if (input.type === "checkbox") input.checked = Boolean(value);
    else input.value = value;
  }
  $("#recordFormTitle").textContent = "แก้ไขรายการ";
  $("#saveRecordButton").textContent = "บันทึกการแก้ไข";
  $("#cancelEditButton").classList.remove("hidden");
  $("#recordStatus").textContent = "";
  if (record.payload.latitude && record.payload.longitude) {
    $("#mapCoordinates").textContent = `${Number(record.payload.latitude).toFixed(6)}, ${Number(record.payload.longitude).toFixed(6)}`;
    setDraftMarker(Number(record.payload.latitude), Number(record.payload.longitude));
  }
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function onRecordSubmit(event) {
  if (event.target.id !== "recordForm") return;
  event.preventDefault();
  const form = event.target;
  if (state.activeTool.id === "community-mapping" &&
      (!form.elements.latitude.value || !form.elements.longitude.value)) {
    $("#recordStatus").textContent = "เลือกตำแหน่งบนแผนที่หรือใช้ GPS ก่อนบันทึก";
    return;
  }
  if (!form.reportValidity()) return;

  const tool = state.activeTool;
  const payload = {};
  for (const field of formSchemas[tool.id].fields) {
    const input = form.elements.namedItem(field.name);
    if (!input) continue;
    if (input.type === "checkbox") payload[field.name] = input.checked;
    else if (input.type === "number") payload[field.name] = input.value === "" ? "" : Number(input.value);
    else payload[field.name] = input.value.trim();
  }
  const missingField = formSchemas[tool.id].fields.find(field =>
    field.required && (field.type === "checkbox" ? !payload[field.name] : !String(payload[field.name] || "").trim())
  );
  if (missingField) {
    $("#recordStatus").textContent = `กรุณากรอก${missingField.label}`;
    return;
  }

  const button = $("#saveRecordButton");
  button.disabled = true;
  $("#recordStatus").textContent = "กำลังบันทึก...";
  try {
    await saveRecord(tool.id, payload, state.editing);
    clearEditing();
    if (await loadToolRecords(tool)) $("#recordStatus").textContent = "บันทึกข้อมูลสำเร็จ";
  } catch (error) {
    $("#recordStatus").textContent = `บันทึกไม่สำเร็จ: ${error.message}`;
    if (!isLocalMode() && !getSignedInEmail()) {
      $("#toolWorkspace").classList.add("hidden");
      $("#authRequired").classList.remove("hidden");
      $("#authStatus").textContent = "เซสชันหมดอายุ กรุณาเชื่อมต่อ Google อีกครั้ง";
    }
  } finally {
    if (button.isConnected) button.disabled = false;
  }
}

function showRoute() {
  const hash = location.hash.replace(/^#/, "") || "home";
  const parts = hash.split("/");
  const route = parts[0];
  const tool = route === "tool" ? tools.find(item => item.id === parts[1]) : null;
  $$(".page-view").forEach(view => view.classList.add("hidden"));
  if (tool) {
    state.route = "detail";
    state.activeTool = tool;
    $("#detailView").classList.remove("hidden");
    renderDetail(tool);
    $("#breadcrumbCurrent").textContent = tool.name;
  } else if (route === "tools") {
    state.route = "tools";
    state.activeTool = null;
    $("#toolsView").classList.remove("hidden");
    $("#breadcrumbCurrent").textContent = "เครื่องมือทั้งหมด";
    renderCards("toolGridAll", "emptyStateAll", "resultCountAll", $("#toolSearchAll").value, $("#categoryFilterAll").value);
  } else if (route === "guide") {
    state.route = "guide";
    state.activeTool = null;
    $("#guideView").classList.remove("hidden");
    $("#breadcrumbCurrent").textContent = "แนวทางการใช้งาน";
  } else {
    state.route = "home";
    state.activeTool = null;
    $("#homeView").classList.remove("hidden");
    $("#breadcrumbCurrent").textContent = "ภาพรวม";
  }
  $$(".nav-link[data-nav]").forEach(link => {
    const key = link.dataset.nav;
    link.classList.toggle("active", (state.route === "home" && key === "home") || (state.route === "tools" && key === "tools") || (state.route === "guide" && key === "guide") || (state.route === "detail" && link.getAttribute("href") === `#tool/${state.activeTool?.id}`));
  });
  closeMobileMenu();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeMobileMenu() {
  $("#sidebar").classList.remove("open");
  $("#mobileOverlay").classList.remove("show");
  $("#menuToggle").setAttribute("aria-expanded", "false");
}

function syncHomeFilters() {
  renderCards("toolGrid", "emptyState", "resultCount", $("#toolSearch").value, $("#categoryFilter").value);
}

function syncAllFilters() {
  renderCards("toolGridAll", "emptyStateAll", "resultCountAll", $("#toolSearchAll").value, $("#categoryFilterAll").value);
}

function initWorkspace() {
  renderSidebarTools();
  $("#year").textContent = new Date().getFullYear();
  syncHomeFilters();
  $("#logoutButton").addEventListener("click", () => {
    signOut();
    $("#appShell").hidden = true;
    $("#loginView").hidden = false;
    $("#loginForm").reset();
    $("#loginError").textContent = "";
    $("#loginUsername").focus();
  });
  if (!location.hash) location.hash = "tool/genogram";
  window.addEventListener("hashchange", showRoute);
  $("#toolSearch").addEventListener("input", syncHomeFilters);
  $("#categoryFilter").addEventListener("change", syncHomeFilters);
  $("#toolSearchAll").addEventListener("input", syncAllFilters);
  $("#categoryFilterAll").addEventListener("change", syncAllFilters);
  $("#clearFilters").addEventListener("click", () => {
    $("#toolSearch").value = "";
    $("#categoryFilter").value = "all";
    syncHomeFilters();
  });
  $("#menuToggle").addEventListener("click", () => {
    const open = $("#sidebar").classList.toggle("open");
    $("#mobileOverlay").classList.toggle("show", open);
    $("#menuToggle").setAttribute("aria-expanded", String(open));
  });
  $("#mobileOverlay").addEventListener("click", closeMobileMenu);
  $("#backToTools").addEventListener("click", () => { location.hash = "tools"; });
  document.addEventListener("click", async event => {
    const target = event.target;
    const openTool = target.closest("[data-open-tool]");
    if (openTool) {
      location.hash = `tool/${openTool.dataset.openTool}`;
      return;
    }
    if (target.closest("#locateButton")) {
      $("#recordStatus").textContent = "กำลังอ่านตำแหน่ง GPS...";
      locateUser(
        (latitude, longitude) => {
          setMapCoordinates(latitude, longitude);
          $("#recordStatus").textContent = "เลือกตำแหน่ง GPS แล้ว";
        },
        error => { $("#recordStatus").textContent = `อ่านตำแหน่งไม่สำเร็จ: ${error}`; }
      );
      return;
    }
    if (target.closest("#cancelEditButton")) {
      clearEditing();
      return;
    }
    if (target.closest("#refreshRecordsButton")) {
      if (state.activeTool) await loadToolRecords(state.activeTool);
      return;
    }
    const editButton = target.closest("[data-edit-record]");
    if (editButton) {
      const record = state.records.find(item => item.id === editButton.dataset.editRecord);
      if (record) beginEdit(record);
      return;
    }
    const archiveButton = target.closest("[data-archive-record]");
    if (archiveButton) {
      const record = state.records.find(item => item.id === archiveButton.dataset.archiveRecord);
      if (!record || !window.confirm("ลบรายการนี้ออกจาก Google Sheet อย่างถาวรหรือไม่?")) return;
      archiveButton.disabled = true;
      $("#recordStatus").textContent = "กำลังลบ...";
      try {
        await archiveRecord(record);
        if (await loadToolRecords(state.activeTool)) $("#recordStatus").textContent = "ลบรายการแล้ว";
      } catch (error) {
        $("#recordStatus").textContent = `ลบไม่สำเร็จ: ${error.message}`;
        archiveButton.disabled = false;
      }
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
      event.preventDefault();
      const visibleInput = state.route === "tools" ? $("#toolSearchAll") : $("#toolSearch");
      visibleInput?.focus();
    }
    if (event.key === "Escape") closeMobileMenu();
  });
  showRoute();
}

$("#loginForm").addEventListener("submit", event => {
  event.preventDefault();
  const username = $("#loginUsername").value.trim();
  const password = $("#loginPassword").value;
  if (username !== LOGIN_USERNAME || password !== LOGIN_PASSWORD) {
    $("#loginError").textContent = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
    $("#loginPassword").value = "";
    $("#loginPassword").focus();
    return;
  }

  $("#loginError").textContent = "";
  $("#loginView").hidden = true;
  $("#appShell").hidden = false;
  if (!workspaceInitialized) {
    initWorkspace();
    workspaceInitialized = true;
  }
});

async function connectGoogleAndLoad(tool) {
  const button = $("#connectGoogleButton");
  const status = $("#authStatus");
  if (!button || !status) return;
  button.disabled = true;
  status.textContent = "กำลังเชื่อมต่อ Google...";
  try {
    await signIn();
    status.textContent = "";
    await loadToolRecords(tool);
  } catch (error) {
    status.textContent = `เชื่อมต่อ Google Sheet ไม่สำเร็จ: ${error.message}`;
  } finally {
    if (button.isConnected) button.disabled = false;
  }
}

document.addEventListener("click", event => {
  if (event.target.closest("#connectGoogleButton") && state.activeTool) {
    connectGoogleAndLoad(state.activeTool);
  }
});
