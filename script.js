// ================= MAP INIT =================
const map = L.map('map').setView([9.0820, 8.6753], 6);

// Base map (you can switch to satellite in HTML if needed)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// ================= ICONS =================
const greenIcon = new L.Icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
    iconSize: [32, 32]
});

const redIcon = new L.Icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    iconSize: [32, 32]
});

// ================= CITIES =================
let cities = [
    ["Lagos", 6.5244, 3.3792],
    ["Abuja", 9.0765, 7.3986],
    ["Kano", 12.0022, 8.5920],
    ["Kaduna", 10.5105, 7.4165],
    ["Ibadan", 7.3775, 3.9470],
    ["Oyo", 7.8500, 3.9310]
];

// ================= SYSTEM DATA =================
let trucks = [];
let markers = [];
let routes = {};
let routeIndex = {};
let routeReady = {};

// ================= ALERT SYSTEM =================
function addAlert(msg, type) {
    let box = document.getElementById("alerts");

    if (box) {
        box.innerHTML =
            `<div class="alert ${type}">${msg}</div>` + box.innerHTML;
    }
}

// ================= CREATE 10–50 TRUCKS =================
let totalTrucks = 25; // change 10 - 50 here

for (let i = 1; i <= totalTrucks; i++) {

    let from = cities[Math.floor(Math.random() * cities.length)];
    let to = cities[Math.floor(Math.random() * cities.length)];

    let id = "MXT-" + String(i).padStart(3, "0");

    trucks.push({
        id: id,
        from: from,
        to: to,
        lat: from[1],
        lng: from[2],
        speed: 0,
        moving: true
    });

    routes[id] = [];
    routeIndex[id] = 0;
    routeReady[id] = false;
}

// ================= BUILD REAL ROAD ROUTES =================
trucks.forEach((t, i) => {

    let marker = L.marker([t.lat, t.lng], { icon: greenIcon }).addTo(map);

    markers.push(marker);

    // CLICK INFO PANEL
    marker.on("click", () => {

        document.getElementById("info").innerHTML = `
        🚛 <b>${t.id}</b><br><br>

        📍 FROM: ${t.from[0]}<br>
        🎯 TO: ${t.to[0]}<br><br>

        🌍 CURRENT:<br>
        ${t.lat.toFixed(4)}, ${t.lng.toFixed(4)}<br><br>

        🚀 SPEED: ${t.speed.toFixed(2)} km/h<br>

        ${t.moving ? "🟢 Moving" : "🔴 Stopped"}
        `;
    });

    // ROUTE ENGINE (REAL ROADS)
    L.Routing.control({
        waypoints: [
            L.latLng(t.from[1], t.from[2]),
            L.latLng(t.to[1], t.to[2])
        ],
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false,
        createMarker: () => null
    }).on("routesfound", function (e) {

        routes[t.id] = e.routes[0].coordinates;
        routeReady[t.id] = true;

    }).addTo(map);
});

// ================= MOVE TRUCKS ALONG ROUTES =================
function moveTrucks() {

    trucks.forEach((t, i) => {

        if (!routeReady[t.id]) return;

        let path = routes[t.id];

        if (!path || path.length === 0) return;

        let index = routeIndex[t.id];

        if (index < path.length) {

            let pos = path[index];

            // move truck
            t.lat = pos.lat;
            t.lng = pos.lng;

            markers[i].setLatLng([t.lat, t.lng]);

            // simulate speed
            t.speed = Math.random() * 90;

            // status
            t.moving = true;

            // alerts
            if (t.speed > 80) {
                addAlert(`⚡ SPEED ALERT: ${t.id}`, "yellow");
            }

            // advance route step
            routeIndex[t.id]++;

        } else {

            t.moving = false;

            markers[i].setIcon(redIcon);

            addAlert(`🏁 ARRIVED: ${t.id} reached ${t.to[0]}`, "red");
        }

    });
}

// ================= RUN LOOP =================
setInterval(moveTrucks, 500);

// ================= OPTIONAL VIEW ALL =================
function viewAll() {

    let group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds());

}
