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

    // Fetch user with has_2_fa flag
    const user = await queryDatabase(
      `SELECT user_id, salt, password, email, has_2_fa FROM t_user WHERE username = ?`,
      [username]
    );
    if (user.length === 0) {
      req.flash("error_msg", "Utilisateur introuvable !");
      return res.redirect("/login");
    }

    const { user_id, salt, password, email, has_2_fa } = user[0];
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

    // Use Boolean to properly handle values like 0, 'false', etc.
    if (has_2_fa == 1) {
      req.session.pending2FA = {
        username,
        user_id,
        email,
        has_2_fa: true,
      };
      return res.redirect("/2fa");
    } else {
      const token = jwt.sign(
        { user_id, username, email, has_2_fa },
        process.env.SECRET_KEY,
        { expiresIn: "2h" }
      );

      res.cookie("P_Dev", token, {
        httpOnly: true,
        maxAge: 2 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
      });

      req.session.user = {
        username,
        user_id,
        has_2_fa: Number(has_2_fa) === 1 ? 1 : 0,
      };
    }
    return res.redirect("/accueil");
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
