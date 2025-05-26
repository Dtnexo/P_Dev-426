import "dotenv/config";
import { queryDatabase } from "../db/dbConnect.js"; // <-- Ton fichier de connexion
import { updateName } from "./infouserController.js";
import crypto from "crypto";

const get = (req, res) => {
  console.log("session :", JSON.stringify(req.session.user, null, 2));

  res.render("securitypage", { user: req.session.user || null });
};

const updatePassword = async (req, res) => {
  const salt = crypto.randomBytes(25).toString("base64");

  try {
    console.log("BODY REÇU :", req.body);
    const { id, password } = req.body;

    if (!id || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Champs manquants" });
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(salt + password)
      .digest("hex");

    const result = await queryDatabase(
      "UPDATE t_user SET password = ? WHERE user_id = ?",
      [hashedPassword, id]
    );

    const result2 = await queryDatabase(
      "UPDATE t_user SET salt = ? WHERE user_id = ?",
      [salt, id]
    );
    console.log("PASSWORD CHANGED:", result2);
    console.log("SALT CHANGED", result);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Utilisateur non trouvé" });
    }

    // Met à jour la session si besoin
    if (req.session.user && req.session.user.user_id === id) {
      req.session.user.username = name;
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Erreur updatePassword:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};

const update2FA = async (req, res) => {
  console.log("Requête reçue pour update2FA :", req.body);
  const { user_id, enable_2fa } = req.body;

  if (!user_id) {
    return res.status(400).json({ success: false, message: "Missing user ID" });
  }

  try {
    await queryDatabase("UPDATE t_user SET has_2_fa = ? WHERE user_id = ?", [
      enable_2fa ? 1 : 0,
      user_id,
    ]);
    if (req.session.user && req.session.user.user_id == user_id) {
      req.session.user.has_2_fa = enable_2fa ? 1 : 0;
      req.session.save((err) => {
        if (err) {
          console.error("Erreur lors de la sauvegarde de la session :", err);
        }
      });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating 2FA:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

export { get, updateName, update2FA, updatePassword };
