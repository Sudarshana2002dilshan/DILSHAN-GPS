// 1. ටැබ් මාරු කිරීමේ කාර්යය
function showTab(id) {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// 2. Dark/Light Mode මාරු කිරීම
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}

// 3. DMS ආකෘතියට හැරවීමේ ක්‍රමය
function convertToDMS(decimal, isLat) {
    const abs = Math.abs(decimal);
    const degrees = Math.floor(abs);
    const minutes = ((abs - degrees) * 60).toFixed(3);
    const direction = isLat ? (decimal >= 0 ? 'N' : 'S') : (decimal >= 0 ? 'E' : 'W');
    return `${degrees}°${minutes}' ${direction}`;
}

// 4. ඇප් එක පටන් ගන්නා විට පරණ දත්ත ලෝඩ් කිරීම
window.onload = () => {
    document.getElementById('lat').innerText = localStorage.getItem('lastLat') || "---";
    document.getElementById('lon').innerText = localStorage.getItem('lastLon') || "---";
    document.getElementById('time').innerText = localStorage.getItem('lastTime') || "--:--:--";
};

// 5. GPS සහ කාලගුණ දත්ත යාවත්කාලීන කිරීම
const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

navigator.geolocation.watchPosition((pos) => {
    // DMS ලොකේෂන් හැදීම
    const latDMS = convertToDMS(pos.coords.latitude, true);
    const lonDMS = convertToDMS(pos.coords.longitude, false);
    const timeStr = new Date().toLocaleTimeString();
    const speedKmh = (pos.coords.speed * 3.6 || 0).toFixed(1) + " km/h";

    // UI එකට දත්ත ඇතුළත් කිරීම
    document.getElementById('speed').innerText = speedKmh;
    document.getElementById('lat').innerText = latDMS;
    document.getElementById('lon').innerText = lonDMS;
    document.getElementById('time').innerText = timeStr;

    // Offline සඳහා දත්ත සුරැකීම (LocalStorage)
    localStorage.setItem('lastLat', latDMS);
    localStorage.setItem('lastLon', lonDMS);
    localStorage.setItem('lastTime', timeStr);

    // කාලගුණ දත්ත (Wind)
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=b55f6eb21b285249ea39c2d19af58d88&units=metric`)
    .then(r => r.json())
    .then(d => {
        document.getElementById('wind-speed').innerText = (d.wind.speed * 3.6).toFixed(1) + " km/h";
        const dirs = ["උතුරු", "ඊසාන", "නැගෙනහිර", "අග්නිදිග", "දකුණ", "නිරිත", "බටහිර", "වයඹ"];
        const dirIndex = Math.round(d.wind.deg / 45) % 8;
        document.getElementById('wind-dir').innerText = dirs[dirIndex];
    })
    .catch(err => console.log("කාලගුණ දත්ත ලබා ගත නොහැක"));

}, (err) => {
    console.error("GPS දෝෂයක් සිදුවිය: ", err);
}, options);

// 6. Offline Support සඳහා Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
    .catch((err) => console.log("Service Worker දෝෂය: ", err));
}
