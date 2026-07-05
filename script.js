function toDegreesMinutesAndSeconds(coordinate, isLat) {
    const absolute = Math.abs(coordinate);
    const degrees = Math.floor(absolute);
    const minutes = ((absolute - degrees) * 60).toFixed(3);
    const direction = isLat ? (coordinate >= 0 ? "N" : "S") : (coordinate >= 0 ? "E" : "W");
    return `${degrees}°${minutes}' ${direction}`;
}

navigator.geolocation.watchPosition((position) => {
    document.getElementById('speed').innerText = (position.coords.speed * 1.94384 || 0).toFixed(2);
    document.getElementById('course').innerText = position.coords.heading ? position.coords.heading.toFixed(0) : '---';
    
    const lat = toDegreesMinutesAndSeconds(position.coords.latitude, true);
    const lon = toDegreesMinutesAndSeconds(position.coords.longitude, false);
    const time = new Date().toLocaleTimeString();
    
    document.getElementById('coords').innerHTML = `${lat}<br>${lon}<br>${time}`;
});
