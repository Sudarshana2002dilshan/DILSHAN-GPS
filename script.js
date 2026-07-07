// ටැබ් අතර මාරු වීමට
function showTab(id) {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// DMS ආකෘතියට හැරවීම (Location)
function toDMS(dec, isLat) {
    const abs = Math.abs(dec);
    const deg = Math.floor(abs);
    const min = ((abs - deg) * 60).toFixed(3);
    const dir = isLat ? (dec >= 0 ? 'N' : 'S') : (dec >= 0 ? 'E' : 'W');
    return `${deg}°${min}' ${dir}`;
}

// ගල් පර්වත මාක් කර සේව් කිරීම
function saveHazard() {
    const name = document.getElementById('h-name').value;
    navigator.geolocation.getCurrentPosition(pos => {
        let hazards = JSON.parse(localStorage.getItem('myHazards') || '[]');
        hazards.push({ name: name, lat: pos.coords.latitude, lon: pos.coords.longitude });
        localStorage.setItem('myHazards', JSON.stringify(hazards));
        alert("සාර්ථකව සේව් විය!");
    });
}

// නිරන්තරයෙන් Location පරීක්ෂා කිරීම සහ Hazard alert පෙන්වීම
navigator.geolocation.watchPosition((pos) => {
    document.getElementById('lat').innerText = toDMS(pos.coords.latitude, true);
    document.getElementById('lon').innerText = toDMS(pos.coords.longitude, false);
    document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1) + " km/h";
    document.getElementById('time').innerText = new Date().toLocaleTimeString();

    const myHazards = JSON.parse(localStorage.getItem('myHazards') || '[]');
    let alertBox = document.getElementById('hazard-alert');
    let found = false;
    myHazards.forEach(h => {
        const dist = Math.sqrt(Math.pow(pos.coords.latitude - h.lat, 2) + Math.pow(pos.coords.longitude - h.lon, 2)) * 111;
        if (dist < 0.5) { alertBox.innerHTML = `⚠️ ${h.name} (${dist.toFixed(3)} km)`; alertBox.style.display = "block"; found = true; }
    });
    if (!found) alertBox.style.display = "none";
}, null, { enableHighAccuracy: true });

// කාලගුණය (සුළඟේ දිශාව)
function getWind() {
    navigator.geolocation.getCurrentPosition(pos => {
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=b55f6eb21b285249ea39c2d19af58d88&units=metric`)
        .then(r => r.json()).then(d => {
            document.getElementById('wind-speed').innerText = (d.wind.speed * 3.6).toFixed(1) + " km/h";
            const dirs = ["උතුරු", "ඊසාන", "නැගෙනහිර", "අග්නිදිග", "දකුණ", "නිරිත", "බටහිර", "වයඹ"];
            document.getElementById('wind-dir').innerText = "දිශාව: " + dirs[Math.round(d.wind.deg / 45) % 8];
        });
    });
}
setInterval(getWind, 10000);
getWind();
