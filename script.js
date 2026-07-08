// ============================================================================
// DILSHAN MARINE GPS - ULTRA ACCURATE MARINE SCRIPT
// Developer: Sudarshana DILSHAN
// ============================================================================

let watchId = null;
let savedHazards = [];
let lastWeatherFetchTime = 0;

document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    loadSavedHazards();
    startTracking();
});

function initTabs() {
    const panels = document.querySelectorAll('.tab-pane');
    panels.forEach(p => p.style.display = 'none');
    const homePanel = document.getElementById('home');
    if (homePanel) homePanel.style.display = 'block';
}

window.showTab = (tabId) => {
    const panels = document.querySelectorAll('.tab-pane');
    panels.forEach(panel => {
        panel.style.display = (panel.id === tabId) ? 'block' : 'none';
    });
};

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

        // විනාඩි 5කට වරක් ලයිව් මුහුදු දත්ත ලබාගැනීම
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

// ලයිව් සුළඟ සහ දියවැල් දත්ත ලබාගන්නා ක්‍රියාවලිය
async function fetchMarineData(lat, lon) {
    try {
        // 1. සුළඟේ වේගය ලබාගැනීම
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m,wind_direction_10m`);
        const weatherData = await weatherRes.json();
        if (weatherData && weatherData.current) {
            const wSpeed = weatherData.current.wind_speed_10m.toFixed(1);
            const wDirDeg = weatherData.current.wind_direction_10m;
            
            const wSpeedEl = document.getElementById("wind-speed");
            const wDirEl = document.getElementById("wind-dir");
            
            if (wSpeedEl) wSpeedEl.innerText = `${wSpeed} km/h`;
            if (wDirEl) wDirEl.innerText = `🧭 සුළඟේ දිශාව: ${wDirDeg}° (${getWindDirectionName(wDirDeg)})`;
        }

        // 2. දියකඩ (Wave/Current) ලබාගැනීම
        const marineRes = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction`);
        const marineData = await marineRes.json();
        if (marineData && marineData.current) {
            const cSpeed = (marineData.current.wave_height * 0.45).toFixed(2);
            const cDirDeg = marineData.current.wave_direction || 0;
            
            const cSpeedEl = document.getElementById("current-speed");
            const cDirEl = document.getElementById("current-dir");
            
            if (cSpeedEl) cSpeedEl.innerText = `${cSpeed} m/s`;
            if (cDirEl) cDirEl.innerText = `🧭 දියකඩ දිශාව: ${cDirDeg}° (${getWindDirectionName(cDirDeg)})`;
        }
    } catch (err) {
        console.log("Offline mode or fetch failed.");
    }
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

window.convertGPS = () => {
    const inputEl = document.getElementById('convert-input');
    const resultEl = document.getElementById('convert-result');
    if (!inputEl || !resultEl) return;
    const inputValue = parseFloat(inputEl.value);
    if (isNaN(inputValue)) { alert("කරුණාකර නිවැරදි අංකයක් ඇතුළත් කරන්න!"); return; }
    resultEl.innerText = convertToDMS(inputValue);
};

window.toggleTheme = () => { document.body.classList.toggle('light-mode'); };
window.toggleNightVision = () => { document.body.classList.toggle('night-vision-mode'); };

function loadSavedHazards() {
    const localData = localStorage.getItem("marine_hazards");
    if (localData) savedHazards = JSON.parse(localData);
}

function checkProximityAlerts(currentLat, currentLon) {
    const alertDistanceKm = 0.5;
    let dangerFound = false;
    let closestRockName = "";

    savedHazards.forEach(hazard => {
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

window.saveHazard = () => {
    const nameEl = document.getElementById("h-name");
    if (!nameEl || !nameEl.value) { alert("කරුණාකර ගලේ නම ඇතුළත් කරන්න!"); return; }
    navigator.geolocation.getCurrentPosition((position) => {
        savedHazards.push({ name: nameEl.value, lat: position.coords.latitude, lon: position.coords.longitude });
        localStorage.setItem("marine_hazards", JSON.stringify(savedHazards));
        alert(`${nameEl.value} ගල සාර්ථකව සේව් වුණා!`);
        nameEl.value = "";
    });
};

window.showBatteryInfo = () => {
    if (navigator.getBattery) { navigator.getBattery().then(b => alert(`🔋 බැටරි මට්ටම: ${Math.round(b.level * 100)}%`)); }
};
