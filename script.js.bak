// ============================================================================
// DILSHAN MARINE GPS - ULTRA SAFE CRASH-FREE SCRIPT
// Developer: Sudarshana DILSHAN
// ============================================================================

let watchId = null;
let savedHazards = [];

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. ටැබ් ආරම්භ කිරීම
    initTabs();
    
    // 2. Local Storage එකෙන් සේව් කරපු ගල් ලෝඩ් කිරීම
    loadSavedHazards();
    
    // 3. GPS ට්‍රැකින් පටන් ගැනීම
    startTracking();
});

// --- SAFE NAVIGATION ---
function initTabs() {
    const panels = document.querySelectorAll('.tab-pane');
    panels.forEach(p => p.style.display = 'none');
    
    const homePanel = document.getElementById('home');
    if (homePanel) homePanel.style.display = 'block';
}

window.showTab = (tabId) => {
    const panels = document.querySelectorAll('.tab-pane');
    panels.forEach(panel => {
        if (panel.id === tabId) {
            panel.style.display = 'block';
        } else {
            panel.style.display = 'none';
        }
    });
};

// --- GPS TRACKING ---
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

        // Safe ID Mapping - HTML එකේ ID තිබුණොත් විතරක් වැටේ, ක්‍රෑෂ් නොවේ
        const latEl = document.getElementById("lat");
        const lonEl = document.getElementById("lon");
        const speedEl = document.getElementById("speed");
        const timeEl = document.getElementById("time");

        if (latEl) latEl.innerText = convertToDMS(lat);
        if (lonEl) lonEl.innerText = convertToDMS(lon);
        if (speedEl) speedEl.innerText = speedKmH + " km/h";
        if (timeEl) timeEl.innerText = new Date().toLocaleTimeString();

        checkProximityAlerts(lat, lon);
    } catch (err) {
        console.error("Update Location Error: ", err);
    }
}

function handleGPSError(error) {
    console.error("GPS Error: ", error.message);
}

// --- CONVERTER MATH ---
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
    if (isNaN(inputValue)) {
        alert("කරුණාකර නිවැරදි අංකයක් ඇතුළත් කරන්න!");
        return;
    }
    resultEl.innerText = convertToDMS(inputValue);
};

// --- THEMES ---
window.toggleTheme = () => {
    document.body.classList.toggle('light-mode');
    if(document.body.classList.contains('light-mode')) {
        document.body.classList.remove('night-vision-mode');
    }
};

window.toggleNightVision = () => {
    document.body.classList.toggle('night-vision-mode');
    if(document.body.classList.contains('night-vision-mode')) {
        document.body.classList.remove('light-mode');
    }
};

// --- PROXIMITY SYSTEM ---
function loadSavedHazards() {
    const localData = localStorage.getItem("marine_hazards");
    if (localData) {
        savedHazards = JSON.parse(localData);
    } else {
        savedHazards = [{ name: "Demo Rock 1", lat: 7.1200, lon: 79.8000 }];
        localStorage.setItem("marine_hazards", JSON.stringify(savedHazards));
    }
}

function checkProximityAlerts(currentLat, currentLon) {
    const alertDistanceKm = 0.5;
    let dangerFound = false;
    let closestRockName = "";

    savedHazards.forEach(hazard => {
        const dist = calculateDistance(currentLat, currentLon, hazard.lat, hazard.lon);
        if (dist <= alertDistanceKm) {
            dangerFound = true;
            closestRockName = hazard.name;
        }
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

// --- ADD HAZARDS ---
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

window.openAdmin = () => {
    const password = prompt("ADMIN PASSWORD එක ඇතුළත් කරන්න:");
    if (password === "dilshangps123") {
        const modal = document.getElementById("admin-modal");
        if (modal) modal.style.display = "block";
    } else {
        alert("වැරදි මුරපදයක්!");
    }
};

window.adminSaveHazard = () => {
    const name = document.getElementById("admin-name")?.value;
    const lat = parseFloat(document.getElementById("admin-lat")?.value);
    const lon = parseFloat(document.getElementById("admin-lon")?.value);

    if (!name || isNaN(lat) || isNaN(lon)) { alert("සියලු විස්තර නිවැරදිව ඇතුළත් කරන්න!"); return; }

    savedHazards.push({ name, lat, lon });
    localStorage.setItem("marine_hazards", JSON.stringify(savedHazards));
    alert(`${name} ගල සිතියමට ඇතුළත් කළා!`);
    const modal = document.getElementById("admin-modal");
    if (modal) modal.style.display = "none";
};

window.showBatteryInfo = () => {
    if (navigator.getBattery) {
        navigator.getBattery().then(b => alert(`🔋 බැටරි මට්ටම: ${Math.round(b.level * 100)}%`));
    } else {
        alert("බැටරි විස්තර ලබාගත නොහැක.");
    }
};
