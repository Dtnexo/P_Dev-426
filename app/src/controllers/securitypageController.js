import "dotenv/config";
import { queryDatabase } from "../db/dbConnect.js"; // <-- Ton fichier de connexion

const get = (req, res) => {
  console.log(req.session.user);
  res.render("securitypage", { user: req.session.user || null });
};

// Mise à jour du nom
const updateName = async (req, res) => {
  try {
    console.log("BODY REÇU :", req.body);
    const { id, name } = req.body;

    if (!id || !name) {
      return res
        .status(400)
        .json({ success: false, error: "Champs manquants" });
    }

    const result = await queryDatabase(
      "UPDATE t_user SET username = ? WHERE user_id = ?",
      [name, id]
    );
    console.log("Résultat SQL:", result);

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
    console.error("Erreur updateName:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};

const update2FA = async (req, res) => {
  const { user_id, enable_2fa } = req.body;

  if (!user_id) {
    return res.status(400).json({ success: false, message: "Missing user ID" });
  }

  try {
    await queryDatabase("UPDATE t_user SET has_2_fa = ? WHERE user_id = ?", [
      enable_2fa ? 1 : 0,
      user_id,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating 2FA:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

export { get, updateName, update2FA };
