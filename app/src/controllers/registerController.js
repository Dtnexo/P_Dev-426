import { queryDatabase } from "../db/dbConnect.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import "dotenv/config";

const get = (req, res) => {
  res.render("../views/register");
};

const createUser = async (req, res) => {
  const salt = crypto.randomBytes(25).toString("base64");

  const usernamenew = req.body.username;
  const mail = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if (!usernamenew || !mail || !password) {
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

  try {
    // Check if the username or email already exists
    const isName = await queryDatabase(
      `SELECT username FROM t_user WHERE username = ?`,
      [usernamenew]
    );
    const isEmail = await queryDatabase(
      `SELECT email FROM t_user WHERE email = ?`,
      [mail]
    );

    if (isName.length === 0 && isEmail.length === 0) {
      const result = await queryDatabase(
        `INSERT INTO t_user (username, email, salt, password, dateCreation) VALUES(?,?,?,?, NOW());`,
        [usernamenew, mail, salt, hashedPassword]
      );

      // Retrieve the inserted user with insertId
      const [newUser] = await queryDatabase(
        "SELECT user_id, username, email FROM t_user WHERE user_id = ?",
        [result.insertId]
      );

      console.log("New user created:", newUser);
      const user_id = newUser.user_id;
      const username = newUser.username;

      const token = jwt.sign(
        { user_id: newUser.user_id, username, email: mail },
        process.env.SECRET_KEY,
        { expiresIn: "2h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 2 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
      });
      req.session.user = { username, user_id };
      // If 2FA is not enabled, redirect to homepage or a dashboard
      req.flash("success_msg", "Compte créé avec succès!");
      return res.redirect("/login"); // Redirect to homepage or user dashboard after registration
    } else {
      req.flash("error_msg", "Le prénom ou l'email est déjà utilisé!");
      return res.redirect("/register");
    }
  } catch (error) {
    console.error("Error during user creation:", error);
    req.flash("error_msg", "Une erreur s'est produite, veuillez réessayer.");
    return res.redirect("/register");
  }
};

export { createUser, get };
