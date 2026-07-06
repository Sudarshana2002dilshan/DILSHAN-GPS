function getMarineWindDirection(deg) {
    const dirs = ["උතුරු (N)", "ඊසාන (NE)", "නැගෙනහිර (E)", "අග්නිදිග (SE)", "දකුණු (S)", "නිරිත (SW)", "බටහිර (W)", "වයඹ (NW)"];
    return dirs[Math.round(deg / 45) % 8];
}

function formatDMS(val, isLat) {
    let abs = Math.abs(val);
    let deg = Math.floor(abs);
    let min = ((abs - deg) * 60).toFixed(3);
    let dir = isLat ? (val >= 0 ? 'N' : 'S') : (val >= 0 ? 'E' : 'W');
    return `${deg}°${min}' ${dir}`;
}

navigator.geolocation.watchPosition((pos) => {
    // 1. වේගය සහ ගමන් මග
    document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1);
    document.getElementById('course').innerText = (pos.coords.heading || 0).toFixed(0);
    
    // 2. ලොකේෂන් සහ ටයිම්
    document.getElementById('lat').innerText = formatDMS(pos.coords.latitude, true);
    document.getElementById('lon').innerText = formatDMS(pos.coords.longitude, false);
    document.getElementById('time').innerText = new Date().toLocaleTimeString();

    // 3. සුළඟේ වේගය සහ දිශාව (API)
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=b55f6eb21b285249ea39c2d19af58d88&units=metric`)
    .then(r => r.json()).then(d => {
        document.getElementById('wind-speed').innerText = (d.wind.speed * 3.6).toFixed(1);
        document.getElementById('wind-dir').innerText = getMarineWindDirection(d.wind.deg);
    });
}, null, { enableHighAccuracy: true });
