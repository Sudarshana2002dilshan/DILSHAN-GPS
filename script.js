function showTab(id) {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
function toggleTheme() { document.body.classList.toggle('dark-mode'); }

// DMS Converter
function toDMS(decimal, isLat) {
    const abs = Math.abs(decimal);
    const deg = Math.floor(abs);
    const min = ((abs - deg) * 60).toFixed(3);
    const dir = isLat ? (decimal >= 0 ? 'N' : 'S') : (decimal >= 0 ? 'E' : 'W');
    return `${deg}°${min}' ${dir}`;
}

window.onload = () => {
    document.getElementById('lat').innerText = localStorage.getItem('lastLat') || "0°00.000' N";
    document.getElementById('lon').innerText = localStorage.getItem('lastLon') || "0°00.000' E";
};
// පර්මිෂන් එක ඉල්ලීම
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (pos) => { console.log("Location allowed"); },
        (err) => { alert("කරුණාකර ඇප් එකේ Settings වෙත ගොස් Location Permission ලබා දෙන්න."); }
    );
}

navigator.geolocation.watchPosition((pos) => {
    const latDMS = toDMS(pos.coords.latitude, true);
    const lonDMS = toDMS(pos.coords.longitude, false);
    const timeStr = new Date().toLocaleTimeString();
    
    document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1) + " km/h";
    document.getElementById('lat').innerText = latDMS;
    document.getElementById('lon').innerText = lonDMS;
    document.getElementById('time').innerText = timeStr;

    localStorage.setItem('lastLat', latDMS);
    localStorage.setItem('lastLon', lonDMS);
    localStorage.setItem('lastTime', timeStr);

    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=b55f6eb21b285249ea39c2d19af58d88&units=metric`)
    .then(r => r.json()).then(d => {
        document.getElementById('wind-speed').innerText = (d.wind.speed * 3.6).toFixed(1) + " km/h";
        const dirs = ["උතුරු", "ඊසාන", "නැගෙනහිර", "අග්නිදිග", "දකුණ", "නිරිත", "බටහිර", "වයඹ"];
        document.getElementById('wind-dir').innerText = dirs[Math.round(d.wind.deg / 45) % 8];
    });
});
window.addEventListener('offline', () => {
    alert("ඔබ දැන් Offline! GPS දත්ත පමණක් පෙන්වනු ඇත.");
});
