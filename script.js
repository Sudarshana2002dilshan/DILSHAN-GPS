console.log("GPS Script Loaded");

function success(pos) {
    const lat = pos.coords.latitude.toFixed(5);
    const lon = pos.coords.longitude.toFixed(5);
    console.log("Location found:", lat, lon);
    
    // HTML වලට දත්ත යැවීම
    const latEl = document.getElementById('lat');
    const lonEl = document.getElementById('lon');
    
    if(latEl && lonEl) {
        latEl.innerText = lat;
        lonEl.innerText = lon;
    } else {
        alert("Location: " + lat + ", " + lon);
    }
}

function error(err) {
    alert("GPS Error: " + err.message);
}

navigator.geolocation.watchPosition(success, error, { enableHighAccuracy: true });
