const apiKey = 'b55f6eb21b285249ea39c2d19af58d88'; // ඔබේ API Key

function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

function getWindDirection(deg) {
    if (deg > 337.5 || deg <= 22.5) return "උතුර (N)";
    if (deg > 22.5 && deg <= 67.5) return "ඊසාන (NE)";
    if (deg > 67.5 && deg <= 112.5) return "නැගෙනහිර (E)";
    if (deg > 112.5 && deg <= 157.5) return "අග්නිදිග (SE)";
    if (deg > 157.5 && deg <= 202.5) return "දකුණ (S)";
    if (deg > 202.5 && deg <= 247.5) return "නිරිත (SW)";
    if (deg > 247.5 && deg <= 292.5) return "බටහිර (W)";
    return "වයඹ (NW)";
}

navigator.geolocation.watchPosition((pos) => {
    document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1) + " km/h";
    document.getElementById('heading').innerText = (pos.coords.heading || 0).toFixed(0) + "°";
    document.getElementById('lat').innerText = "Lat: " + pos.coords.latitude.toFixed(5);
    document.getElementById('lon').innerText = "Lon: " + pos.coords.longitude.toFixed(5);
    document.getElementById('time').innerText = new Date().toLocaleTimeString();

    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${apiKey}&units=metric`)
        .then(res => res.json())
        .then(data => {
            let dir = getWindDirection(data.wind.deg);
            document.getElementById('wind').innerText = `වේගය: ${(data.wind.speed * 3.6).toFixed(1)} km/h | දිශාව: ${dir}`;
        });
}, null, { enableHighAccuracy: true });

function addWaypoint() {
    let p = document.getElementById('lat').innerText + " " + document.getElementById('lon').innerText;
    let li = document.createElement('li'); li.innerText = p;
    document.getElementById('wp-list').appendChild(li);
}

function sendSOS() {
    window.location.href = `sms:?body=SOS! I am at ${document.getElementById('lat').innerText}, ${document.getElementById('lon').innerText}`;
}
