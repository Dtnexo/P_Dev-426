import express, { urlencoded } from "express";
import session from "express-session";
import flash from "connect-flash";
import { loginRouter } from "./routes/login.js";
import { homeRouter } from "./routes/home.js";
import { registerRouter } from "./routes/register.js";
import { auth } from "./controllers/authController.js";
import { forumRouter } from "./routes/forum.js";
import cookie from "cookie-parser";

const app = express();
const port = 3003;

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req, res) => {
  res.redirect("/accueil");
});
app.use(express.json());
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 },
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

app.use(cookie());
app.use("/static", express.static(path.join(__dirname, "../static")));

app.set("views", "src/views");
app.set("view engine", "ejs");
app.use(express.urlencoded());

app.use("/accueil", auth, homeRouter);

app.use("/login", loginRouter);

app.use("/register", registerRouter);

app.use("/forum", auth, forumRouter);

// Si aucune route ne correspondant à l'URL demandée par le consommateur
// On place le code a la fin, car la requette passera d'abord par les autres route, et si aucune ne correspond la route n'est pas trouvé donc 404
app.use(({ res }) => {
  const message =
    "Impossible de trouver la ressource demandée ! Vous pouvez essayer une autre URL.";
  res.status(404).json(message);
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
