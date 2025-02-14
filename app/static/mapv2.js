const MAPTILER_KEY = "";
const map = new maplibregl.Map({
  style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`,
  center: [-74.0066, 40.7135],
  zoom: 15.5,
  pitch: 45,
  bearing: -17.6,
  container: "map",
  canvasContextAttributes: { antialias: true },
});
const pathToJson = "/static/sites.json";
async function fetchAndDisplaySites() {
  try {
    const res = await fetch(pathToJson);
    if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
    const sites = await res.json();

    const features = sites.map((site) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [site.coordinates.lon, site.coordinates.lat], // Correction ici
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
  // Insert the layer beneath any symbol layer.
  const layers = map.getStyle().layers;

  let labelLayerId;
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
      labelLayerId = layers[i].id;
      break;
    }
  }

  map.addSource("openmaptiles", {
    url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${MAPTILER_KEY}`,
    type: "vector",
  });

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

  fetchAndDisplaySites();
});
