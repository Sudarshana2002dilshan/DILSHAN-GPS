import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 1. Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbCfnQtNWbSznv3OU0THPZSB9VWPv-hOs",
  authDomain: "dilshan-gps.firebaseapp.com",
  projectId: "dilshan-gps",
  storageBucket: "dilshan-gps.firebasestorage.app",
  messagingSenderId: "86804944242",
  appId: "1:86804944242:web:c1c0351d2da5a0d83fb9eb",
  measurementId: "G-SZ44FM7Z42"
};

// 📴 Offline Safety: ඉන්ටර්නෙට් නැතිව ඇප් එක ලෝඩ් වුවහොත් Firebase ක්‍රැෂ් වීම වැළැක්වීම
let db = null;
let globalHazards = [];

try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    
    // Real-time Hazard Database Sync
    onSnapshot(collection(db, "hazards"), (snapshot) => {
        globalHazards = snapshot.docs.map(doc => doc.data());
        // ඔෆ්ලයින් භාවිතය සඳහා ලැබෙන ඩේටා LocalStorage එකේ සේව් කර තබා ගැනීම
        localStorage.setItem('local_hazards', JSON.stringify(globalHazards));
    });
} catch (e) {
    console.log("Firebase Offline Mode Active");
}

// ඉන්ටර්නෙට් නැතිනම් කලින් සේව් කරගත් ගල් (Hazards) ටික මෙතනින් ලෝඩ් වේ
if (globalHazards.length === 0) {
    const localData = localStorage.getItem('local_hazards');
    if (localData) globalHazards = JSON.parse(localData);
}

// 2. Screen Wake Lock (ස්ක්‍රීන් එක ලොක් නොවී තබා ගැනීම)
let wakeLock = null;
async function keepScreenAwake() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log("🔒 Screen Wake Lock Active. Screen won't sleep.");
        }
    } catch (err) {
        console.log("Wake Lock Failed: " + err.message);
    }
}
// ඇප් එක ඔන් වූ සැනින් ස්ක්‍රීන් එක අවදිකර තබා ගැනීම
keepScreenAwake();
// පරිශීලකයා ඇප් එක මිනිමයිස් කර නැවත ආවොත් නැවත ක්‍රියාත්මක කිරීම
document.addEventListener('visibilitychange', () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
        keepScreenAwake();
    }
});


// 3. Location, Speed, Time & Weather Watcher
const options = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 };

navigator.geolocation.watchPosition((pos) => {
    const { latitude, longitude, speed } = pos.coords;

    // UI Updates - Location & Time
    document.getElementById('lat').innerText = toDMS(latitude, true);
    document.getElementById('lon').innerText = toDMS(longitude, false);
    document.getElementById('time').innerText = new Date().toLocaleTimeString();

    // UI Updates - Speed
    document.getElementById('speed').innerText = ((speed || 0) * 3.6).toFixed(1) + " km/h";

    // Weather API Logic (ඉන්ටර්නෙට් ඇත්නම් පමණක් ක්‍රියා කරයි)
    if(navigator.onLine) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=b55f6eb21b285249ea39c2d19af58d88&units=metric`)
        .then(r => r.json())
        .then(data => {
            document.getElementById('wind-speed').innerText = (data.wind.speed * 3.6).toFixed(1) + " km/h";
            document.getElementById('wind-dir').innerText = getDirection(data.wind.deg);
        }).catch(() => {
            document.getElementById('wind-speed').innerText = "--";
            document.getElementById('wind-dir').innerText = "--";
        });
    }

    // Hazard Detection Logic
    checkHazards(latitude, longitude);

}, (err) => console.error("GPS Error: " + err.message), options);


// 4. Helper Functions
function getDirection(deg) {
    const dirs = ["උතුරු", "ඊසාන", "නැගෙනහිර", "අග්නිදිග", "දකුණ", "නිරිත", "බටහිර", "වයඹ"];
    return dirs[Math.round(deg / 45) % 8];
}

function toDMS(dec, isLat) {
    const abs = Math.abs(dec);
    const deg = Math.floor(abs);
    const min = ((abs - deg) * 60).toFixed(3);
    const dir = isLat ? (dec >= 0 ? 'N' : 'S') : (dec >= 0 ? 'E' : 'W');
    return `${deg}°${min}' ${dir}`;
}

// ⚠️ අනතුරු හැඟවීම් සහ ගලේ නම පැහැදිලිව පෙන්වීම
function checkHazards(lat, lon) {
    const alertBox = document.getElementById('hazard-alert');
    let found = false;
    globalHazards.forEach(h => {
        const d = Math.sqrt(Math.pow(lat - h.lat, 2) + Math.pow(lon - h.lon, 2)) * 111;
        if (d < 0.8) { // මීටර් 800 ක් ඇතුලත නම්
            alertBox.innerHTML = `⚠️ අනතුරක් ලඟයි: "${h.name}" ගල අසල ඇත! <br> දුර: ${d.toFixed(3)} KM`;
            alertBox.style.display = "block";
            found = true;
        }
    });
    if (!found) alertBox.style.display = "none";
}


// 5. Admin & Global UI Controls
window.showTab = (id) => {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
};

window.toggleTheme = () => document.body.classList.toggle('light-mode');

// බැටරි සේවිං නිසා ජීපීඑස් කැපී යාම වැළැක්වීමට උපදෙස් බටන් එක
window.showBatteryInfo = () => {
    alert("💡 මුහුදේදී GPS ඩේටා කැපී යාම වැලැක්වීමට:\n\n1. ෆෝන් එකේ Settings -> Apps වෙත යන්න.\n2. මෙම ඇප් එක (DILSHAN MARINE GPS) තෝරන්න.\n3. Battery / Battery Saver එක 'No Restrictions' (සීමා රහිත) කරන්න.");
};

window.openAdmin = () => {
    const pass = prompt("Enter Admin Password:");
    if (pass === "dilshan123") {
        document.getElementById('admin-modal').style.display = "block";
    } else {
        alert("වැරදි මුරපදයකි!");
    }
};

window.adminSaveHazard = async () => {
    if(!db) return alert("ඉන්ටර්නෙට් නොමැතිව අප්ලෝඩ් කල නොහැක!");
    const name = document.getElementById('admin-name').value;
    const lat = parseFloat(document.getElementById('admin-lat').value);
    const lon = parseFloat(document.getElementById('admin-lon').value);
    if (name && !isNaN(lat) && !isNaN(lon)) {
        await addDoc(collection(db, "hazards"), { name, lat, lon });
        alert("සාර්ථකයි!");
        document.getElementById('admin-modal').style.display = "none";
    }
};

window.saveHazard = async () => {
    if(!db) return alert("Offline අවස්ථාවලදී සේව් කල නොහැක!");
    const name = document.getElementById('h-name').value;
    if(!name) return alert("නමක් ඇතුළත් කරන්න!");
    navigator.geolocation.getCurrentPosition(async (pos) => {
        await addDoc(collection(db, "hazards"), { name, lat: pos.coords.latitude, lon: pos.coords.longitude });
        alert("සාර්ථකයි!");
    });
};
