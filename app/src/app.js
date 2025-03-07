import express, { urlencoded } from "express";
import session from "express-session";
import flash from "connect-flash";
import { loginRouter } from "./routes/login.js";
import { homeRouter } from "./routes/home.js";
import { registerRouter } from "./routes/register.js";
import { auth } from "./controllers/authController.js";
import { forumRouter } from "./routes/forum.js";
import { logoutRouter } from "./routes/logout.js";
import cookie from "cookie-parser";
import { queryDatabase } from "../src/db/dbConnect.js";
import cors from "cors";

const app = express();
const port = 3003;

import path from "path";
import { fileURLToPath } from "url";

// Définition des variables pour obtenir le chemin du fichier et du dossier
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors());

// Redirige la page d'accueil vers /accueil
app.get("/", (req, res) => {
  res.redirect("/accueil");
});

// Configuration des sessions utilisateur
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

// Active le parsing des données envoyées en formulaire
app.use(express.urlencoded()); // Ajouter { extended: true } pour prendre en charge les objets imbriqués

// Déclaration des routes
app.use("/accueil", homeRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/register", registerRouter);
app.use("/forum", auth, forumRouter); // Vérifier si auth doit s'appliquer à toutes les routes du forum

// Gestion des erreurs 404
app.use("/forum", auth, forumRouter);

app.get("/api/sites", async (req, res) => {
  try {
    const sites = await queryDatabase("SELECT * FROM SITES");
    res.json(sites); // Renvoie le JSON au client
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
