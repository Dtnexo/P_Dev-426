import { MAPTILER_KEY } from "./map-key.js";

function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error("La géolocalisation n'est pas supportée par ce navigateur.")
      );
    } else {
      navigator.geolocation.getCurrentPosition(resolve, () => {
        reject(new Error("Impossible d'obtenir la position de l'utilisateur."));
      });
    }
  });
}

// Position par défaut (ETML)
const defaultCenter = [6.615623, 46.524281];

// Création de la carte avec la position par défaut
const map = new maplibregl.Map({
  style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`,
  center: defaultCenter,
  zoom: 15.5,
  pitch: 0,
  maxPitch: 0,
  bearing: 0,
  container: "map",
  canvasContextAttributes: { antialias: true },
});

// Tente de récupérer la position utilisateur
try {
  const position = await getUserLocation();
  const { latitude, longitude } = position.coords;

  // Recentrer la carte
  map.setCenter([longitude, latitude]);

  // Optionnel : ajouter un marqueur sur la position de l'utilisateur
  //new maplibregl.Marker().setLngLat([longitude, latitude]).addTo(map);

  console.log("Position utilisateur :", latitude, longitude);
} catch (error) {
  console.warn(error.message);
}

const pathToJson = "/static/sites.json";
async function fetchAndDisplaySites() {
  try {
    const res = await fetch("http://localhost:3003/api/sites"); // Appelle l'API
    if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

    let sites = await res.json();

    const features = sites.map((site) => ({
      type: "Feature",
      properties: {
        description:
          "<strong>" +
          site.nom +
          "</strong>" +
          site.description +
          "<button onclick='showMore(" +
          site.site_id +
          ")'>plus</button>",
      },

      geometry: {
        type: "Point",
        coordinates: [site.lon, site.lat], // Correction ici
      },
    }));

    // Vérifie si la source existe déjà, sinon la crée
    if (map.getSource("unescoSites")) {
      map.getSource("unescoSites").setData({
        type: "FeatureCollection",
        features: features,
      });
    } else {
      map.addSource("unescoSites", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: features,
        },
      });

      map.addLayer({
        id: "unescoSitesLayer",
        type: "circle",
        source: "unescoSites",
        paint: {
          "circle-radius": 6,
          "circle-color": "#ff0000",
        },
      });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des sites:", error);
  }
}

// The 'building' layer in the streets vector source contains building-height
// data from OpenStreetMap.
map.on("load", () => {
  fetchAndDisplaySites();
});

map.on("click", "unescoSitesLayer", (e) => {
  const coordinates = e.features[0].geometry.coordinates.slice();
  const description = e.features[0].properties.description;

  // Ensure that if the map is zoomed out such that multiple
  // copies of the feature are visible, the popup appears
  // over the copy being pointed to.
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }

  new maplibregl.Popup().setLngLat(coordinates).setHTML(description).addTo(map);
});
map.on("mouseenter", "unescoSitesLayer", () => {
  map.getCanvas().style.cursor = "pointer";
});

// Change it back to a pointer when it leaves.
map.on("mouseleave", "unescoSitesLayer", () => {
  map.getCanvas().style.cursor = "";
});

// document
//   .getElementById("switch-map-button")
//   .addEventListener("click", switchMaps());

function switchMaps() {
  if (map.getLayer("3d-buildings")) {
    // remove 3d layer, set pitch to 90, lock rightclick
    //console.log(map.getPitch());
    map.removeLayer("3d-buildings");
    map.setPitch(0);
    map.setMaxPitch(0);
    document.getElementById("switch-map-button").innerText = "3d";
  } else {
    // add a 3d layer, unlock pitch and rightclcik
    map.setMaxPitch(80);
    map.setPitch(45);
    document.getElementById("switch-map-button").innerText = "2d";
    const layers = map.getStyle().layers;

    let labelLayerId;
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
        labelLayerId = layers[i].id;
        break;
      }
    }

    if (!map.getSource("openmaptiles")) {
      map.addSource("openmaptiles", {
        url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${MAPTILER_KEY}`,
        type: "vector",
      });
    }

    map.addLayer(
      {
        id: "3d-buildings",
        source: "openmaptiles",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 15,
        filter: ["!=", ["get", "hide_3d"], true],
        paint: {
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["get", "render_height"],
            0,
            "lightgray",
            200,
            "royalblue",
            400,
            "lightblue",
          ],
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            16,
            ["get", "render_height"],
          ],
          "fill-extrusion-base": [
            "case",
            [">=", ["get", "zoom"], 16],
            ["get", "render_min_height"],
            0,
          ],
        },
      },
      labelLayerId
    );
  }
}

