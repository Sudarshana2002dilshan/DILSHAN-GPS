navigator.geolocation.watchPosition(
    (pos) => {
        const f = (c, isLat) => {
            let abs = Math.abs(c);
            return Math.floor(abs) + "°" + ((abs - Math.floor(abs)) * 60).toFixed(3) + "'" + (isLat ? (c>=0?"N":"S") : (c>=0?"E":"W"));
        };
        document.getElementById('lat').innerText = f(pos.coords.latitude, true);
        document.getElementById('lon').innerText = f(pos.coords.longitude, false);
    },
    (err) => { console.error(err); },
    { enableHighAccuracy: true }
);
