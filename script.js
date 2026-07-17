// ============================================================================
// DILSHAN MARINE GPS - ULTIMATE PRO HYBRID 2026
// Developer: Sudarshana DILSHAN | WhatsApp: 0765529447
// ============================================================================

const firebaseConfig = {
  apiKey: "AIzaSyAbCfnQtNWbSznv3OU0THPZSB9VWPv-hOs",
  authDomain: "dilshan-gps.firebaseapp.com",
  projectId: "dilshan-gps",
  storageBucket: "dilshan-gps.firebasestorage.app",
  messagingSenderId: "86804944242",
  appId: "1:86804944242:web:c1c0351d2da5a0d83fb9eb",
  measurementId: "G-SZ44FM7Z42"
};

const ADMIN_SECRET_PASSWORD = "DILSHANGPSADMIN"; 

let database = null;
let deferredPrompt = null;
let watchId = null;
let savedHazards = {}; 
let lastWeatherFetchTime = 0;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker Registered'))
            .catch(err => console.warn('SW failed', err));
    });
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const downloadBtn = document.getElementById('btn-download-app');
    if (downloadBtn) downloadBtn.style.display = 'block';
});

document.addEventListener("DOMContentLoaded", () => {
    try {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        database = firebase.database();
    } catch (e) { console.error("Firebase Connection Error", e); }

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-nav'));
            btn.classList.add('active-nav');
            showTab(btn.getAttribute('data-tab'));
        });
    });

    document.getElementById('btn-save-hazard')?.addEventListener('click', saveHazardToFirebase);
    document.getElementById('btn-theme')?.addEventListener('click', toggleTheme);
    document.getElementById('btn-night')?.addEventListener('click', toggleNightVision);
    document.getElementById('btn-battery')?.addEventListener('click', showBatteryInfo);
    document.getElementById('btn-convert')?.addEventListener('click', convertGPS);
    document.getElementById('btn-download-app')?.addEventListener('click', triggerAppDownload);
    document.getElementById('btn-login-admin')?.addEventListener('click', handleAdminLogin);
    document.getElementById('btn-logout-admin')?.addEventListener('click', handleAdminLogout);
    document.getElementById('btn-remote-upload')?.addEventListener('click', saveRemoteHazardToFirebase);

    document.getElementById('btn-go-admin')?.addEventListener('click', () => {
        showTab('admin');
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-nav'));
        document.querySelector('[data-tab="admin"]')?.classList.add('active-nav');
    });

    if (database) listenToFirebaseHazards();
    startTracking();
});

function showTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(panel => {
        panel.classList.toggle('active', panel.id === tabId);
    });
}

function triggerAppDownload() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choice) => {
            if (choice.outcome === 'accepted') deferredPrompt = null;
        });
    } else {
        alert("බ්‍රවුසර් එකේ Options (තිත් 3) ක්ලික් කර 'Install' හෝ 'Add to Home Screen' තෝරන්න.");
    }
}

function startTracking() {
    if (!navigator.geolocation) {
        alert("GPS Hardware නොමැත හෝ ක්‍රියා විරහිතයි!");
        return;
    }
    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
    if (watchId) navigator.geolocation.clearWatch(watchId);
    watchId = navigator.geolocation.watchPosition(updateLocation, handleGPSError, options);
}

