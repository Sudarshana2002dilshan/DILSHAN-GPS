// ============================================================================
// DILSHAN MARINE GPS - FIREBASE CLOUD REALTIME SYNC GRADE SCRIPT
// Developer: Sudarshana DILSHAN
// ============================================================================

// 🔴 මෙතනට ඔයාගේ Firebase Config විස්තර ටික අනිවාර්යයෙන්ම දාන්න මල්ලි!
const firebaseConfig = {
  apiKey: "AIzaSyAbCfnQtNWbSznv3OU0THPZSB9VWPv-hOs",
  authDomain: "dilshan-gps.firebaseapp.com",
  projectId: "dilshan-gps",
  storageBucket: "dilshan-gps.firebasestorage.app",
  messagingSenderId: "86804944242",
  appId: "1:86804944242:web:c1c0351d2da5a0d83fb9eb",
  measurementId: "G-SZ44FM7Z42"
};
// Firebase Initialize කිරීම
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let watchId = null;
let savedHazards = {}; // Firebase Object එකක් ලෙස තබාගනී
let lastWeatherFetchTime = 0;

document.addEventListener("DOMContentLoaded", () => {
    // 1. Navigation Button Click Handlers
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-nav'));
            btn.classList.add('active-nav');
            const tabId = btn.getAttribute('data-tab');
            showTab(tabId);
        });
    });

    // 2. Action Event Listeners
    document.getElementById('btn-save-hazard')?.addEventListener('click', saveHazardToFirebase);
    document.getElementById('btn-theme')?.addEventListener('click', toggleTheme);
    document.getElementById('btn-night')?.addEventListener('click', toggleNightVision);
    document.getElementById('btn-battery')?.addEventListener('click', showBatteryInfo);
    document.getElementById('btn-convert')?.addEventListener('click', convertGPS);
    document.getElementById('btn-go-admin')?.addEventListener('click', () => {
        showTab('admin');
        const adminBtn = document.querySelector('[data-tab="admin"]');
        if (adminBtn) {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-nav'));
            adminBtn.classList.add('active-nav');
        }
    });

    listenToFirebaseHazards(); // Firebase එක ලයිව් සම්බන්ධ කිරීම
    startTracking();
});

function showTab(tabId) {
    const panels = document.querySelectorAll('.tab-pane');
    panels.forEach(panel => {
        panel.classList.toggle('active', panel.id === tabId);
    });
}

// 🌐 Firebase Database එක ලයිව් Listen කිරීම (ඕනෑම කෙනෙක් දාන දේවල් සැනින් අප්ඩේට් වේ)
function listenToFirebaseHazards() {
    database.ref('hazards').on('value', (snapshot) => {
        savedHazards = snapshot.val() || {};
        updateAdminPanel();
    });
}

function startTracking() {
    if (!navigator.geolocation) {
        alert("ඔයාගේ ෆෝන් එකේ GPS වැඩ කරන්නේ නැහැ!");
        return;
    }
    const options = { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 };
    watchId = navigator.geolocation.watchPosition(updateLocation, handleGPSError, options);
}

function updateLocation(position) {
    try {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const speedKmH = position.coords.speed ? (position.coords.speed * 3.6).toFixed(1) : "0.0";

        const latEl = document.getElementById("lat");
        const lonEl = document.getElementById("lon");
        const speedEl = document.getElementById("speed");
        const timeEl = document.getElementById("time");

        if (latEl) latEl.innerText = convertToDMS(lat);
        if (lonEl) lonEl.innerText = convertToDMS(lon);
        if (speedEl) speedEl.innerText = speedKmH + " km/h";
        if (timeEl) timeEl.innerText = new Date().toLocaleTimeString();

        const now = Date.now();
        if (now - lastWeatherFetchTime > 300000) { 
            fetchMarineData(lat, lon);
            lastWeatherFetchTime = now;
        }

        checkProximityAlerts(lat, lon);
    } catch (err) {
        console.error(err);
    }
}

// Firebase එකට ලයිව් දත්ත ඇතුළත් කිරීම (ඇප් එක පාවිච්චි කරන ඕනෑම කෙනෙක්ට හැක)
function saveHazardToFirebase() {
    const nameEl = document.getElementById("h-name");
    if (!nameEl || !nameEl.value) { alert("කරුණාකර ගලේ නම ඇතුළත් කරන්න!"); return; }
    
    navigator.geolocation.getCurrentPosition((position) => {
        const newHazardRef = database.ref('hazards').push();
        newHazardRef.set({
            name: nameEl.value,
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            timestamp: Date.now()
        }).then(() => {
            alert(`${nameEl.value} ගල පොදු Firebase Database එකට සාර්ථකව ඇතුළත් වුණා!`);
            nameEl.value = "";
        }).catch((err) => {
            alert("Firebase එකට සේව් කිරීමට නොහැකි වුණා. Rules පරීක්ෂා කරන්න.");
        });
    }, (err) => {
        alert("GPS දත්ත ලබාගැනීමට නොහැකි වුණා!");
    });
}

