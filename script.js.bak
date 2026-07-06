let isBatSaver = false;
function toggleBatteryMode() {
    isBatSaver = !isBatSaver;
    document.getElementById('bat-status').innerText = isBatSaver ? "ON" : "OFF";
}
function toggleTheme() { document.body.classList.toggle('light-mode'); }

// GPS & Sensors
navigator.geolocation.watchPosition((pos) => {
    document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1) + " km/h";
    document.getElementById('lat').innerText = pos.coords.latitude.toFixed(5);
    document.getElementById('lon').innerText = pos.coords.longitude.toFixed(5);
    document.getElementById('heading').innerText = (pos.coords.heading || 0).toFixed(0) + "°";
    document.getElementById('time').innerText = new Date().toLocaleTimeString();
    
    // Compass Rotate
    document.getElementById('compass-needle').style.transform = `rotate(${pos.coords.heading || 0}deg)`;

    // Wind Logic
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=b55f6eb21b285249ea39c2d19af58d88&units=metric`)
    .then(r => r.json()).then(d => {
        document.getElementById('wind').innerText = `${d.wind.speed}km/h`;
    });
}, null, { enableHighAccuracy: !isBatSaver });

function sendSOS() { window.location.href = `sms:?body=SOS! Loc: ${document.getElementById('lat').innerText}, ${document.getElementById('lon').innerText}`; }
function saveWaypoint() { localStorage.setItem('wp_'+Date.now(), 'saved'); alert("Point Saved!"); }
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