function updateLocation(position) {
    const signalTag = document.getElementById("signal-status");
    const acc = position.coords.accuracy;

    if (signalTag) {
        if (acc <= 15) {
            signalTag.innerText = `📡 GPS SIGNAL: EXCELLENT (Acc: ${acc.toFixed(0)}m)`;
            signalTag.className = "signal-tag status-good";
        } else {
            signalTag.innerText = `📡 GPS SIGNAL: POOR (Acc: ${acc.toFixed(0)}m)`;
            signalTag.className = "signal-tag status-bad";
        }
    }

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const speed = position.coords.speed && position.coords.speed > 0.3 ? (position.coords.speed * 3.6).toFixed(1) : "0.0";
    
    // 🛠️ FIXED BUG: Safe Heading Check
    const heading = position.coords.heading;
    if (heading !== null && heading !== undefined && !isNaN(heading)) {
        const currentKnots = position.coords.speed ? (position.coords.speed * 0.514).toFixed(2) : "0.00";
        document.getElementById("current-speed").innerText = `${currentKnots} m/s`;
        document.getElementById("current-dir").innerText = `🧭 දිශාව: ${heading.toFixed(0)}° (${getWindDirectionName(heading)})`;
    }

    document.getElementById("lat").innerText = convertToDMS(lat);
    document.getElementById("lon").innerText = convertToDMS(lon);
    document.getElementById("speed").innerText = `${speed} km/h`;
    document.getElementById("time").innerText = new Date().toLocaleTimeString();

    const now = Date.now();
    if (now - lastWeatherFetchTime > 300000) { // 5 mins cache
        fetchMarineData(lat, lon);
        lastWeatherFetchTime = now;
    }
    checkProximityAlerts(lat, lon);
}

