export const displayMap = (locations) => {
    const startLocation = locations[0];
    const [y, x] = startLocation.coordinates;
    const map = L.map('map').setView([x, y], 8);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const points = [];
    locations.forEach((loc) => {
        const [y, x] = loc.coordinates;
        points.push([x, y]);
        L.marker([x, y])
            .addTo(map)
            .bindPopup(`Day ${loc.day}: ${loc.description}`, {
                autoClose: false,
            })
            .openPopup();
    });

    const bounds = L.latLngBounds(points).pad(0.5);
    map.fitBounds(bounds);
    map.scrollWheelZoom.disable();
};
