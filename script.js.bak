let maxS = 0, totalS = 0, count = 0;

function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

function saveWaypoint() {
    alert("Waypoint Saved: " + document.getElementById('lat').innerText);
}

// GPS සහ සුළං දත්ත
navigator.geolocation.watchPosition((pos) => {
    let s = pos.coords.speed * 3.6 || 0;
    document.getElementById('speed').innerText = s.toFixed(1);
    if(s > maxS) maxS = s;
    totalS += s; count++;
    document.getElementById('maxSpeed').innerText = maxS.toFixed(1);
    document.getElementById('avgSpeed').innerText = (totalS/count).toFixed(1);
    document.getElementById('course').innerText = (pos.coords.heading || 0).toFixed(0) + '°';
    
    // DD°MM.MMM ආකෘතිය
    const f = (c, isLat) => {
        let abs = Math.abs(c);
        return Math.floor(abs) + "°" + ((abs - Math.floor(abs)) * 60).toFixed(3) + "'" + (isLat ? (c>=0?"N":"S") : (c>=0?"E":"W"));
    };
    document.getElementById('lat').innerText = f(pos.coords.latitude, true);
    document.getElementById('lon').innerText = f(pos.coords.longitude, false);
}, { enableHighAccuracy: true });
