function updateGPS() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition((position) => {
            const speed = position.coords.speed ? (position.coords.speed * 3.6).toFixed(1) : "0.0";
            const course = position.coords.heading ? position.coords.heading.toFixed(0) : "---";
            
            document.getElementById('speed').innerText = speed;
            document.getElementById('course').innerText = course;
            document.getElementById('coords').innerHTML = 
                `${position.coords.latitude.toFixed(3)}° N<br>${position.coords.longitude.toFixed(3)}° E`;
            document.getElementById('time').innerText = new Date().toLocaleTimeString();
        }, (err) => {
            alert("GPS දෝෂයක්: " + err.message);
        }, { enableHighAccuracy: true });
    }
}
updateGPS();
