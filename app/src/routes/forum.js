import express from "express";
import { queryDatabase } from "../db/dbConnect.js";
import { auth } from "../controllers/authController.js";

const forumRouter = express.Router();

// GET route for displaying posts
forumRouter.get("/", auth, async (req, res) => {
  try {
    const posts = await queryDatabase(
      "SELECT * FROM t_publication ORDER BY datePublication DESC"
    );
    // Render the forum page with posts and no error
    res.render("forum", { posts, error: null });
  } catch (err) {
    res.status(500).render("forum", {
      posts: [],
      error: "Erreur lors de la récupération des posts",
    });
  }
});

// POST route for adding a new post
forumRouter.post("/", auth, async (req, res) => {
  const { sujet, contenu } = req.body;
  const user_id = req.user.user_id;
  if (!sujet || !contenu) {
    return res.status(400).render("forum", {
      error: "Sujet et contenu sont requis",
      posts: await queryDatabase(
        "SELECT * FROM t_publication ORDER BY datePublication DESC"
      ),
    });
  }
  console.log(user_id);
  try {
    const datePublication = new Date();
    await queryDatabase(
      "INSERT INTO t_publication (sujet, contenu, datePublication, user_id) VALUES (?, ?, ?, ?)",
      [sujet, contenu, datePublication, user_id]
    );
    // Redirect back to the forum page after successfully adding a post
    res.redirect("/forum");
  } catch (err) {
    res.status(500).render("forum", {
      error: "Erreur lors de l'ajout du post",
      posts: await queryDatabase(
        "SELECT * FROM t_publication ORDER BY datePublication DESC"
      ),
    });
  }
});

export { forumRouter };
