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
      `SELECT user_id, salt, password, email FROM t_user WHERE username = ?`,
      [username]
    );

    if (user.length === 0) {
      req.flash("error_msg", "Utilisateur introuvable !");
      return res.redirect("/login");
    }

    const { user_id, salt, password, email } = user[0];

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

    // Store user info in session before OTP verification
    req.session.pending2FA = { username, user_id, email };

    // Redirect user to 2FA OTP page
    res.redirect("/2fa");
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
