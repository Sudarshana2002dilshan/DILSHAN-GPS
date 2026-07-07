// පෙර ලෙසම Firebase Config එක දමන්න
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

// Wind & UI Update
navigator.geolocation.watchPosition((pos) => {
    document.getElementById('lat').innerText = toDMS(pos.coords.latitude, true);
    document.getElementById('lon').innerText = toDMS(pos.coords.longitude, false);
    document.getElementById('time').innerText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1) + " km/h";
    
    // Wind Info Fetch
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=b55f6eb21b285249ea39c2d19af58d88&units=metric`)
    .then(r => r.json()).then(d => {
        const dirs = ["උතුරු", "ඊසාන", "නැගෙනහිර", "අග්නිදිග", "දකුණ", "නිරිත", "බටහිර", "වයඹ"];
        document.getElementById('wind-speed').innerText = (d.wind.speed * 3.6).toFixed(1) + " km/h";
        document.getElementById('wind-dir').innerText = dirs[Math.round(d.wind.deg / 45) % 8];
    });
});

// Tab & Theme Logic
window.showTab = (id) => {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
};
window.toggleTheme = () => document.body.classList.toggle('light-mode');
// අනික් සියලුම functions පෙර පරිදිම තබාගන්න.
