function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }
function toggleTheme() { document.body.classList.toggle('dark-mode'); }
function showTab(id) {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    toggleSidebar();
}

// මුහුදු බසින් (Marine Terms) දිශාවන් පෙන්වීම
function getWindDirection(deg) {
    const dirs = ["උතුරු (N)", "ඊසාන (NE)", "නැගෙනහිර (E)", "අග්නිදිග (SE)", "දකුණු (S)", "නිරිත (SW)", "බටහිර (W)", "වයඹ (NW)"];
    return dirs[Math.round(deg / 45) % 8];
}

navigator.geolocation.watchPosition((pos) => {
    // වේගය සහ ලොකේෂන්
    document.getElementById('speed').innerText = (pos.coords.speed * 3.6 || 0).toFixed(1);
    document.getElementById('lat').innerText = pos.coords.latitude.toFixed(4) + " N";
    document.getElementById('lon').innerText = pos.coords.longitude.toFixed(4) + " E";
    document.getElementById('time').innerText = new Date().toLocaleTimeString();
    
    // මාලිමාවේ සුමට චලනය
    document.getElementById('compass-needle').style.transform = `rotate(${pos.coords.heading || 0}deg)`;

    // කාලගුණ දත්ත
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=b55f6eb21b285249ea39c2d19af58d88&units=metric`)
    .then(r => r.json()).then(d => {
        document.getElementById('wind-dir').innerText = getWindDirection(d.wind.deg);
        document.getElementById('wind-speed').innerText = d.wind.speed.toFixed(1);
    });
}, null, { enableHighAccuracy: true });

function fetchForecast() {
    navigator.geolocation.getCurrentPosition((pos) => {
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=b55f6eb21b285249ea39c2d19af58d88&units=metric`)
        .then(r => r.json()).then(d => {
            let container = document.getElementById('forecast-data');
            container.innerHTML = "";
            for(let i=0; i<3; i++) {
                let item = d.list[i];
                let desc = { "Clear": "පැහැදිලි", "Clouds": "වලාකුළු", "Rain": "වැසි" }[item.weather[0].main] || item.weather[0].main;
                container.innerHTML += `<div class="box">${item.dt_txt.split(' ')[1]} | ${desc} | ${item.main.temp}°C</div>`;
            }
        });
    });
}

function sendSOS() { window.location.href = `sms:?body=SOS! Loc: ${document.getElementById('lat').innerText}, ${document.getElementById('lon').innerText}`; }
function saveWaypoint() { localStorage.setItem('wp_'+Date.now(), 'saved'); alert("ස්ථානය සුරකින ලදී!"); }
