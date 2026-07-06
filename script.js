function showTab(id) {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
function toggleTheme() { document.body.classList.toggle('dark-mode'); }

window.onload = () => {
    document.getElementById('lat').innerText = localStorage.getItem('lastLat') || "---";
    document.getElementById('lon').innerText = localStorage.getItem('lastLon') || "---";
    document.getElementById('time').innerText = localStorage.getItem('lastTime') || "--:--:--";
};

navigator.geolocation.watchPosition((pos) => {
    const lat = pos.coords.latitude.toFixed(4) + " N";
    const lon = pos.coords.longitude.toFixed(4) + " E";
    const time = new Date().toLocaleTimeString();
    
    document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1);
    document.getElementById('lat').innerText = lat;
    document.getElementById('lon').innerText = lon;
    document.getElementById('time').innerText = time;

    localStorage.setItem('lastLat', lat);
    localStorage.setItem('lastLon', lon);
    localStorage.setItem('lastTime', time);

    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=b55f6eb21b285249ea39c2d19af58d88&units=metric`)
    .then(r => r.json()).then(d => {
        document.getElementById('wind-speed').innerText = (d.wind.speed * 3.6).toFixed(1) + " km/h";
        const dirs = ["උතුරු", "ඊසාන", "නැගෙනහිර", "අග්නිදිග", "දකුණ", "නිරිත", "බටහිර", "වයඹ"];
        document.getElementById('wind-dir').innerText = dirs[Math.round(d.wind.deg / 45) % 8];
    });
});
