function formatCoord(coord, isLat) {
    const abs = Math.abs(coord);
    const deg = Math.floor(abs);
    const min = ((abs - deg) * 60).toFixed(3);
    const dir = isLat ? (coord >= 0 ? "N" : "S") : (coord >= 0 ? "E" : "W");
    return `${deg}°${min}'${dir}`;
}

navigator.geolocation.watchPosition((pos) => {
    // Speed: m/s to km/h (multiply by 3.6)
    document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1);
    
    // Course
    document.getElementById('course').innerText = pos.coords.heading ? pos.coords.heading.toFixed(0) : '---';
    
    // Location
    document.getElementById('lat').innerText = formatCoord(pos.coords.latitude, true);
    document.getElementById('lon').innerText = formatCoord(pos.coords.longitude, false);
    
    // Time
    document.getElementById('time').innerText = "Time: " + new Date().toLocaleTimeString();
}, { enableHighAccuracy: true });
