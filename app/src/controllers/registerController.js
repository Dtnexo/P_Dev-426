import { queryDatabase } from "../db/dbConnect.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { Session } from "inspector/promises";
import { error } from "console";

const get = (req, res) => {
  res.render("../views/register");
};

const createUser = async (req, res) => {
  const salt = crypto.randomBytes(25).toString("base64");

  const username = req.body.username;
  const mail = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if (!username || !mail || !password) {
    req.flash("error_msg", "Tous les champs doivent être remplis!");
    return res.redirect("/register");
  }

  if (password.length < 8) {
    req.flash(
      "error_msg",
      "Le mot de passe doit contenir au moins 8 caractères!"
    );
    return res.redirect("/register");
  }

  if (password !== confirmPassword) {
    req.flash("error_msg", "Les mots de passe ne correspondent pas!");
    return res.redirect("/register");
  }

  const hashedPassword = crypto
    .createHash("sha256")
    .update(salt + req.body.password)
    .digest("hex");

  const isName = await queryDatabase(
    `SELECT username FROM t_user WHERE username LIKE ?`,
    [username]
  );
  const isEmail = await queryDatabase(
    `SELECT email FROM t_user WHERE email LIKE ?`,
    [mail]
  );

  if (isName.length === 0 && isEmail.length === 0) {
    const result = await queryDatabase(
      `INSERT INTO t_user (username, email, salt, password, dateCreation) VALUES(?,?,?,?, NOW());`,
      [username, mail, salt, hashedPassword]
    );

    // Récupérer l'utilisateur inséré avec insertId
    const [newUser] = await queryDatabase(
      "SELECT user_id, username, email FROM t_user WHERE user_id = ?",
      [result.insertId]
    );

    // Stocker l'utilisateur dans la session pour 2FA
    req.session.pending2FA = newUser;

    return res.redirect("/2fa");
  } else {
    req.flash("error_msg", "Le prénom ou l'email est déjà utilisé!");
    return res.redirect("/register");
  }
};

export { createUser, get };
