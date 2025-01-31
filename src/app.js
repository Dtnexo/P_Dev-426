import express, { urlencoded } from "express";
import { loginRouter } from "./routes/login.js";
import { homeRouter } from "./routes/home.js";
import { registerRouter } from "./routes/register.js";

const app = express();
const port = 3003;

app.set("views", "src/views");
app.set("view engine", "ejs");
app.use(express.urlencoded());

app.use("/", homeRouter);

app.use("/login", loginRouter);

app.use("/register", registerRouter);

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
