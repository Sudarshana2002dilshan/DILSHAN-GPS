function showTab(id) {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
}
function toDMS(dec, isLat) {
    const abs = Math.abs(dec);
    const deg = Math.floor(abs);
    const min = ((abs - deg) * 60).toFixed(3);
    const dir = isLat ? (dec >= 0 ? 'N' : 'S') : (dec >= 0 ? 'E' : 'W');
    return `${deg}°${min}' ${dir}`;
}

// GPS Tracking
navigator.geolocation.watchPosition((pos) => {
    document.getElementById('lat').innerText = toDMS(pos.coords.latitude, true);
    document.getElementById('lon').innerText = toDMS(pos.coords.longitude, false);
    document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1) + " km/h";
    document.getElementById('time').innerText = new Date().toLocaleTimeString();
}, null, { enableHighAccuracy: true });

// කාලගුණය (සිංහල දිශා)
function getWind() {
    navigator.geolocation.getCurrentPosition(pos => {
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=b55f6eb21b285249ea39c2d19af58d88&units=metric`)
        .then(r => r.json()).then(d => {
            document.getElementById('wind-speed').innerText = (d.wind.speed * 3.6).toFixed(1) + " km/h";
            const dirs = ["උතුරු", "ඊසාන", "නැගෙනහිර", "අග්නිදිග", "දකුණ", "නිරිත", "බටහිර", "වයඹ"];
            document.getElementById('wind-dir').innerText = dirs[Math.round(d.wind.deg / 45) % 8];
        });
    });
}
setInterval(getWind, 10000);
getWind();
