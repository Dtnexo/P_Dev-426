import "dotenv/config";
import { queryDatabase } from "../db/dbConnect.js";

import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Rendu de la page "infouser"
const get = async (req, res) => {
  console.log(
    "[GET /infouser] Chargement de la page avec session :",
    req.session.user
  );

  const name = await queryDatabase(
    `SELECT username FROM t_user Where user_id='${req.session.user.user_id}'`
  );
  req.session.user.username = name[0].username;
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

    req.session.user.username = name;
    req.session.user.user_id = id;
    req.session.save((err) => {
      if (err) {
        console.error("Erreur lors de la sauvegarde de la session :", err);
      }
    });
    console.log("mise a jour ", req.session.user.username);

    return res.json({ success: true });
  } catch (error) {
    //console.error("Erreur updateName:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};

// Upload de la photo de profil
const uploadProfilePicture = async (req, res) => {
  try {
    console.log("[POST /infouser/upload_profile_picture] Requête reçue");
    const { user_id } = req.body;
    const file = req.file;

    if (!user_id || !file) {
      console.warn("[uploadProfilePicture] Données manquantes :", {
        user_id,
        file,
      });
      return res
        .status(400)
        .json({ success: false, error: "Données manquantes" });
    }

    console.log(
      `[uploadProfilePicture] Upload pour user_id=${user_id}, taille fichier=${file.size} octets`
    );

    const result = await queryDatabase(
      "UPDATE t_user SET photoProfil = ? WHERE user_id = ?",
      [file.buffer, user_id]
    );
    console.log("[uploadProfilePicture] Résultat SQL :", result);

    if (result.affectedRows === 0) {
      console.warn(
        "[uploadProfilePicture] Aucun utilisateur trouvé pour ID :",
        user_id
      );
      return res
        .status(404)
        .json({ success: false, error: "Utilisateur non trouvé" });
    }

    console.log(
      "[uploadProfilePicture] Photo de profil mise à jour avec succès"
    );
    return res.json({ success: true });
  } catch (error) {
    console.error("[uploadProfilePicture] Erreur serveur :", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};

// Récupération de la photo de profil
const getProfilePicture = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("[GET /infouser/photo/:id] ID demandé :", id);

    const rows = await queryDatabase(
      "SELECT photoProfil FROM t_user WHERE user_id = ?",
      [id]
    );

    if (!rows || rows.length === 0) {
      console.warn("[getProfilePicture] Utilisateur introuvable :", id);
      return res.redirect("/static/image/userProfile.png");
    }

    const imageBuffer = rows[0].photoProfil;

    if (!imageBuffer) {
      console.log(
        "[getProfilePicture] Aucune photo stockée pour l’utilisateur :",
        id
      );
      return res.redirect("/static/image/userProfile.png");
    }

    console.log("[getProfilePicture] Image trouvée et envoyée pour ID :", id);
    res.set("Content-Type", "image/png");
    res.send(imageBuffer);
  } catch (error) {
    console.error("[getProfilePicture] Erreur serveur :", error);
    res.status(500).send("Erreur serveur");
  }
};

export { get, updateName, uploadProfilePicture, getProfilePicture, upload };