async function showMore(id) {
  // Récupérer les détails du site
  const res = await fetch(`http://localhost:3003/api/site-details/` + id);
  if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
  let site_details = await res.json();

  // Sélectionner les éléments du DOM
  const site_title = document.getElementById("site_title");
  const site_description = document.getElementById("site_description");
  const favoriteButton = document.getElementById("favoriteButton");
  const favoriteId = document.getElementById("favoriteId");

  // Vérifier les favoris pour désactiver le bouton si nécessaire
  const favRes = await fetch("http://localhost:3003/api/favorites");
  if (favRes.status == 401) {
    window.location.replace("http://localhost:3003/login");
  }
  if (!favRes.ok) throw new Error(`Erreur HTTP: ${favRes.status}`);
  let favSites = await favRes.json();

  // Vérifier si le site est déjà dans les favoris
  let buttonDisabled = false; // Par défaut, le bouton est activé
  for (let site of favSites) {
    if (site.titre == id) {
      buttonDisabled = true; // Site trouvé dans les favoris, désactiver le bouton
      break;
    }
  }

  // Mettre à jour le bouton selon l'état
  favoriteButton.textContent = buttonDisabled
    ? "Déjà dans les favoris"
    : "Ajouter aux favoris";
  favoriteButton.disabled = buttonDisabled;
  favoriteButton.style.display = "block";

  // Effacer l'ancien contenu
  site_title.textContent = "";
  site_description.textContent = "";
  favoriteId.textContent = "";

  // Mettre à jour avec les nouveaux détails
  site_title.textContent = site_details[0].nom;
  site_description.textContent = site_details[0].description;
  favoriteId.textContent = site_details[0].site_id;
}

async function countrySearch(country) {
  const res = await fetch(
    "http://localhost:3003/api/country-search?country=" + country
  );
  if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

  let sites = await res.json();
  updateSites(sites);
}

async function regionSearch(region) {
  const res = await fetch(
    "http://localhost:3003/api/region-search?region=" + region
  );
  if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

  let sites = await res.json();
  updateSites(sites);
}

async function showFavorites() {
  const res = await fetch("http://localhost:3003/api/favorites");
  if (res.status == 401) {
    window.location.replace("http://localhost:3003/login");
  }
  if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

  let sites = await res.json();
  updateSites(sites);
}

function updateSites(sites) {
  const features = sites.map((site) => ({
    type: "Feature",
    properties: {
      description:
        "<strong>" +
        site.nom +
        "</strong>" +
        site.description +
        "<button onclick='showMore(" +
        site.site_id +
        ")'>plus</button>",
    },

    geometry: {
      type: "Point",
      coordinates: [site.lon, site.lat], // Correction ici
    },
  }));
  map.removeLayer("unescoSitesLayer");
  map.removeSource("unescoSites");
  map.addSource("unescoSites", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: features,
    },
  });
  map.addLayer({
    id: "unescoSitesLayer",
    type: "circle",
    source: "unescoSites",
    paint: {
      "circle-radius": 6,
      "circle-color": "#ff0000",
    },
  });
}

async function addToFavorites() {
  const favoriteId = document.getElementById("favoriteId");
  const site_id = favoriteId.textContent;
  const res = await fetch(
    "http://localhost:3003/api/addToFavorites?site_id=" + site_id
  );
  if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
  if (res.status == 200) {
    const favoriteButton = document.getElementById("favoriteButton");
    favoriteButton.textContent = "";
    favoriteButton.textContent = "Deja dans les favoris";
    favoriteButton.disabled = true;
  }
}

window.switchMaps = switchMaps;
window.showMore = showMore;
window.showFavorites = showFavorites;
window.addToFavorites = addToFavorites;

//recherche par pays
//note: recherche predictive:
// mettre <input onInput="func()"
document
  .getElementById("country-search")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      let country = this.value;
      countrySearch(country);
    }
  });

//recherche par region
//note: recherche predictive:
// mettre <input onInput="func()"
document
  .getElementById("region-search")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      let region = this.value;
      regionSearch(region);
    }
  });
