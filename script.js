// ============================================================================
// DILSHAN MARINE GPS - PRO STABLE PROXIMITY GRADE 2026
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
let deferredPrompt = null; // PWA බටන් එක සඳහා

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    database = firebase.database();
} catch (e) {
    console.error("Firebase Init Error: ", e);
}

let watchId = null;
let savedHazards = {}; 
let lastWeatherFetchTime = 0;
let isAdminAuthenticated = false;

// 📥 App Download Trigger Listener (ෆෝන් එකට ඉන්ස්ටෝල් කරගන්නා බටන් එක සක්‍රීය කිරීම)
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const downloadBtn = document.getElementById('btn-download-app');
    if (downloadBtn) downloadBtn.style.display = 'block';
});

document.addEventListener("DOMContentLoaded", () => {
    // Tab Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-nav'));
            btn.classList.add('active-nav');
            const tabId = btn.getAttribute('data-tab');
            showTab(tabId);
        });
    });

    // Action Buttons
    document.getElementById('btn-save-hazard')?.addEventListener('click', saveHazardToFirebase);
    document.getElementById('btn-theme')?.addEventListener('click', toggleTheme);
    document.getElementById('btn-night')?.addEventListener('click', toggleNightVision);
    document.getElementById('btn-battery')?.addEventListener('click', showBatteryInfo);
    document.getElementById('btn-convert')?.addEventListener('click', convertGPS);
    
    // Download Button Trigger
    document.getElementById('btn-download-app')?.addEventListener('click', triggerAppDownload);
    
    // Admin Buttons
    document.getElementById('btn-login-admin')?.addEventListener('click', handleAdminLogin);
    document.getElementById('btn-logout-admin')?.addEventListener('click', handleAdminLogout);
    document.getElementById('btn-remote-upload')?.addEventListener('click', saveRemoteHazardToFirebase);

    document.getElementById('btn-go-admin')?.addEventListener('click', () => {
        showTab('admin');
        const adminBtn = document.querySelector('[data-tab="admin"]');
        if (adminBtn) {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-nav'));
            adminBtn.classList.add('active-nav');
        }
    });

    if (database) {
        listenToFirebaseHazards();
    }
    startTracking();
});

function showTab(tabId) {
    const panels = document.querySelectorAll('.tab-pane');
    panels.forEach(panel => {
        panel.classList.toggle('active', panel.id === tabId);
    });
}

// 📥 ඩවුන්ලෝඩ් බටන් ක්‍රියාවලිය
function triggerAppDownload() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
        });
    } else {
        // PWA නොවන බ්‍රවුසර් එකකදී හෝ Shortcut එකක් ලෙස Add කරගැනීමට උපදෙස් දීම
        alert("මෙම ඇප් එක ෆෝන් එකේ Home Screen එකට දමා සෘජුවම ඇප් එකක් ලෙස පාවිච්චි කිරීමට, බ්‍රවුසර් එකේ ඉහල ඇති තිත් 3 ක්ලික් කර 'Add to Home Screen' හෝ 'Install App' යන්න තෝරන්න!");
    }
}

function handleAdminLogin() {
    const passInput = document.getElementById("admin-password");
    if (!passInput) return;
    if (passInput.value === ADMIN_SECRET_PASSWORD) {
        isAdminAuthenticated = true;
        document.getElementById("admin-auth-box").style.display = "none";
        document.getElementById("admin-content-box").style.display = "block";
        passInput.value = "";
    } else {
        alert("වැරදි මුද්‍රාපදයක්! නැවත උත්සාහ කරන්න.");
        passInput.value = "";
    }
}

function handleAdminLogout() {
    isAdminAuthenticated = false;
    document.getElementById("admin-auth-box").style.display = "block";
    document.getElementById("admin-content-box").style.display = "none";
}

function listenToFirebaseHazards() {
    database.ref('hazards').on('value', (snapshot) => {
        savedHazards = snapshot.val() || {};
        updateAdminPanel();
    });
}

function startTracking() {
    if (!navigator.geolocation) {
        alert("GPS Hardware නොමැත!");
        return;
    }
    const geoOptions = {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 0
    };
    if (watchId) navigator.geolocation.clearWatch(watchId);
    watchId = navigator.geolocation.watchPosition(updateLocation, handleGPSError, geoOptions);
}

function updateLocation(position) {
    try {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const speedKmH = position.coords.speed && position.coords.speed > 0.4 ? (position.coords.speed * 3.6).toFixed(1) : "0.0";

        document.getElementById("lat").innerText = convertToDMS(lat);
        document.getElementById("lon").innerText = convertToDMS(lon);
        document.getElementById("speed").innerText = speedKmH + " km/h";
        document.getElementById("time").innerText = new Date().toLocaleTimeString();

        const now = Date.now();
        if (now - lastWeatherFetchTime > 180000) { 
            fetchMarineData(lat, lon);
            lastWeatherFetchTime = now;
        }
        checkProximityAlerts(lat, lon);
    } catch (err) {
        console.error(err);
    }
}