async function fetchMarineData(lat, lon) {
    try {
        const l1 = lat.toFixed(2); const l2 = lon.toFixed(2);
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${l1}&longitude=${l2}&current=wind_speed_10m,wind_direction_10m,ocean_current_velocity,ocean_current_direction`);
        if (res.ok) {
            const data = await res.json();
            if(data.current) {
                if(data.current.wind_speed_10m !== undefined) {
                    document.getElementById("wind-speed").innerText = `${data.current.wind_speed_10m.toFixed(1)} km/h`;
                    document.getElementById("wind-dir").innerText = `🧭 දිශාව: ${data.current.wind_direction_10m}° (${getWindDirectionName(data.current.wind_direction_10m)})`;
                }
                // Backup Ocean Current API integration if heading fails
                if(data.current.ocean_current_velocity !== undefined && document.getElementById("current-speed").innerText === "-- m/s") {
                    document.getElementById("current-speed").innerText = `${data.current.ocean_current_velocity.toFixed(2)} m/s`;
                    document.getElementById("current-dir").innerText = `🧭 දිශාව: ${data.current.ocean_current_direction}° (${getWindDirectionName(data.current.ocean_current_direction)})`;
                }
            }
        }
    } catch (e) { console.log("Network skip."); }
}

function checkProximityAlerts(cLat, cLon) {
    const radius = 0.5; 
    let alertActive = false; let rockName = "";
    
    Object.keys(savedHazards).forEach(k => {
        const h = savedHazards[k];
        if (calculateDistance(cLat, cLon, h.lat, h.lon) <= radius) {
            alertActive = true; rockName = h.name;
        }
    });

    const box = document.getElementById("hazard-alert");
    if (box) {
        if (alertActive) {
            box.innerHTML = `🚨 අවධානයයි: ${rockName} ඉතා ආසන්නයේ ඇත!`;
            box.style.display = "block";
            document.body.classList.add("danger-blink");
            if (navigator.vibrate) navigator.vibrate([400, 200, 400]);
        } else {
            box.style.display = "none";
            document.body.classList.remove("danger-blink");
        }
    }
}

function calculateDistance(la1, lo1, la2, lo2) {
    const R = 6371; const dLat = (la2 - la1) * Math.PI / 180; const dLon = (lo2 - lo1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(la1 * Math.PI / 180) * Math.cos(la2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function convertToDMS(decimal) {
    const abs = Math.abs(decimal);
    const d = Math.floor(abs);
    const m = ((abs - d) * 60).toFixed(3);
    return `${d}° ${m}'`;
}

function convertGPS() {
    const val = parseFloat(document.getElementById('convert-input').value);
    if(!isNaN(val)) document.getElementById('convert-result').innerText = convertToDMS(val);
}

function saveHazardToFirebase() {
    const name = document.getElementById("h-name").value;
    if (!name) { alert("නම ඇතුළත් කරන්න!"); return; }
    navigator.geolocation.getCurrentPosition(p => {
        database.ref('hazards').push().set({ name, lat: p.coords.latitude, lon: p.coords.longitude, timestamp: Date.now() });
        alert("ගල සාර්ථකව සේව් වුණා!"); document.getElementById("h-name").value = "";
    }, () => alert("GPS දත්ත ලබාගත නොහැක!"), { enableHighAccuracy: true });
}

function saveRemoteHazardToFirebase() {
    const name = document.getElementById("remote-name").value;
    const lat = parseFloat(document.getElementById("remote-lat").value);
    const lon = parseFloat(document.getElementById("remote-lon").value);
    if (!name || isNaN(lat) || isNaN(lon)) { alert("සියලු ක්ෂේත්‍ර පුරවන්න!"); return; }
    database.ref('hazards').push().set({ name, lat, lon, timestamp: Date.now() });
    alert("සාර්ථකව අප්ලෝඩ් කලා!");
    document.getElementById("remote-name").value = ""; document.getElementById("remote-lat").value = ""; document.getElementById("remote-lon").value = "";
}

function listenToFirebaseHazards() {
    database.ref('hazards').on('value', snapshot => {
        savedHazards = snapshot.val() || {};
        updateAdminPanel();
    });
}

function updateAdminPanel() {
    const container = document.getElementById("hazard-list");
    if (!container) return;
    const keys = Object.keys(savedHazards);
    document.getElementById("hazard-count").innerText = keys.length;
    container.innerHTML = "";
    keys.forEach((k, idx) => {
        const h = savedHazards[k];
        const div = document.createElement("div");
        div.className = "hazard-item";
        div.innerHTML = `<div><h5>${idx+1}. ${h.name}</h5><p>${convertToDMS(h.lat)} | ${convertToDMS(h.lon)}</p></div><button class="btn-delete-item" onclick="deleteHazard('${k}')">🗑️</button>`;
        container.appendChild(div);
    });
}

window.deleteHazard = function(key) {
    if (confirm("ඉවත් කිරීමට අවශ්‍යද?")) database.ref(`hazards/${key}`).remove();
}

function handleAdminLogin() {
    if (document.getElementById("admin-password").value === ADMIN_SECRET_PASSWORD) {
        document.getElementById("admin-auth-box").style.display = "none";
        document.getElementById("admin-content-box").style.display = "block";
    } else { alert("මුරපදය වැරදියි!"); }
}
function handleAdminLogout() {
    document.getElementById("admin-auth-box").style.display = "block";
    document.getElementById("admin-content-box").style.display = "none";
}

function getWindDirectionName(deg) {
    if (deg >= 337.5 || deg < 22.5) return "උතුර (N)"; if (deg >= 22.5 && deg < 67.5) return "ඊසාන (NE)";
    if (deg >= 67.5 && deg < 112.5) return "නැගෙනහිර (E)"; if (deg >= 112.5 && deg < 157.5) return "ගිනිකොන (SE)";
    if (deg >= 157.5 && deg < 202.5) return "දකුණ (S)"; if (deg >= 202.5 && deg < 247.5) return "නිරිත (SW)";
    if (deg >= 247.5 && deg < 292.5) return "බටහිර (W)"; return "වයඹ (NW)";
}
function toggleTheme() { document.body.classList.toggle('light-mode'); }
function toggleNightVision() { document.body.classList.toggle('night-vision-mode'); }
function showBatteryInfo() { if (navigator.getBattery) navigator.getBattery().then(b => alert(`🔋 බැටරි මට්ටම: ${Math.round(b.level * 100)}%`)); }
function handleGPSError(e) { 
    console.warn(e.message);
    const signalTag = document.getElementById("signal-status");
    if(signalTag) {
        signalTag.innerText = "📡 GPS ERROR: PLEASE ENABLE LOCATION/GPS硬件";
        signalTag.className = "signal-tag status-bad";
    }
}
