import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// ඔබ දුන් Firebase Config එක
const firebaseConfig = {
  apiKey: "AIzaSyAbCfnQtNWbSznv3OU0THPZSB9VWPv-hOs",
  authDomain: "dilshan-gps.firebaseapp.com",
  projectId: "dilshan-gps",
  storageBucket: "dilshan-gps.firebasestorage.app",
  messagingSenderId: "86804944242",
  appId: "1:86804944242:web:c1c0351d2da5a0d83fb9eb",
  measurementId: "G-SZ44FM7Z42"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ගල් පර්වත තත්‍ය කාලීනව ලබා ගැනීමට (Auto-update)
let globalHazards = [];
onSnapshot(collection(db, "hazards"), (snapshot) => {
    globalHazards = snapshot.docs.map(doc => doc.data());
});

// ගලක් මාක් කර Firebase එකට යැවීමට
window.saveHazard = async () => {
    const name = document.getElementById('h-name').value;
    if (!name) { alert("කරුණාකර නමක් ඇතුළත් කරන්න!"); return; }
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            await addDoc(collection(db, "hazards"), {
                name: name,
                lat: pos.coords.latitude,
                lon: pos.coords.longitude,
                timestamp: new Date()
            });
            alert("සාර්ථකව සේව් විය!");
            document.getElementById('h-name').value = '';
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("සේව් කිරීමේදී දෝෂයක් සිදු විය.");
        }
    });
};

// දුර සහ දිශාව ගණනය කිරීම
function getBearing(lat1, lon1, lat2, lon2) {
    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    const brng = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    const dirs = ["උතුරු", "ඊසාන", "නැගෙනහිර", "අග්නිදිග", "දකුණ", "නිරිත", "බටහිර", "වයඹ"];
    return dirs[Math.round(brng / 45) % 8];
}

// DMS ආකෘතිය
function toDMS(dec, isLat) {
    const abs = Math.abs(dec);
    const deg = Math.floor(abs);
    const min = ((abs - deg) * 60).toFixed(3);
    const dir = isLat ? (dec >= 0 ? 'N' : 'S') : (dec >= 0 ? 'E' : 'W');
    return `${deg}°${min}' ${dir}`;
}

// ප්‍රධාන GPS සහ Hazard Watcher
navigator.geolocation.watchPosition((pos) => {
    document.getElementById('lat').innerText = toDMS(pos.coords.latitude, true);
    document.getElementById('lon').innerText = toDMS(pos.coords.longitude, false);
    document.getElementById('time').innerText = new Date().toLocaleTimeString();
    document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1) + " km/h";

    // කාලගුණය (km/h)
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=b55f6eb21b285249ea39c2d19af58d88&units=metric`)
    .then(r => r.json()).then(d => {
        const dirs = ["උතුරු", "ඊසාන", "නැගෙනහිර", "අග්නිදිග", "දකුණ", "නිරිත", "බටහිර", "වයඹ"];
        document.getElementById('wind-info').innerText = `${(d.wind.speed * 3.6).toFixed(1)} km/h - ${dirs[Math.round(d.wind.deg / 45) % 8]}`;
    });

    // Hazard Alert පරීක්ෂාව
    let alertBox = document.getElementById('hazard-alert');
    let found = false;
    globalHazards.forEach(h => {
        let km = Math.sqrt(Math.pow(pos.coords.latitude - h.lat, 2) + Math.pow(pos.coords.longitude - h.lon, 2)) * 111;
        let miles = (km * 0.621371).toFixed(2);
        if (km < 0.8) { 
            alertBox.innerHTML = `⚠️ ${h.name} | දිශාව: ${getBearing(pos.coords.latitude, pos.coords.longitude, h.lat, h.lon)} | ${miles} miles`;
            alertBox.style.display = "block";
            found = true;
        }
    });
    if (!found) alertBox.style.display = "none";
}, null, { enableHighAccuracy: true });

// UI කාර්යයන්
window.showTab = (id) => {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
};
window.toggleTheme = () => document.body.classList.toggle('light-mode');
