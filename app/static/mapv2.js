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

// Immediately Invoked Async Function to get user position and center map
(async () => {
  try {
    const position = await getUserLocation();
    const { latitude, longitude } = position.coords;

    // Recentrer la carte
    map.setCenter([longitude, latitude]);

    // Optionnel : ajouter un marqueur sur la position de l'utilisateur
    // new maplibregl.Marker().setLngLat([longitude, latitude]).addTo(map);

    console.log("Position utilisateur :", latitude, longitude);
  } catch (error) {
    console.warn(error.message);
  }
})();

async function fetchAndDisplaySites() {
  try {
    const res = await fetch("http://localhost:3003/api/sites"); // Appelle l'API
    if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

    const sites = await res.json();

    const features = sites.map((site) => ({
      type: "Feature",
      properties: {
        description:
          `<div class='popup-text'><strong>${site.nom}</strong><br>${site.description}</div>` +
          `<button onclick='showMore(${site.site_id})'>plus</button>`,
      },
      geometry: {
        type: "Point",
        coordinates: [site.lon, site.lat],
      },
    }));

    // Vérifie si la source existe déjà, sinon la crée
    if (map.getSource("unescoSites")) {
      map.getSource("unescoSites").setData({
        type: "FeatureCollection",
        features,
      });
    } else {
      map.addSource("unescoSites", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features,
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

map.on("load", () => {
  fetchAndDisplaySites();
});

map.on("click", "unescoSitesLayer", (e) => {
  const coordinates = e.features[0].geometry.coordinates.slice();
  const description = e.features[0].properties.description;

  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }

  new maplibregl.Popup().setLngLat(coordinates).setHTML(description).addTo(map);
});

map.on("mouseenter", "unescoSitesLayer", () => {
  map.getCanvas().style.cursor = "pointer";
});
map.on("mouseleave", "unescoSitesLayer", () => {
  map.getCanvas().style.cursor = "";
});

function switchMaps() {
  if (map.getLayer("3d-buildings")) {
    map.removeLayer("3d-buildings");
    map.setPitch(0);
    map.setMaxPitch(0);
    document.getElementById("switch-map-button").innerText = "3d";
  } else {
    map.setMaxPitch(80);
    map.setPitch(45);
    document.getElementById("switch-map-button").innerText = "2d";

    const layers = map.getStyle().layers;
    let labelLayerId;
    for (const layer of layers) {
      if (
        layer.type === "symbol" &&
        layer.layout &&
        layer.layout["text-field"]
      ) {
        labelLayerId = layer.id;
        break;
      }
    }

    if (!map.getSource("openmaptiles")) {
      map.addSource("openmaptiles", {
        url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${MAPTILER_KEY}`,
        type: "vector",
      });
    }

    if (!map.getLayer("3d-buildings")) {
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
}

async function showMore(id) {
  try {
    const res = await fetch(`http://localhost:3003/api/site-details/${id}`);
    if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

    const site_details = await res.json();

    const site_title = document.getElementById("site_title");
    const site_description = document.getElementById("site_description");
    const historiqueButton = document.getElementById("historiqueButton");
    const wishlistButton = document.getElementById("wishlistButton");
    const wishlistId = document.getElementById("wishlistId");

    // Show buttons
    historiqueButton.style.display = "inline-block";
    wishlistButton.style.display = "inline-block";
    wishlistButton.disabled = false;
    wishlistButton.textContent = "Ajouter à la Wishlist";

    // Update site details
    if (wishlistId) wishlistId.textContent = site_details[0].site_id;
    site_title.textContent = site_details[0].nom;
    site_description.textContent = site_details[0].description;
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du site:", error);
  }
}

window.showMore = showMore;

async function countrySearch(country) {
  try {
    const res = await fetch(
      `http://localhost:3003/api/country-search?country=${encodeURIComponent(
        country
      )}`
    );
    if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

    const sites = await res.json();
    updateSites(sites);
  } catch (error) {
    console.error("Erreur lors de la recherche par pays:", error);
  }
}

async function regionSearch(region) {
  try {
    const res = await fetch(
      `http://localhost:3003/api/region-search?region=${encodeURIComponent(
        region
      )}`
    );
    if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

    const sites = await res.json();
    updateSites(sites);
  } catch (error) {
    console.error("Erreur lors de la recherche par région:", error);
  }
}
let isWishlistShown = false;
async function showFavorites() {
  // si on clique une deuxieme fois sur le bouton wishlist on montre tout les sites
  if (isWishlistShown) {
    fetchAndDisplaySites();
  }
  isWishlistShown = !isWishlistShown;
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
        `<strong>${site.nom}</strong><br>${site.description}` +
        `<button onclick='showMore(${site.site_id})'>plus</button>`,
    },
    geometry: {
      type: "Point",
      coordinates: [site.lon, site.lat],
    },
  }));

  if (map.getLayer("unescoSitesLayer")) map.removeLayer("unescoSitesLayer");
  if (map.getSource("unescoSites")) map.removeSource("unescoSites");

  map.addSource("unescoSites", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features,
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

async function addToWishlist() {
  const wishlistIdElem = document.getElementById("wishlistId");
  if (!wishlistIdElem) {
    console.error("Élément wishlistId introuvable !");
    return;
  }

  const site_id = wishlistIdElem.textContent.trim();
  if (!site_id) {
    console.error("L'ID du site est vide !");
    return;
  }

  try {
    const res = await fetch("http://localhost:3003/addToWishlist", {
      method: "POST", // Use POST for database modifications
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ site_id }),
    });

    if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

    if (res.status === 200) {
      const wishlistButton = document.getElementById("wishlistButton");
      if (wishlistButton) {
        wishlistButton.textContent = "Déjà dans la Wishlist";
        wishlistButton.disabled = true;
      }
      console.log("Site ajouté aux favoris avec succès !");
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout aux favoris :", error.message);
  }
}

window.switchMaps = switchMaps;
window.showMore = showMore;
window.showFavorites = showFavorites;
window.showHistorique = showHistorique;
window.addToWishlist = addToWishlist;

async function fetchAndDisplayHistorique() {
  try {
    const res = await fetch("http://localhost:3003/api/sites-historique");
    if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

    const sites = await res.json();
    updateSites(sites);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique :", error);
  }
}

// Event listeners for search forms (if you have search inputs)
document
  .getElementById("countrySearchForm")
  ?.addEventListener("submit", (e) => {
    e.preventDefault();
    const country = e.target.elements["countryInput"].value;
    countrySearch(country);
  });

document.getElementById("regionSearchForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const region = e.target.elements["regionInput"].value;
  regionSearch(region);
});

// Export functions if using modules (optional)
export {
  showMore,
  switchMaps,
  addToWishlist,
  showFavorites,
  fetchAndDisplayHistorique,
  countrySearch,
  regionSearch,
};
