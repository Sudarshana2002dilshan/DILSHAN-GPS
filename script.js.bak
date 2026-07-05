let maxS = 0, sumS = 0, count = 0;

function openTab(tabName) {
    document.querySelectorAll('.tabcontent').forEach(t => t.style.display = 'none');
    document.getElementById(tabName).style.display = 'block';
}

function saveWaypoint() {
    alert("Saved: " + document.getElementById('lat').innerText);
}

// GPS Logic
navigator.geolocation.watchPosition((pos) => {
    let s = (pos.coords.speed * 3.6 || 0);
    document.getElementById('speed').innerText = s.toFixed(1);
    
    if(s > maxS) maxS = s;
    sumS += s; count++;
    
    document.getElementById('maxSpeed').innerText = maxS.toFixed(1);
    document.getElementById('avgSpeed').innerText = (sumS/count).toFixed(1);
    document.getElementById('course').innerText = (pos.coords.heading || 0).toFixed(0) + "°";

    const f = (c, isLat) => {
        let abs = Math.abs(c);
        return Math.floor(abs) + "°" + ((abs - Math.floor(abs)) * 60).toFixed(3) + "'" + (isLat ? (c>=0?"N":"S") : (c>=0?"E":"W"));
    };
    
    document.getElementById('lat').innerText = f(pos.coords.latitude, true);
    document.getElementById('lon').innerText = f(pos.coords.longitude, false);
}, { enableHighAccuracy: true });
