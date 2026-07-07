// ============================================================================
// DILSHAN MARINE GPS - MASTER SCRIPT
// Developer: Sudarshana DILSHAN
// Features: Live Tracking, Marine Hazards Alerts, Night Vision, GPS Converter
// ============================================================================

// --- GLOBAL VARIABLES & STATE ---
let watchId = null;
let savedHazards = [];
let db = null; // Firebase Reference (If used)

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. මුලින්ම පෙන්වන්නේ Dashboard ටැබ් එක
    showTab('dashboard');
    
    // 2. Local Storage එකෙන් සේව් කරපු ගල් (Hazards) ලෝඩ් කිරීම
    loadSavedHazards();
    
    // 3. GPS ට්‍රැකින් පටන් ගැනීම
    startTracking();
});

// --- 📱 TAB NAVIGATION SYSTEM ---
window.showTab = (tabId) => {
    // සියලුම ටැබ් පැනල් හංගන්න
    document.querySelectorAll('.tab-pane').forEach(panel => {
        panel.classList.remove('active');
    });
    // සියලුම බටන්ස් වල ඇක්ටිව් ගතිය අයින් කරන්න
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // තෝරාගත් ටැබ් එක පෙන්වන්න
    const activePanel = document.getElementById(tabId);
    if (activePanel) activePanel.classList.add('active');

    // තෝරාගත් බටන් එක හයිලයිට් කරන්න
    const activeBtn = document.querySelector(`[onclick="showTab('${tabId}')"]`);
    if (activeBtn) activeBtn.classList.add('active');
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
    const speedKnots = position.coords.speed ? (position.coords.speed * 1.94384).toFixed(1) : "0.0";
    const heading = position.coords.heading ? Math.round(position.coords.heading) : null;

    // 1. UI එකට දත්ත යාවත්කාලීන කිරීම (Decimal -> DMS පරිවර්තනය කර පෙන්වීම)
    document.getElementById("lat-display").innerText = convertToDMS(lat);
    document.getElementById("lon-display").innerText = convertToDMS(lon);
    document.getElementById("speed-display").innerText = speedKnots;
    
    if (heading !== null) {
        document.getElementById("course-display").innerText = `${heading}°`;
    } else {
        document.getElementById("course-display").innerText = "---";
    }

    // 2. ළඟම තියෙන ගල් (Hazards) පරික්ෂා කර ඇලර්ට් දීම
    checkProximityAlerts(lat, lon);
}

function handleGPSError(error) {
    console.error("GPS Error: ", error.message);
    // වැරැද්දක් ආවත් ඇප් එක ක්‍රෑෂ් නොවී පරණ දත්ත හෝ මැසේජ් එකක් පෙන්වයි
}

// --- 🔄 COORDINATES CONVERTER & DMS MATH ---
// Decimal Degrees (7.12345) -> Degrees Minutes (7°7.407') වලට හරවන ෆන්ක්ෂන් එක
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
        alert("කරුණාකර නිවැරදි අංකයක් (Decimal Number) ඇතුළත් කරන්න!");
        return;
    }
    
    const resultText = convertToDMS(inputValue);
    document.getElementById('convert-result').innerText = resultText;
};

// --- 🌙 NIGHT VISION & THEME MANAGEMENT ---
window.toggleTheme = () => {
    // සාමාන්‍ย Light / Dark මාරු කිරීම
    document.body.classList.toggle('light-mode');
    if(document.body.classList.contains('light-mode')) {
        document.body.classList.remove('night-vision-mode');
    }
};

window.toggleNightVision = () => {
    // මුළු ඇප් එකම තද රතු සහ කළු කරන Night Vision එක On/Off කිරීම
    document.body.classList.toggle('night-vision-mode');
    
    // Night vision ඔන් නම් Light mode එක අයින් කරනවා කෝඩ් පැටලෙන්නේ නැති වෙන්න
    if(document.body.classList.contains('night-vision-mode')) {
        document.body.classList.remove('light-mode');
    }
};

