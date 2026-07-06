// 1. Wake Lock (තිරය අගුළු වැටීම වළක්වයි)
if ('wakeLock' in navigator) navigator.wakeLock.request('screen');

// 2. Offline support
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

navigator.geolocation.watchPosition((pos) => {
    // වේගය සහ ලොකේෂන්
    document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1) + " km/h";
    document.getElementById('lat').innerText = pos.coords.latitude.toFixed(5);
    document.getElementById('lon').innerText = pos.coords.longitude.toFixed(5);
    document.getElementById('heading').innerText = "දිශාව: " + (pos.coords.heading || 0).toFixed(0) + "°";
    document.getElementById('time').innerText = "වෙලාව: " + new Date().toLocaleTimeString();

    // සුළං දත්ත (API)
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=b55f6eb21b285249ea39c2d19af58d88&units=metric`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('wind').innerText = `සුළඟ: ${(data.wind.speed * 3.6).toFixed(1)} km/h (${data.wind.deg}°)`;
        });
}, null, { enableHighAccuracy: true });

function addWaypoint() {
    let li = document.createElement('li');
    li.innerText = `Pos: ${document.getElementById('lat').innerText}, ${document.getElementById('lon').innerText} | ${new Date().toLocaleTimeString()}`;
    document.getElementById('wp-list').appendChild(li);
    localStorage.setItem('wp_' + Date.now(), li.innerText); // Offline සුරැකීම
}

function sendSOS() {
    window.location.href = `sms:?body=SOS! මගේ පිහිටීම: ${document.getElementById('lat').innerText}, ${document.getElementById('lon').innerText}`;
}
