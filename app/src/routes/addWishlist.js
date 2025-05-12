import express from "express";
import { queryDatabase } from "../db/dbConnect.js";

const wishlistRouter = express.Router();

wishlistRouter.post("/", async (req, res) => {
  const { site_id } = req.body;
  const username = req.session.user.username; // Assuming you have the username in the session
  console.log("Username:", username);
  /*const userId = await queryDatabase(
    `SELECT user_id FROM t_user WHERE username = ?`,
    [username]
  );*/

  if (!site_id) {
    return res.status(400).json({ error: "site_id is required" });
  }

  try {
    // Example: Fetch `liste_favoris_id` based on the user (e.g., from session or token)
    const userId = req.session.user.user_id; // Assuming you use sessions
    console.log("User ID:", userId);
    const result = await queryDatabase(
      "SELECT wishlist_id FROM t_wishlist WHERE user_id = ?",
      [userId]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const liste_favoris_id = result[0].liste_favoris_id;

    // Insert into the wishlist table
    await queryDatabase(
      "INSERT INTO t_avoir (site_id, liste_favoris_id) VALUES (?, ?)",
      [site_id, liste_favoris_id]
    );

    res.status(200).json({ message: "Site added to wishlist" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error", details: error.message });
  }
});

export { wishlistRouter };
