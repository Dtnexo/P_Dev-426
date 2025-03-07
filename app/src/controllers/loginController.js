import { queryDatabase } from "../db/dbConnect.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import session from "express-session";
import "dotenv/config";

const get = (req, res) => {
  res.render("../views/login");
};

const authenticateUser = async (req, res) => {
  try {
    const username = req.body.username;
    // Récupérer le sel de l'utilisateur sur la base de données
    const sel = await queryDatabase(
      `SELECT salt FROM t_user WHERE prenom = ?;`,
      [username]
    );
    console.log(sel);
    // Stocker la valeur du sel
    const selResult = sel[0].salt;

    const hashedPassword = crypto
      .createHash("sha256")
      .update(selResult + req.body.password)
      .digest("hex");

    // Récupérer le mot de passe sur le form et la base de donnée,
    // hasher le mdp du form avec le sel et le comparer au mdp de la db
    const password = await queryDatabase(
      `SELECT password FROM t_user WHERE prenom = ? AND password LIKE ?;`,
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
      const token = jwt.sign({ username: username }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      // httpOnly pour que le côté client n'accède pas au cookie, maxAge pour que le cookie expire dans 1h
      req.session.user = { username: "test" };
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

const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};
export { get, authenticateUser, logout };
