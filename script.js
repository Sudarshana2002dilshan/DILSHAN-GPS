import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAbCfnQtNWbSznv3OU0THPZSB9VWPv-hOs",
  authDomain: "dilshan-gps.firebaseapp.com",
  projectId: "dilshan-gps",
  storageBucket: "dilshan-gps.firebasestorage.app",
  messagingSenderId: "86804944242",
  appId: "1:86804944242:web:c1c0351d2da5a0d83fb9eb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let globalHazards = [];
onSnapshot(collection(db, "hazards"), (snapshot) => {
    globalHazards = snapshot.docs.map(doc => doc.data());
});

async function saveHazard() {
    const name = document.getElementById('h-name').value;
    navigator.geolocation.getCurrentPosition(async (pos) => {
        await addDoc(collection(db, "hazards"), {
            name: name,
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
        });
        alert("සාර්ථකව Cloud එකට සේව් විය!");
        document.getElementById('h-name').value = '';
    });
}
window.saveHazard = saveHazard; // HTML බොත්තම සඳහා

function getBearing(lat1, lon1, lat2, lon2) {
    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    const brng = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    const dirs = ["උතුරු", "ඊසාන", "නැගෙනහිර", "අග්නිදිග", "දකුණ", "නිරිත", "බටහිර", "වයඹ"];
    return dirs[Math.round(brng / 45) % 8];
}

function toDMS(dec, isLat) {
    const abs = Math.abs(dec);
    const deg = Math.floor(abs);
    const min = ((abs - deg) * 60).toFixed(3);
    const dir = isLat ? (dec >= 0 ? 'N' : 'S') : (dec >= 0 ? 'E' : 'W');
    return `${deg}°${min}' ${dir}`;
}

navigator.geolocation.watchPosition((pos) => {
    document.getElementById('lat').innerText = toDMS(pos.coords.latitude, true);
    document.getElementById('lon').innerText = toDMS(pos.coords.longitude, false);
    document.getElementById('speed').innerText = (pos.coords.speed * 1.94384 || 0).toFixed(1) + " knots";
    document.getElementById('time').innerText = new Date().toLocaleTimeString();

    let alertBox = document.getElementById('hazard-alert');
    let found = false;
    globalHazards.forEach(h => {
        let km = Math.sqrt(Math.pow(pos.coords.latitude - h.lat, 2) + Math.pow(pos.coords.longitude - h.lon, 2)) * 111;
        let miles = (km * 0.621371).toFixed(3);
        if (km < 0.8) { 
            alertBox.innerHTML = `⚠️ ${h.name} | දිශාව: ${getBearing(pos.coords.latitude, pos.coords.longitude, h.lat, h.lon)} | දුර: ${miles} miles`;
            alertBox.style.display = "block";
            found = true;
        }
    });
    if (!found) alertBox.style.display = "none";
}, null, { enableHighAccuracy: true });

function showTab(id) {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
window.showTab = showTab;