// --- 🚨 HAZARDS & PROXIMITY ALERTS (LOCAL / ADMIN) ---
function loadSavedHazards() {
    // LocalStorage එකෙන් කලින් සේව් කරපු ගල් ටික ගන්නවා
    const localData = localStorage.getItem("marine_hazards");
    if (localData) {
        savedHazards = JSON.parse(localData);
    } else {
        // කිසිවක් නැත්නම් මූලික ඩෙමෝ ගලක් ඇතුලත් කිරීම
        savedHazards = [
            { name: "Demo Rock 1", lat: 7.1200, lon: 79.8000 }
        ];
        localStorage.setItem("marine_hazards", JSON.stringify(savedHazards));
    }
}

function checkProximityAlerts(currentLat, currentLon) {
    const alertDistanceKm = 0.5; // මීටර් 500ක් ඇතුලත ආවොත් ඇලර්ට් වෙනවා
    let dangerFound = false;
    let closestRockName = "";

    savedHazards.forEach(hazard => {
        const dist = calculateDistance(currentLat, currentLon, hazard.lat, hazard.lon);
        if (dist <= alertDistanceKm) {
            dangerFound = true;
            closestRockName = hazard.name;
        }
    });

    const alertBox = document.getElementById("danger-alert");
    if (alertBox) {
        if (dangerFound) {
            alertBox.innerText = `🚨 අවධානයයි: ${closestRockName} ගල ආසන්නයේ ඇත!`;
            alertBox.style.display = "block";
            // ෆෝන් එක වයිබ්‍රේට් කිරීම (සපෝට් කරන බ්‍රවුසර්ස් වල)
            if (navigator.vibrate) navigator.vibrate([500, 300, 500]);
        } else {
            alertBox.style.display = "none";
        }
    }
}

// Haversine Formula (GPS ලක්ෂ්‍ය දෙකක් අතර දුර කිලෝමීටර් වලින් සෙවීම)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // පෘථිවියේ අරය (Km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// --- 🛠️ ADMIN PANEL FUNCTIONS ---
window.openAdmin = () => {
    const password = prompt("ADMIN PASSWORD එක ඇතුළත් කරන්න:");
    if (password === "dilshangps123") { // ඔයාට කැමති පාස්වර්ඩ් එකක් දාන්න මල්ලි
        document.getElementById("admin-modal").style.display = "block";
    } else {
        alert("වැරදි මුරපදයක්!");
    }
};

window.adminSaveHazard = () => {
    const name = document.getElementById("admin-name").value;
    const lat = parseFloat(document.getElementById("admin-lat").value);
    const lon = parseFloat(document.getElementById("admin-lon").value);

    if (!name || isNaN(lat) || isNaN(lon)) {
        alert("කරුණාකර සියලු විස්තර නිවැරදිව ඇතුළත් කරන්න!");
        return;
    }

    const newHazard = { name, lat, lon };
    savedHazards.push(newHazard);
    localStorage.setItem("marine_hazards", JSON.stringify(savedHazards));

    alert(`${name} ගල සාර්ථකව මැප් එකට ඇතුළත් කළා!`);
    
    // Fields හිස් කිරීම
    document.getElementById("admin-name").value = "";
    document.getElementById("admin-lat").value = "";
    document.getElementById("admin-lon").value = "";
    document.getElementById("admin-modal").style.display = "none";
};

// --- 🔋 ADDITIONAL UTILITIES ---
window.showBatteryInfo = () => {
    if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
            const level = Math.round(battery.level * 100);
            alert(`🔋 බැටරි මට්ටම: ${level}%\n\nමුහුද මැදදී බැටරිය ඉතිරි කර ගැනීමට ෆෝන් එකේ Brightness අඩු කර 'Screen Timeout' කාලය වැඩි කරන්න.`);
        });
    } else {
        alert("බැටරි විස්තර ලබාගත නොහැක. කරුණාකර ෆෝන් එකේ සෙටින්ග්ස් පරීක්ෂා කරන්න.");
    }
};
