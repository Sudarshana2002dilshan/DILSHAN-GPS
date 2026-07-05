const status = document.getElementById('status');

const options = {
    enableHighAccuracy: true, // මෙය අනිවාර්යයි
    timeout: 5000,
    maximumAge: 0
};

function success(pos) {
    status.innerText = "GPS ACTIVE";
    status.style.color = "#22c55e";
    
    // Speed conversion
    let s = (pos.coords.speed * 3.6 || 0);
    document.getElementById('speed').innerText = s.toFixed(1);
    
    // Format: DD°MM.MMM
    const f = (c, isLat) => {
        let abs = Math.abs(c);
        return Math.floor(abs) + "°" + ((abs - Math.floor(abs)) * 60).toFixed(3) + "'" + (isLat ? (c>=0?"N":"S") : (c>=0?"E":"W"));
    };
    
    document.getElementById('lat').innerText = f(pos.coords.latitude, true);
    document.getElementById('lon').innerText = f(pos.coords.longitude, false);
}

function error(err) {
    status.innerText = "GPS Error: " + err.message;
    status.style.color = "#ef4444";
}

navigator.geolocation.watchPosition(success, error, options);
