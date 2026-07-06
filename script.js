function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

function addWaypoint() {
    let lat = document.getElementById('lat').innerText;
    let lon = document.getElementById('lon').innerText;
    let li = document.createElement('li');
    li.innerText = `Pos: ${lat} / ${lon}`;
    document.getElementById('list').appendChild(li);
}
// දිශාව සහ වේගය යාවත්කාලීන කිරීම
navigator.geolocation.watchPosition((pos) => {
    // වේගය
    document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1);
    
    // දිශාව (Compass Heading)
    // දුරකථනයේ හෙඩිං එක නැත්නම් චලනය වන දිශාව පෙන්වයි
    document.getElementById('heading').innerText = (pos.coords.heading || 0).toFixed(0) + "°";
    
    // ලොකේෂන්
    document.getElementById('lat').innerText = pos.coords.latitude.toFixed(5);
    document.getElementById('lon').innerText = pos.coords.longitude.toFixed(5);
}, null, { enableHighAccuracy: true });

// SOS ශ්‍රිතය
function sendSOS() {
    let lat = document.getElementById('lat').innerText;
    let lon = document.getElementById('lon').innerText;
    let msg = `SOS! I am at Latitude: ${lat}, Longitude: ${lon}. Need Help!`;
    
    // දුරකථනයේ කෙටි පණිවිඩ යැවීමේ සේවාව විවෘත කරයි
    window.location.href = `sms:?body=${encodeURIComponent(msg)}`;
}


navigator.geolocation.watchPosition((pos) => {
    document.getElementById('speed').innerText = (pos.coords.speed * 3.6).toFixed(1);
    document.getElementById('lat').innerText = pos.coords.latitude.toFixed(5);
    document.getElementById('lon').innerText = pos.coords.longitude.toFixed(5);
}, null, { enableHighAccuracy: true });

// Register Service Worker for Offline usage
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
