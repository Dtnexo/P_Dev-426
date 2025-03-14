import { MAPTILER_KEY } from "./map-key.js";

const map = new maplibregl.Map({
  style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`,
  center: [-74.0066, 40.7135],
  zoom: 15.5,
  pitch: 0,
  maxPitch: 0,
  bearing: 0,
  container: "map",
  canvasContextAttributes: { antialias: true },
});
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
  const res = await fetch("http://localhost:3003/api/site-details/" + id);
  if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

  let site_details = await res.json();
  const site_title = document.getElementById("site_title");
  const site_description = document.getElementById("site_description");
  //clear old content
  site_title.textContent = "";
  site_description.textContent = "";
  site_title.textContent = site_details[0].nom;
  site_description.textContent = site_details[0].description;
}

window.switchMaps = switchMaps;
window.showMore = showMore;
