import { queryDatabase } from "../db/dbConnect.js";
import crypto from "crypto";

const get = (req, res) => {
  res.render("../views/login");
};

const authenticateUser = async (req, res) => {
  try {
    // Récupérer le sel de l'utilisateur depuis la base de données
    const selResult = await queryDatabase(
      `SELECT Sel FROM t_user WHERE Username = ?;`,
      [req.body.username]
    );

    if (!selResult.length) {
      console.log("Le mot de passe ou le username est incorrect!");
      return;
    }

    const sel = selResult[0].Sel;

    // Hasher le mot de passe saisi avec le sel récupéré
    const hashedPassword = crypto
      .createHash("sha256")
      .update(sel + req.body.password)
      .digest("hex");

    // Vérifier si le mot de passe hashé correspond à celui stocké en base de données
    const passwordResult = await queryDatabase(
      `SELECT Password FROM t_user WHERE Username = ? AND Password = ?;`,
      [req.body.username, hashedPassword]
    );

    if (!passwordResult.length) {
      console.log("Le mot de passe ou le username est incorrect!");
    } else {
      console.log("Bravo, vous êtes authentifié!");
    }
  } catch (error) {
    console.error("Erreur d'authentification :", error);
  }
};
export { get, authenticateUser };
