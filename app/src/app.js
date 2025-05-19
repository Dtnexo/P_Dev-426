import express, { urlencoded } from "express";
import session from "express-session";
import flash from "connect-flash";
import { loginRouter } from "./routes/login.js";
import { homeRouter } from "./routes/home.js";
import { registerRouter } from "./routes/register.js";
import { auth } from "./controllers/authController.js";
import { forumRouter } from "./routes/forum.js";
import { logoutRouter } from "./routes/logout.js";
import { profileRouter } from "./routes/profile.js";
import { wishlistRouter } from "./routes/addWishlist.js";
import cookie from "cookie-parser";
import { queryDatabase } from "../src/db/dbConnect.js";
import cors from "cors";

import { infouserRouter } from "./routes/infouser.js";

import { twoFA } from "./routes/2fa.js";
const app = express();
const port = 3003;

import path from "path";
import { fileURLToPath } from "url";

// Définition des variables pour obtenir le chemin du fichier et du dossier
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors());
app.use(express.json()); // ← AJOUT ICI pour parser le body JSON
app.use(express.urlencoded({ extended: true })); // pour les formulaires classiques

// Redirige la page d'accueil vers /accueil
app.get("/", (req, res) => {
  res.redirect("/accueil");
});
app.use(
  session({
    secret: "your_secret_key", // Il est préférable d'utiliser une variable d'environnement pour la clé secrète
    resave: false, // Évite de sauvegarder la session si elle n'a pas été modifiée
    saveUninitialized: true, // Crée une session même si aucune donnée n'est stockée
    cookie: { maxAge: 60000 }, // La durée de la session est courte, à ajuster si nécessaire
  })
);

// Active les messages flash pour afficher des notifications temporaires
app.use(flash());

// Stocke les messages flash dans les variables locales accessibles aux vues
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

// Active le support des cookies
app.use(cookie());

// Définit un dossier statique pour les fichiers publics
app.use("/static", express.static(path.join(__dirname, "../static")));

// Définit le moteur de template et le dossier des vues
app.set("views", "src/views");
app.set("view engine", "ejs");

// Déclaration des routes
app.use("/accueil", homeRouter);
app.use("/infouser", auth, infouserRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/register", registerRouter);
app.use("/forum", auth, forumRouter); // Vérifier si auth doit s'appliquer à toutes les routes du forum
app.use("/profile", auth, profileRouter);
app.use("/2fa", twoFA);
app.use("/addToWishlist", wishlistRouter);

// Gestion des erreurs 404
app.use("/forum", auth, forumRouter);

app.get("/api/sites", async (req, res) => {
  try {
    const sites = await queryDatabase("SELECT * FROM t_sites");
    res.json(sites); // Renvoie le JSON au client
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/site-details/:id", async (req, res) => {
  try {
    const site_details = await queryDatabase(
      "SELECT * FROM t_sites WHERE site_id = " + req.params.id
    );
    res.json(site_details); // Renvoie le JSON au client
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/country-search", async (req, res) => {
  try {
    const sites = await queryDatabase(
      "SELECT * FROM t_sites WHERE states LIKE '-" + req.query.country + "%'"
    );
    res.json(sites); // Renvoie le JSON au client
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/region-search", async (req, res) => {
  try {
    const sites = await queryDatabase(
      "SELECT * FROM t_sites WHERE region LIKE '%" + req.query.region + "%'"
    );
    res.json(sites); // Renvoie le JSON au client
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/favorites", auth, async (req, res) => {
  try {
    const userID = req.session.user.user_id;
    const sites = await queryDatabase(
      "SELECT * FROM t_avoir av JOIN t_sites si ON si.site_id = av.site_id JOIN t_wishlist fav ON fav.wishlist_id = av.liste_favoris_id WHERE fav.user_id = " +
        userID
    );
    res.json(sites); // Renvoie le JSON au client
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/addToFavorites", auth, async (req, res) => {
  try {
    const userID = req.session.user.user_id;
    const site_id = req.query.site_id;
    await queryDatabase(
      "INSERT INTO t_wishlist (titre, user_id) VALUES (" +
        site_id +
        "," +
        userID +
        ");"
    );
    res.status(200).json({ message: "Favori ajouté avec succes" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//todo finir le cambertert: lier les donnnées de la route au frontend
//route pour le camembert
app.get("/api/continentWheel", async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) {
      return res.status(400).json({ error: "user_id is required" });
    }
    const query = `
      SELECT s.continent, COUNT(*) AS nombre_sites
      FROM t_historique lf
      JOIN t_sites s ON lf.site_id = s.site_id
      WHERE lf.user_id = ?
      GROUP BY s.continent;
    `;

    const sites = await queryDatabase(query, [userId]);
    res.json(sites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/countryWheel", async (req, res) => {
  try {
    const userId = req.query.user_id;
    const continent = req.query.continent;
    if (!userId) {
      return res.status(400).json({ error: "user_id is required" });
    }
    const query = `
      SELECT s.states, COUNT(*) AS nombre_sites
      FROM t_historique lf
      JOIN t_sites s ON lf.site_id = s.site_id
      WHERE lf.user_id = ? AND s.continent = ?
      GROUP BY s.states;
    `;

    const sites = await queryDatabase(query, [userId, continent]);
    res.json(sites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Si aucune route ne correspondant à l'URL demandée par le consommateur
// On place le code a la fin, car la requette passera d'abord par les autres route, et si aucune ne correspond la route n'est pas trouvé donc 404
app.use(({ res }) => {
  const message =
    "Impossible de trouver la ressource demandée. Vous pouvez essayer une autre URL.";
  res.status(404).json(message); // Une page HTML serait plus adaptée si l'application utilise EJS
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});

app.use(express.json());
