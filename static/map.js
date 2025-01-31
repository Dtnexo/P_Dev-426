const map = L.map("map").setView([46.523268, 6.615687], 13); //ETML
const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 20,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const pathToJson = "/static/sites.json";

async function fetchAndDisplaySites() {
  try {
    const res = await fetch(pathToJson);
    if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
    //attende que la requete soit finie
    const sites = await res.json(); // Pas besoin de JSON.parse(), fetch().json() le fait déjà

    for (const site of sites) {
      //console.log(`Longitude: ${site.coordinates.lon}, Latitude: ${site.coordinates.lat}`);
      L.circle([site.coordinates.lat, site.coordinates.lon], {
        radius: 1,
        color: "red",
      })
        .addTo(map)
        .bindPopup(
          "<b>" +
            site.site +
            "</b>" +
            "<br>" +
            site.short_description.slice(0, 100) + //only shows the first 100chars
            "..."
        );
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des sites:", error);
  }
}

// Appel de la fonction
fetchAndDisplaySites();

// let circle = L.circle([46.523268, 6.615687], {
//   radius: 1,
//   color: "red",
// }).addTo(map);
//inverser lon et lat
//[lat, lon];
