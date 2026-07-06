// --- 1. ටැබ් මාරු කිරීමේ ක්‍රියාවලිය ---
function showTab(id) {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// --- 2. Dark/Light Mode මාරු කිරීම ---
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}

// --- 3. Offline දත්ත ලෝඩ් කිරීම (අන්තිම ස්ථානය) ---
window.onload = () => {
    document.getElementById('lat').innerText = localStorage.getItem('lastLat') || "---";
    document.getElementById('lon').innerText = localStorage.getItem('lastLon') || "---";
    document.getElementById('time').innerText = localStorage.getItem('lastTime') || "--:--:--";
};

// --- 4. GPS සහ කාලගුණ දත්ත යාවත්කාලීන කිරීම ---
const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

navigator.geolocation.watchPosition((pos) => {
    const latStr = pos.coords.latitude.toFixed(4) + " N";
    const lonStr = pos.coords.longitude.toFixed(4) + " E";
    const timeStr = new Date().toLocaleTimeString();
    const speedKmh = (pos.coords.speed * 3.6 || 0).toFixed(1);

    // UI එකට දත්ත යාවත්කාලීන කිරීම
    document.getElementById('lat').innerText = latStr;
    document.getElementById('lon').innerText = lonStr;
    document.getElementById('time').innerText = timeStr;
    document.getElementById('speed').innerText = speedKmh;

    // Offline සඳහා දත්ත සුරැකීම (LocalStorage)
    localStorage.setItem('lastLat', latStr);
    localStorage.setItem('lastLon', lonStr);
    localStorage.setItem('lastTime', timeStr);

    // කාලගුණ දත්ත ලබා ගැනීම (OpenWeatherMap)
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=b55f6eb21b285249ea39c2d19af58d88&units=metric`)
    .then(r => r.json())
    .then(d => {
        document.getElementById('wind-speed').innerText = (d.wind.speed * 3.6).toFixed(1) + " km/h";
        
        // සිංහල දිශාවන්
        const dirs = ["උතුරු", "ඊසාන", "නැගෙනහිර", "අග්නිදිග", "දකුණ", "නිරිත", "බටහිර", "වයඹ"];
        const dirIndex = Math.round(d.wind.deg / 45) % 8;
        document.getElementById('wind-dir').innerText = dirs[dirIndex];
    })
    .catch(err => console.log("කාලගුණ දත්ත ලබා ගත නොහැක"));

}, (err) => {
    console.error("GPS දෝෂයක් සිදුවිය: ", err);
}, options);

// --- 5. Service Worker ලියාපදිංචිය (Offline Support) ---
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
    .then(() => console.log("Service Worker සාර්ථකව ලියාපදිංචි විය."))
    .catch((err) => console.log("Service Worker දෝෂය: ", err));
}
