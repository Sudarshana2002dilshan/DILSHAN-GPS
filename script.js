let isBatSaver = false;
function toggleBatteryMode() {
    isBatSaver = !isBatSaver;
    document.getElementById('bat-status').innerText = isBatSaver ? "ON" : "OFF";
}
function toggleTheme() { document.body.classList.toggle('light-mode'); }
function showTab(id) {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

navigator.geolocation.watchPosition((pos) => {
    document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1) + " km/h";
    document.getElementById('lat').innerText = pos.coords.latitude.toFixed(5);
    document.getElementById('lon').innerText = pos.coords.longitude.toFixed(5);
    document.getElementById('heading').innerText = (pos.coords.heading || 0).toFixed(0) + "°";
    document.getElementById('time').innerText = new Date().toLocaleTimeString();
    document.getElementById('compass-needle').style.transform = `rotate(${pos.coords.heading || 0}deg)`;
}, null, { enableHighAccuracy: !isBatSaver });

function fetchForecast() {
    navigator.geolocation.getCurrentPosition((pos) => {
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=b55f6eb21b285249ea39c2d19af58d88&units=metric`)
        .then(r => r.json()).then(d => {
            let container = document.getElementById('forecast-data');
            container.innerHTML = "";
            for(let i=0; i<3; i++) {
                let item = d.list[i];
                let desc = { "Clear": "පැහැදිලි", "Clouds": "වලාකුළු", "Rain": "වැසි" }[item.weather[0].main] || item.weather[0].main;
                container.innerHTML += `<div class="card" style="margin-bottom:10px;">${item.dt_txt.split(' ')[1]} - ${desc} - ${item.main.temp}°C</div>`;
            }
        });
    });
}

function sendSOS() { window.location.href = `sms:?body=SOS! Loc: ${document.getElementById('lat').innerText}, ${document.getElementById('lon').innerText}`; }
function saveWaypoint() { localStorage.setItem('wp_'+Date.now(), 'saved'); alert("ස්ථානය සුරකින ලදී!"); }
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
