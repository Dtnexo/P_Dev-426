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
      //dans le json:  lon et lat
      //Mais il faut inverser => [lat, lon];
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
            '<p style="text-overflow: ellipsis; max-height: 100px; white-space: nowrap; max-width: 300px; overflow: hidden;">' +
            site.short_description +
            "</p>"
        );
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des sites:", error);
  }
}

fetchAndDisplaySites();
