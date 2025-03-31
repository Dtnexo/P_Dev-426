import "dotenv/config";
import { queryDatabase } from "../db/dbConnect.js"; // <-- Ton fichier de connexion

// Rendu de la page "infouser"
const get = (req, res) => {
  console.log(req.session.user);
  res.render("infouser", { user: req.session.user || null });
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
    if (req.session.user && req.session.user_id === id) {
      req.session.user.username = name;
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Erreur updateName:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};

export { get, updateName };
