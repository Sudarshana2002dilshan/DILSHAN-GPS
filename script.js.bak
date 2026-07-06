// Map Initialization
const map = L.map('map').setView([7.32, 79.83], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
let marker = L.marker([7.32, 79.83]).addTo(map);

let dist = 0;
let lastPos = null;

navigator.geolocation.watchPosition((pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    // Update Map
    marker.setLatLng([lat, lon]);
    map.setView([lat, lon], 15);

    // Update UI
    document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1) + " km/h";
    document.getElementById('lat').innerText = lat.toFixed(5);
    document.getElementById('lon').innerText = lon.toFixed(5);

    // Distance Tracker
    if(lastPos) {
        dist += calculateDistance(lastPos.lat, lastPos.lon, lat, lon);
        document.getElementById('distance').innerText = "දූරය: " + dist.toFixed(2) + " km";
    }
    lastPos = {lat, lon};
}, null, { enableHighAccuracy: true });

function calculateDistance(lat1, lon1, lat2, lon2) {
    let R = 6371;
    let dLat = (lat2-lat1)*Math.PI/180;
    let dLon = (lon2-lon1)*Math.PI/180;
    let a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    if(id === 'map') map.invalidateSize();
}
