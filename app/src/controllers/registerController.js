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
    req.flash("error_msg", "Tout les champs doivent être remplis!");
    res.redirect("/register");
    return;
  }

  if (password.length < 8) {
    req.flash(
      "error_msg",
      "Le mot de passe doit contenir au moins 8 caractères!"
    );
    res.redirect("/register");
    return;
  }
  if (password !== confirmPassword) {
    req.flash("error_msg", "Les mots de passe ne correspondent pas!");
    res.redirect("/register");
    return;
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
  console.log(isEmail);
  if (isName.length === 0 && isEmail.length === 0) {
    await queryDatabase(
      `INSERT INTO t_user (username, email, salt, password, created_at) VALUES(?,?,?,?, NOW());`,
      [username, mail, salt, hashedPassword]
    );

    const token = jwt.sign({ username: username }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    // httpOnly pour que le côté client n'accède pas au cookie, maxAge pour que le cookie expire dans 1h
    req.session.user = { username: isName };
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
    res.redirect("/accueil");
  } else {
    req.flash("error_msg", "Le prénon ou l'email est déjà utilisé!");
    res.redirect("/register");
  }
};

export { createUser, get };