// 🛠️ Firebase Admin Panel එකේ ලිස්ට් එක හැදීම සහ කළමනාකරණය
function updateAdminPanel() {
    const countEl = document.getElementById("hazard-count");
    const container = document.getElementById("hazard-list");
    if (!container) return;

    const keys = Object.keys(savedHazards);
    if (countEl) countEl.innerText = keys.length;

    if (keys.length === 0) {
        container.innerHTML = `<p style="text-align: center; opacity: 0.5; padding: 20px;">තවමත් කිසිදු ගලක් මාක් කර නැත.</p>`;
        return;
    }

    container.innerHTML = "";
    keys.forEach((key, index) => {
        const hazard = savedHazards[key];
        const item = document.createElement("div");
        item.className = "hazard-item";
        item.innerHTML = `
            <div class="hazard-info">
                <h5>${index + 1}. ${hazard.name}</h5>
                <p>Lat: ${convertToDMS(hazard.lat)} | Lon: ${convertToDMS(hazard.lon)}</p>
            </div>
            <button class="btn-delete-item" data-id="${key}">🗑️ මකන්න</button>
        `;
        container.appendChild(item);
    });

    // පොදු Firebase එකෙන් ගලක් මකාදැමීම
    document.querySelectorAll('.btn-delete-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            if (confirm("මෙම ගල පොදු පද්ධතියෙන් සදහටම මකා දැමීමට අවශ්‍යද?")) {
                database.ref(`hazards/${id}`).remove();
            }
        });
    });
}

function checkProximityAlerts(currentLat, currentLon) {
    const alertDistanceKm = 0.5;
    let dangerFound = false;
    let closestRockName = "";

    Object.keys(savedHazards).forEach(key => {
        const hazard = savedHazards[key];
        const dist = calculateDistance(currentLat, currentLon, hazard.lat, hazard.lon);
        if (dist <= alertDistanceKm) { dangerFound = true; closestRockName = hazard.name; }
    });

    const alertBox = document.getElementById("hazard-alert");
    if (alertBox) {
        if (dangerFound) {
            alertBox.innerText = `🚨 අවධානයයි: ${closestRockName} ගල ආසන්නයේ ඇත!`;
            alertBox.style.display = "block";
            if (navigator.vibrate) navigator.vibrate([500, 300, 500]);
        } else {
            alertBox.style.display = "none";
        }
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

async function fetchMarineData(lat, lon) {
    try {
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m,wind_direction_10m`).catch(() => null);
        if (weatherRes) {
            const weatherData = await weatherRes.json();
            if (weatherData && weatherData.current) {
                const wSpeed = weatherData.current.wind_speed_10m.toFixed(1);
                const wDirDeg = weatherData.current.wind_direction_10m;
                if (document.getElementById("wind-speed")) document.getElementById("wind-speed").innerText = `${wSpeed} km/h`;
                if (document.getElementById("wind-dir")) document.getElementById("wind-dir").innerText = `🧭 දිශාව: ${wDirDeg}° (${getWindDirectionName(wDirDeg)})`;
            }
        }
    } catch (err) { console.log("Offline mode, marine fetch skipped."); }
}

function getWindDirectionName(degree) {
    if (degree >= 337.5 || degree < 22.5) return "උතුර (N)";
    if (degree >= 22.5 && degree < 67.5) return "ඊසාන (NE)";
    if (degree >= 67.5 && degree < 112.5) return "නැගෙනහිර (E)";
    if (degree >= 112.5 && degree < 157.5) return "ගිනිකොන (SE)";
    if (degree >= 157.5 && degree < 202.5) return "දකුණ (S)";
    if (degree >= 202.5 && degree < 247.5) return "නිරිත (SW)";
    if (degree >= 247.5 && degree < 292.5) return "බටහිර (W)";
    if (degree >= 292.5 && degree < 337.5) return "වයඹ (NW)";
    return "---";
}

function handleGPSError(error) { console.error(error); }
function convertToDMS(decimal) {
    const absVal = Math.abs(decimal);
    const degrees = Math.floor(absVal);
    const minutes = ((absVal - degrees) * 60).toFixed(3);
    return `${degrees}°${minutes}'`;
}
function convertGPS() {
    const inputEl = document.getElementById('convert-input');
    const resultEl = document.getElementById('convert-result');
    if (!inputEl || !resultEl) return;
    const inputValue = parseFloat(inputEl.value);
    if (isNaN(inputValue)) { alert("කරුණාකර නිවැරදි අංකයක් ඇතුළත් කරන්න!"); return; }
    resultEl.innerText = convertToDMS(inputValue);
}
function toggleTheme() { document.body.classList.toggle('light-mode'); }
function toggleNightVision() { document.body.classList.toggle('night-vision-mode'); }
function showBatteryInfo() {
    if (navigator.getBattery) { navigator.getBattery().then(b => alert(`🔋 බැටරි මට්ටම: ${Math.round(b.level * 100)}%`)); }
}
