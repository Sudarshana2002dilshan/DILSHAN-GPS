function toggleSettings() {
    document.getElementById('settingsMenu').style.display = 
        (document.getElementById('settingsMenu').style.display === 'none') ? 'block' : 'none';
}
function toggleTheme() { document.body.classList.toggle('light-mode'); }

navigator.geolocation.watchPosition((pos) => {
    document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1) + " km/h";
    document.getElementById('lat').innerText = pos.coords.latitude.toFixed(5);
    document.getElementById('lon').innerText = pos.coords.longitude.toFixed(5);
    document.getElementById('time').innerText = new Date().toLocaleTimeString();
    
    fetch('https://api.openweathermap.org/data/2.5/weather?lat='+pos.coords.latitude+'&lon='+pos.coords.longitude+'&appid=b55f6eb21b285249ea39c2d19af58d88&units=metric')
    .then(r => r.json()).then(d => {
        document.getElementById('wind').innerText = (d.wind.speed * 3.6).toFixed(1) + " km/h (" + d.wind.deg + "°)";
    });
}, null, { enableHighAccuracy: true });

function sendSOS() { 
    window.location.href = `sms:?body=SOS! My Location: ${document.getElementById('lat').innerText}, ${document.getElementById('lon').innerText}`; 
}
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
