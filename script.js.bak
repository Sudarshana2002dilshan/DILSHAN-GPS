if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            // Update Speed (Convert m/s to knots)
            const speedInKnots = position.coords.speed * 1.94384 || 0;
            document.getElementById('speed').innerText = speedInKnots.toFixed(1);

            // Update Course
            document.getElementById('course').innerText = position.coords.heading || '---';

            // Update Location and Time
            const latitude = position.coords.latitude.toFixed(4);
            const longitude = position.coords.longitude.toFixed(4);
            const timestamp = new Date(position.timestamp).toLocaleTimeString();

            document.getElementById('coords').innerHTML = 
                `${latitude} N, ${longitude} E<br><small>${timestamp}</small>`;
        },
        (error) => {
            console.error("Error Code = " + error.code + " - " + error.message);
            document.getElementById('coords').innerText = "Error: " + error.message;
        },
        { enableHighAccuracy: true }
    );
} else {
    document.getElementById('coords').innerText = "Geolocation is not supported by this browser.";
}
