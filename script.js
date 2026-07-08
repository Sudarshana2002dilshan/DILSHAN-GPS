// ============================================================================
// DILSHAN MARINE GPS - MASTER SCRIPT (FIXED IDs)
// Developer: Sudarshana DILSHAN
// ============================================================================

let watchId = null;
let savedHazards = [];

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. මුලින්ම පෙන්වන්නේ Home (Dashboard) ටැබ් එකයි
    showTab('home');
    
    // 2. Local Storage එකෙන් සේව් කරපු ගල් ලෝඩ් කිරීම
    loadSavedHazards();
    
    // 3. GPS ට්‍රැකින් පටන් ගැනීම
    startTracking();
});

// --- 📱 TAB NAVIGATION SYSTEM ---
window.showTab = (tabId) => {
    document.querySelectorAll('.tab-pane').forEach(panel => {
        panel.classList.remove('active');
    });
    const activePanel = document.getElementById(tabId);
    if (activePanel) activePanel.classList.add('active');
};

// --- 🧭 LIVE GPS TRACKING & CALCULATIONS ---
function startTracking() {
    if (!navigator.geolocation) {
        alert("ඔයාගේ ෆෝන් එකේ GPS වැඩ කරන්නේ නැහැ!");
        return;
    }

    const options = {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
    };

    watchId = navigator.geolocation.watchPosition(updateLocation, handleGPSError, options);
}

function updateLocation(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    
    // ධීවරයන්ට පහසු වීමට වේගය km/h වලින් (SOG)
    const speedKmH = position.coords.speed ? (position.coords.speed * 3.6).toFixed(1) : "0.0";

    // 🎯 ඔයාගේ index.html එකේ තියෙන නිවැරදි ID වලටම ලයිව් දත්ත ඇතුළත් කිරීම
    document.getElementById("lat").innerText = convertToDMS(lat);
    document.getElementById("lon").innerText = convertToDMS(lon);
    document.getElementById("speed").innerText = speedKmH + " km/h";
    document.getElementById("time").innerText = new Date().toLocaleTimeString();

    // ළඟම තියෙන ගල් පරික්ෂා කර ඇලර්ට් දීම
    checkProximityAlerts(lat, lon);
}

function handleGPSError(error) {
    console.error("GPS Error: ", error.message);
}

// --- 🔄 COORDINATES CONVERTER & DMS MATH ---
function convertToDMS(decimal) {
    const absVal = Math.abs(decimal);
    const degrees = Math.floor(absVal);
    const minutes = ((absVal - degrees) * 60).toFixed(3);
    return `${degrees}°${minutes}'`;
}

// Settings පිටුවේ තියෙන බටන් එකෙන් ක්‍රියාත්මක වන Converter එක
window.convertGPS = () => {
    const inputValue = parseFloat(document.getElementById('convert-input').value);
    
    if (isNaN(inputValue)) {
        alert("කරුණාකර නිවැරදි අංකයක් ඇතුළත් කරන්න!");
        return;
    }
    
    const resultText = convertToDMS(inputValue);
    document.getElementById('convert-result').innerText = resultText;
};

// --- 🌙 NIGHT VISION & THEME MANAGEMENT ---
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

// --- 🚨 HAZARDS & PROXIMITY ALERTS ---
function loadSavedHazards() {
    const localData = localStorage.getItem("marine_hazards");
    if (localData) {
        savedHazards = JSON.parse(localData);
    } else {
        savedHazards = [
            { name: "Demo Rock 1", lat: 7.1200, lon: 79.8000 }
        ];
        localStorage.setItem("marine_hazards", JSON.stringify(savedHazards));
    }
}

function checkProximityAlerts(currentLat, currentLon) {
    const alertDistanceKm = 0.5; // මීටර් 500ක් ඇතුලත ආවොත්
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
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// --- 🛠️ ADMIN PANEL & ADD HAZARDS ---
window.openAdmin = () => {
    const password = prompt("ADMIN PASSWORD එක ඇතුළත් කරන්න:");
    if (password === "dilshangps123") {
        document.getElementById("admin-modal").style.display = "block";
    } else {
        alert("වැරදි මුරපදයක්!");
    }
};

window.saveHazard = () => {
    const name = document.getElementById("h-name").value;
    if (!name) { alert("කරුණාකර ගලේ නම ඇතුළත් කරන්න!"); return; }
    
    navigator.geolocation.getCurrentPosition((position) => {
        const newHazard = { name, lat: position.coords.latitude, lon: position.coords.longitude };
        savedHazards.push(newHazard);
        localStorage.setItem("marine_hazards", JSON.stringify(savedHazards));
        alert(`${name} ගල දැනට ඔයා ඉන්න ස්ථානයට සාර්ථකව සේව් වුණා!`);
        document.getElementById("h-name").value = "";
    });
};

window.adminSaveHazard = () => {
    const name = document.getElementById("admin-name").value;
    const lat = parseFloat(document.getElementById("admin-lat").value);
    const lon = parseFloat(document.getElementById("admin-lon").value);

    if (!name || isNaN(lat) || isNaN(lon)) {
        alert("සියලු විස්තර නිවැරදිව ඇතුළත් කරන්න!");
        return;
    }

    const newHazard = { name, lat, lon };
    savedHazards.push(newHazard);
    localStorage.setItem("marine_hazards", JSON.stringify(savedHazards));

    alert(`${name} ගල සිතියමට ඇතුළත් කළා!`);
    document.getElementById("admin-modal").style.display = "none";
};

// --- 🔋 BATTERY INFO ---
window.showBatteryInfo = () => {
    if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
            alert(`🔋 බැටරි මට්ටම: ${Math.round(battery.level * 100)}%\n\nමුහුද මැදදී බැටරිය ඉතිරි කර ගැනීමට Brightness අඩු කරන්න.`);
        });
    } else {
        alert("බැටරි විස්තර ලබාගත නොහැක.");
    }
};
