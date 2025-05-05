import "dotenv/config";
import { queryDatabase } from "../db/dbConnect.js";

// Rendu de la page "infouser"
const get = (req, res) => {
  // console.log(req.session.user);
  res.render("infouser", { user: req.session.user || null });
};

// Mise à jour du nom
const updateName = async (req, res) => {
  try {
    const id = req.session.user.user_id;
    const name = req.body.name;
    const username = req.session.user.username;

    console.log("user : ", id);
    const result = await queryDatabase(
      "UPDATE t_user SET username = ? WHERE user_id = ?",
      [name, id]
    );
    console.log("Résultat SQL:", result);

    req.session.user.username = name;
    req.session.user.user_id = id;
    req.session.save((err) => {
      if (err) {
        console.error("Erreur lors de la sauvegarde de la session :", err);
      }
    });
    console.log(req.session.user.username);

    return res.json({ success: true });
  } catch (error) {
    //console.error("Erreur updateName:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};

export { get, updateName };