async function fetchMarineData(lat, lon) {
    try {
        const fixedLat = lat.toFixed(2);
        const fixedLon = lon.toFixed(2);
        const response = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${fixedLat}&longitude=${fixedLon}&current=ocean_current_velocity,ocean_current_direction`);
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${fixedLat}&longitude=${fixedLon}&current=wind_speed_10m,wind_direction_10m`);
        
        if (response.ok) {
            const marineData = await response.json();
            if (marineData && marineData.current && marineData.current.ocean_current_velocity !== undefined) {
                const cSpeed = marineData.current.ocean_current_velocity.toFixed(2);
                const cDir = marineData.current.ocean_current_direction;
                document.getElementById("current-speed").innerText = `${cSpeed} m/s`;
                document.getElementById("current-dir").innerText = cDir ? `🧭 දිශාව: ${cDir}° (${getWindDirectionName(cDir)})` : "🧭 දිශාව: --";
            }
        }
        if (weatherResponse.ok) {
            const windData = await weatherResponse.json();
            if (windData && windData.current) {
                const wSpeed = windData.current.wind_speed_10m ? windData.current.wind_speed_10m.toFixed(1) : "0.0";
                const wDirDeg = windData.current.wind_direction_10m;
                document.getElementById("wind-speed").innerText = `${wSpeed} km/h`;
                document.getElementById("wind-dir").innerText = wDirDeg ? `🧭 දිශාව: ${wDirDeg}° (${getWindDirectionName(wDirDeg)})` : "--";
            }
        }
    } catch (err) { console.log("Marine server dynamic skip."); }
}

function saveHazardToFirebase() {
    const nameEl = document.getElementById("h-name");
    if (!nameEl || !nameEl.value) { alert("කරුණාකර ගලේ නම ඇතුළත් කරන්න!"); return; }
    navigator.geolocation.getCurrentPosition((position) => {
        database.ref('hazards').push().set({
            name: nameEl.value,
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            timestamp: Date.now()
        }).then(() => { alert(`${nameEl.value} සේව් වුණා!`); nameEl.value = ""; });
    }, () => { alert("GPS ලබාගත නොහැක."); }, { enableHighAccuracy: true });
}

function saveRemoteHazardToFirebase() {
    const nameEl = document.getElementById("remote-name");
    const latEl = document.getElementById("remote-lat");
    const lonEl = document.getElementById("remote-lon");
    if (!nameEl.value || !latEl.value || !lonEl.value) { alert("සියල්ල පුරවන්න!"); return; }
    database.ref('hazards').push().set({
        name: nameEl.value,
        lat: parseFloat(latEl.value),
        lon: parseFloat(lonEl.value),
        timestamp: Date.now()
    }).then(() => { alert("🏠 Remote අප්ලෝඩ් සාර්ථකයි!"); nameEl.value=""; latEl.value=""; lonEl.value=""; });
}

function updateAdminPanel() {
    const countEl = document.getElementById("hazard-count");
    const container = document.getElementById("hazard-list");
    if (!container) return;
    const keys = Object.keys(savedHazards);
    if (countEl) countEl.innerText = keys.length;
    container.innerHTML = "";
    keys.forEach((key, index) => {
        const hazard = savedHazards[key];
        const item = document.createElement("div");
        item.className = "hazard-item";
        item.innerHTML = `
            <div class="hazard-info"><h5>${index + 1}. ${hazard.name}</h5><p>Lat: ${convertToDMS(hazard.lat)} | Lon: ${convertToDMS(hazard.lon)}</p></div>
            <button class="btn-delete-item" data-id="${key}">🗑️</button>
        `;
        container.appendChild(item);
    });
    document.querySelectorAll('.btn-delete-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            if (confirm("මකා දැමීමට අවශ්‍යද?")) database.ref(`hazards/${id}`).remove();
        });
    });
}

function checkProximityAlerts(currentLat, currentLon) {
    const alertDistanceKm = 0.5; 
    let dangerFound = false; let closestRockName = ""; let closestRockLat = ""; let closestRockLon = "";
    Object.keys(savedHazards).forEach(key => {
        const hazard = savedHazards[key];
        if (calculateDistance(currentLat, currentLon, hazard.lat, hazard.lon) <= alertDistanceKm) { 
            dangerFound = true; closestRockName = hazard.name; closestRockLat = convertToDMS(hazard.lat); closestRockLon = convertToDMS(hazard.lon);
        }
    });
    const alertBox = document.getElementById("hazard-alert");
    if (alertBox) {
        if (dangerFound) {
            alertBox.innerHTML = `🚨 අවධානයයි: ${closestRockName} ලඟ ඇත!<br><span style="font-size:14px; font-family:monospace;">(${closestRockLat} | ${closestRockLon})</span>`;
            alertBox.style.display = "block";
            if (navigator.vibrate) navigator.vibrate([500, 300, 500]);
        } else { alertBox.style.display = "none"; }
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; const dLat = (lat2 - lat1) * Math.PI / 180; const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
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
function handleGPSError(error) { console.warn(error.message); }
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
    resultEl.innerText = convertToDMS(parseFloat(inputEl.value));
}
function toggleTheme() { document.body.classList.toggle('light-mode'); }
function toggleNightVision() { document.body.classList.toggle('night-vision-mode'); }
function showBatteryInfo() { if (navigator.getBattery) { navigator.getBattery().then(b => alert(`🔋 බැටරිය: ${Math.round(b.level * 100)}%`)); } }
