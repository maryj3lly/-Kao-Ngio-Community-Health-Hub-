const markerSymbols = {
  home: "⌂",
  member: "♙",
  temple: "☸",
  school: "▣",
  health: "✚",
  market: "▤",
  water: "≈",
  group: "⌘",
  public: "✳",
  other: "•"
};

let activeMap;
let draftMarker;
let draftPointHandler;

export function renderCommunityMap(element, records, onSelectPoint) {
  if (!window.L) throw new Error("โหลดแผนที่ไม่สำเร็จ กรุณาตรวจการเชื่อมต่ออินเทอร์เน็ต");
  if (activeMap) activeMap.remove();

  const map = window.L.map(element, {
    zoomAnimation: false,
    fadeAnimation: false,
    markerZoomAnimation: false
  }).setView([15, 101], 6);
  activeMap = map;
  draftMarker = null;
  draftPointHandler = onSelectPoint;
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  const markers = [];
  for (const record of records) {
    const lat = Number(record.payload.latitude);
    const lng = Number(record.payload.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const symbol = markerSymbols[record.payload.pointType] || markerSymbols.other;
    const marker = window.L.marker([lat, lng], {
      icon: window.L.divIcon({
        className: "community-marker",
        html: `<span>${symbol}</span>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      })
    }).addTo(map);
    const popup = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = record.payload.placeName || "จุดสำรวจ";
    const coordinates = document.createElement("div");
    coordinates.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    popup.append(title, coordinates);
    marker.bindPopup(popup);
    markers.push(marker);
  }

  map.on("click", event => {
    onSelectPoint(event.latlng.lat, event.latlng.lng);
    setDraftMarker(event.latlng.lat, event.latlng.lng);
  });
  if (markers.length) {
    const group = window.L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.15), { maxZoom: 16, animate: false });
  }
  window.setTimeout(() => map.invalidateSize(), 100);
}

export function setDraftMarker(latitude, longitude) {
  if (!activeMap) return;
  if (draftMarker) {
    activeMap.removeLayer(draftMarker);
    draftMarker = null;
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
  draftMarker = window.L.marker([latitude, longitude], {
    draggable: true,
    icon: window.L.divIcon({
      className: "community-marker community-marker-draft",
      html: "<span>＋</span>",
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    })
  }).addTo(activeMap);
  draftMarker.on("dragend", event => {
    const point = event.target.getLatLng();
    if (draftPointHandler) draftPointHandler(point.lat, point.lng);
  });
  activeMap.setView([latitude, longitude], Math.max(activeMap.getZoom(), 16), { animate: false });
}

export function locateUser(onSelectPoint, onError) {
  if (!navigator.geolocation) {
    onError("เบราว์เซอร์นี้ไม่รองรับ GPS");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    position => onSelectPoint(position.coords.latitude, position.coords.longitude),
    error => onError(error.message || "ไม่สามารถอ่านตำแหน่ง GPS ได้"),
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
}
