import { queryDatabase } from "../db/dbConnect.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import "dotenv/config";

const get = (req, res) => {
  res.render("../views/login");
};

const authenticateUser = async (req, res) => {
  try {
    const username = req.body.username;
    const user = await queryDatabase(
      `SELECT user_id, salt FROM t_user WHERE username = ?`,
      [username]
    );
    // Récupérer le sel de l'utilisateur sur la base de données
    const sel = await queryDatabase(
      `SELECT salt FROM t_user WHERE username = ?;`,
      [username]
    );
    // Stocker la valeur du sel
    const user_id = user[0].user_id; // Extract user_id from the result
    const selResult = user[0].salt;

    const hashedPassword = crypto
      .createHash("sha256")
      .update(selResult + req.body.password)
      .digest("hex");

    // Récupérer le mot de passe sur le form et la base de donnée,
    // hasher le mdp du form avec le sel et le comparer au mdp de la db
    const password = await queryDatabase(
      `SELECT password FROM t_user WHERE username = ? AND password LIKE ?;`,
      [username, hashedPassword]
    );
    if (password.length === 0) {
      req.flash(
        "error_msg",
        "le nom d'utilisateur ou le mot de passe est incorrect !"
      );
      res.redirect("/login");
      return;
    } else if (username == "" || password == "") {
      req.flash("error_msg", "Les champs ne doivent pas être vides !");
      res.redirect("/login");
    } else {
      console.log(process.env.SECRET_KEY);
      const token = jwt.sign(
        { username: username, user_id: user_id },
        process.env.SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );
      // httpOnly pour que le côté client n'accède pas au cookie, maxAge pour que le cookie expire dans 1h
      res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
      res.redirect("/accueil");
    }
  } catch (error) {
    req.flash(
      "error_msg",
      "le nom d'utilisateur ou le mot de passe est incorrect !"
    );
    res.redirect("/login");
  }
};
export { get, authenticateUser };
