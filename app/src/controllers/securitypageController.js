import "dotenv/config";
import { queryDatabase } from "../db/dbConnect.js"; // <-- Ton fichier de connexion

const get = (req, res) => {
  console.log(req.session.user);
  res.render("securitypage", { user: req.session.user || null });
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
