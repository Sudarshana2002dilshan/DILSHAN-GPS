function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }
function toggleTheme() { document.body.classList.toggle('dark-mode'); }
function showTab(id) { document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active')); document.getElementById(id).classList.add('active'); toggleSidebar(); }

navigator.geolocation.watchPosition((pos) => {
    // SOG Speed
    document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1);
    // COG Heading
    document.getElementById('heading').innerText = (pos.coords.heading || 0).toFixed(0);
    // DMS Format Coordinates
    document.getElementById('lat').innerText = formatDMS(pos.coords.latitude, true);
    document.getElementById('lon').innerText = formatDMS(pos.coords.longitude, false);
    document.getElementById('time').innerText = new Date().toLocaleTimeString();
}, null, { enableHighAccuracy: true });

function formatDMS(val, isLat) {
    let abs = Math.abs(val);
    let deg = Math.floor(abs);
    let min = ((abs - deg) * 60).toFixed(3);
    let dir = isLat ? (val >= 0 ? 'N' : 'S') : (val >= 0 ? 'E' : 'W');
    return `${deg}°${min}' ${dir}`;
}

function sendSOS() { window.location.href = `sms:?body=SOS! Loc: ${document.getElementById('lat').innerText}, ${document.getElementById('lon').innerText}`; }
function saveWaypoint() { alert("ස්ථානය සුරකින ලදී!"); }
