if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        document.getElementById('speed').innerText = (position.coords.speed * 1.94384 || 0).toFixed(1);
        document.getElementById('course').innerText = position.coords.heading || '---';
        document.getElementById('coords').innerText = 
            position.coords.latitude.toFixed(4) + ' N, ' + 
            position.coords.longitude.toFixed(4) + ' E';
    });
} else {
    document.getElementById('coords').innerText = "GPS not supported";
}
