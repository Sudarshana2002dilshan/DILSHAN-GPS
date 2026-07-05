function updateGPS() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const speed = (position.coords.speed * 3.6).toFixed(1); // m/s සිට km/h වලට
      
      document.getElementById('coords').innerHTML = `${lat}° N<br>${lon}° E`;
      // වේගය යාවත්කාලීන කිරීම මෙහිදී සිදු කරන්න
    });
  }
}
updateGPS();
