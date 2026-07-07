function showTab(id) {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
function toggleTheme() { document.body.classList.toggle('dark-mode'); }

// DMS Format Function
function toDMS(dec, isLat) {
    const abs = Math.abs(dec);
    const deg = Math.floor(abs);
    const min = ((abs - deg) * 60).toFixed(3);
    const dir = isLat ? (dec >= 0 ? 'N' : 'S') : (dec >= 0 ? 'E' : 'W');
    return `${deg}°${min}' ${dir}`;
}

// GPS + Hazard Check
navigator.geolocation.watchPosition(async (pos) => {
    const myLat = pos.coords.latitude;
    const myLon = pos.coords.longitude;
    document.getElementById('lat').innerText = toDMS(myLat, true);
    document.getElementById('lon').innerText = toDMS(myLon, false);
    document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1) + " km/h";
    document.getElementById('time').innerText = new Date().toLocaleTimeString();

    // Hazard Check
    const response = await fetch('hazards.json');
    const hazards = await response.json();
    const alertBox = document.getElementById('hazard-alert');
    let found = false;
    hazards.forEach(h => {
        const dist = Math.sqrt(Math.pow(myLat - h.lat, 2) + Math.pow(myLon - h.lon, 2)) * 111;
        if (dist < 1) { alertBox.innerText = "⚠️ අවදානමයි! " + h.name + " අසලයි!"; alertBox.style.display = "block"; found = true; }
    });
    if (!found) alertBox.style.display = "none";
}, null, { enableHighAccuracy: true });

// Wind Speed
function getWind() {
    navigator.geolocation.getCurrentPosition(pos => {
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=b55f6eb21b285249ea39c2d19af58d88&units=metric`)
        .then(r => r.json()).then(d => {
            document.getElementById('wind-speed').innerText = (d.wind.speed * 3.6).toFixed(1) + " km/h";
            const dirs = ["උතුරු (North)", "ඊසාන (North-East)", "නැගෙනහිර (East)", "අග්නිදිග (South-East)", "දකුණ (South)", "නිරිත (South-West)", "බටහිර (West)", "වයඹ (North-West)"];
            document.getElementById('wind-dir').innerText = "දිශාව: " + dirs[Math.round(d.wind.deg / 45) % 8];
        });
    });
}
setInterval(getWind, 10000);
getWind();
