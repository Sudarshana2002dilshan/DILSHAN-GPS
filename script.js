// මුහුදු බසින් දිශාවන් දැක්වීම
function getMarineWindDirection(deg) {
    const dirs = ["උතුරු (N)", "ඊසාන (NE)", "නැගෙනහිර (E)", "අග්නිදිග (SE)", "දකුණු (S)", "නිරිත (SW)", "බටහිර (W)", "වයඹ (NW)"];
    return dirs[Math.round(deg / 45) % 8];
}

navigator.geolocation.watchPosition((pos) => {
    // GPS දත්ත
    document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1);
    document.getElementById('course').innerText = (pos.coords.heading || 0).toFixed(0);
    document.getElementById('lat').innerText = pos.coords.latitude.toFixed(4) + ' N';
    document.getElementById('lon').innerText = pos.coords.longitude.toFixed(4) + ' E';
    document.getElementById('time').innerText = new Date().toLocaleTimeString();

    // කාලගුණ දත්ත ලබාගැනීම
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=b55f6eb21b285249ea39c2d19af58d88&units=metric`)
    .then(r => r.json()).then(d => {
        document.getElementById('wind-dir').innerText = getMarineWindDirection(d.wind.deg);
        document.getElementById('wind-speed').innerText = d.wind.speed.toFixed(1);
    });
}, null, { enableHighAccuracy: true });
