import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAbCfnQtNWbSznv3OU0THPZSB9VWPv-hOs",
  authDomain: "dilshan-gps.firebaseapp.com",
  projectId: "dilshan-gps",
  storageBucket: "dilshan-gps.firebasestorage.app",
  messagingSenderId: "86804944242",
  appId: "1:86804944242:web:c1c0351d2da5a0d83fb9eb",
  measurementId: "G-SZ44FM7Z42"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let globalHazards = [];
onSnapshot(collection(db, "hazards"), (snapshot) => {
    globalHazards = snapshot.docs.map(doc => doc.data());
});

// Real-time Position & Data Updates
navigator.geolocation.watchPosition((pos) => {
    const { latitude, longitude, speed } = pos.coords;

    // 1. Location & Time
    document.getElementById('lat').innerText = toDMS(latitude, true);
    document.getElementById('lon').innerText = toDMS(longitude, false);
    document.getElementById('time').innerText = new Date().toLocaleTimeString();

    // 2. Speed (Convert m/s to km/h)
    document.getElementById('speed').innerText = ((speed || 0) * 3.6).toFixed(1) + " km/h";

    // 3. Weather API (Wind Speed & Direction)
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=b55f6eb21b285249ea39c2d19af58d88&units=metric`)
    .then(response => response.json())
    .then(data => {
        const speedKmh = (data.wind.speed * 3.6).toFixed(1);
        const dir = getDirection(data.wind.deg);
        document.getElementById('wind-speed').innerText = speedKmh + " km/h";
        document.getElementById('wind-dir').innerText = dir;
    }).catch(() => {
        document.getElementById('wind-speed').innerText = "--";
        document.getElementById('wind-dir').innerText = "--";
    });

    // 4. Hazard Alert System
    checkHazards(latitude, longitude);

}, (err) => console.error(err), { enableHighAccuracy: true });

// Helper: Direction Converter
function getDirection(deg) {
    const dirs = ["උතුරු", "ඊසාන", "නැගෙනහිර", "අග්නිදිග", "දකුණ", "නිරිත", "බටහිර", "වයඹ"];
    return dirs[Math.round(deg / 45) % 8];
}

// Helper: Hazard Detection
function checkHazards(lat, lon) {
    const alertBox = document.getElementById('hazard-alert');
    let found = false;
    globalHazards.forEach(h => {
        const d = Math.sqrt(Math.pow(lat - h.lat, 2) + Math.pow(lon - h.lon, 2)) * 111;
        if (d < 0.8) {
            alertBox.innerHTML = `⚠️ අනතුරුදායකයි: ${h.name} (${d.toFixed(2)} km) වෙත ලංවී ඇත!`;
            alertBox.style.display = "block";
            found = true;
        }
    });
    if (!found) alertBox.style.display = "none";
}

// Helper: DMS Converter
function toDMS(dec, isLat) {
    const abs = Math.abs(dec);
    const deg = Math.floor(abs);
    const min = ((abs - deg) * 60).toFixed(3);
    const dir = isLat ? (dec >= 0 ? 'N' : 'S') : (dec >= 0 ? 'E' : 'W');
    return `${deg}°${min}' ${dir}`;
}

// Global UI Functions
window.showTab = (id) => {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
};

window.toggleTheme = () => document.body.classList.toggle('light-mode');

window.openAdmin = () => {
    const pass = prompt("Admin Password:");
    if (pass === "dilshan123") document.getElementById('admin-modal').style.display = "block";
};

window.adminSaveHazard = async () => {
    const name = document.getElementById('admin-name').value;
    const lat = parseFloat(document.getElementById('admin-lat').value);
    const lon = parseFloat(document.getElementById('admin-lon').value);
    if (name && lat && lon) {
        await addDoc(collection(db, "hazards"), { name, lat, lon });
        alert("සාර්ථකව එකතු විය!");
    }
};

window.saveHazard = async () => {
    const name = document.getElementById('h-name').value;
    navigator.geolocation.getCurrentPosition(async (pos) => {
        await addDoc(collection(db, "hazards"), { name, lat: pos.coords.latitude, lon: pos.coords.longitude });
        alert("මාක් කරන ලදී!");
    });
};
