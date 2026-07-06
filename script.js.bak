function showTab(id) {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
function toggleTheme() { document.body.classList.toggle('dark-mode'); }

// GPS සහ කාලය නිරන්තරයෙන් අලුත් කිරීම
setInterval(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
        const toDMS = (dec, isLat) => {
            const abs = Math.abs(dec);
            const deg = Math.floor(abs);
            const min = ((abs - deg) * 60).toFixed(3);
            const dir = isLat ? (dec >= 0 ? 'N' : 'S') : (dec >= 0 ? 'E' : 'W');
            return `${deg}°${min}' ${dir}`;
        };

        document.getElementById('lat').innerText = toDMS(pos.coords.latitude, true);
        document.getElementById('lon').innerText = toDMS(pos.coords.longitude, false);
        document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1) + " km/h";
        document.getElementById('time').innerText = new Date().toLocaleTimeString();
    }, null, { enableHighAccuracy: true });
}, 3000); // සෑම තත්පර 3කට වරක් රිෆ්‍රෙෂ් වේ
