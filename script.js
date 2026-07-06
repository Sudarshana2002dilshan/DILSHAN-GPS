const apiKey = 'ef037298a7b9778d89749e09067c3862'; // ඔබේ Key එක මෙතැනට දමන්න

navigator.geolocation.watchPosition(
    (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        
        // ස්ථානය පෙන්වීම
        const f = (c, isLat) => Math.floor(Math.abs(c)) + "°" + ((Math.abs(c) - Math.floor(Math.abs(c))) * 60).toFixed(3) + "'" + (isLat ? (c>=0?"N":"S") : (c>=0?"E":"W"));
        document.getElementById('lat').innerText = f(lat, true);
        document.getElementById('lon').innerText = f(lon, false);
        document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1);

        // සුළං දත්ත පරීක්ෂාව
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
            .then(res => res.json())
            .then(data => {
                if(data.wind) {
                    document.getElementById('wSpeed').innerText = (data.wind.speed * 3.6).toFixed(1);
                    document.getElementById('wDir').innerText = data.wind.deg;
                }
            })
            .catch(err => console.log("Wind API Error:", err));
    },
    (err) => console.error(err),
    { enableHighAccuracy: true }
);
