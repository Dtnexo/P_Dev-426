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

    const user = await queryDatabase(
      `SELECT user_id, salt, password FROM t_user WHERE username = ?`,
      [username]
    );

    if (user.length === 0) {
      req.flash("error_msg", "Utilisateur introuvable !");
      return res.redirect("/login");
    }

    const { user_id, salt, password } = user[0];

    console.log("User ID Retrieved:", user_id); // Debugging step

    const hashedPassword = crypto
      .createHash("sha256")
      .update(salt + req.body.password)
      .digest("hex");

    if (password !== hashedPassword) {
      req.flash(
        "error_msg",
        "Le nom d'utilisateur ou le mot de passe est incorrect !"
      );
      return res.redirect("/login");
    }

    const token = jwt.sign({ username, user_id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    req.session.user = { username };
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
    res.redirect("/accueil");
  } catch (error) {
    console.error("Authentication Error:", error);
    req.flash("error_msg", "Une erreur s'est produite !");
    res.redirect("/login");
  }
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("token");
    res.redirect("/login");
  });
};
export { get, authenticateUser, logout };
