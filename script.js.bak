function showTab(id) {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function toDMS(dec, isLat) {
    const abs = Math.abs(dec);
    const deg = Math.floor(abs);
    const min = ((abs - deg) * 60).toFixed(3);
    const dir = isLat ? (dec >= 0 ? 'N' : 'S') : (dec >= 0 ? 'E' : 'W');
    return `${deg}°${min}' ${dir}`;
}

// GPS සජීවීව ක්‍රියාත්මක කිරීම
if (navigator.geolocation) {
    navigator.geolocation.watchPosition((pos) => {
        document.getElementById('lat').innerText = toDMS(pos.coords.latitude, true);
        document.getElementById('lon').innerText = toDMS(pos.coords.longitude, false);
        document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1) + " km/h";
        document.getElementById('time').innerText = new Date().toLocaleTimeString();
    }, (err) => {
        console.error("GPS Error: " + err.message);
    }, { enableHighAccuracy: true });
} else {
    alert("ඔබේ බ්‍රවුසරය GPS සඳහා සහය නොදක්වයි.");
}
