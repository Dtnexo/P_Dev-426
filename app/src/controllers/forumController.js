// controllers/forumController.js
import { queryDatabase } from "../db/dbConnect.js";

export const getPosts = async (req, res) => {
  try {
    const posts = await queryDatabase(
      `SELECT t_publication.*, t_user.username 
       FROM t_publication 
       JOIN t_user ON t_publication.user_id = t_user.user_id
       ORDER BY datePublication DESC`
    );

    res.render("forum", { posts, error: null, user: req.session.user }); // Ensure user is passed
  } catch (err) {
    res.status(500).render("forum", {
      posts: [],
      error: "Erreur lors de la récupération des posts",
      user: req.user,
    });
  }
};

export const addPost = async (req, res) => {
  const { sujet, contenu } = req.body;
  const user_id = req.user?.user_id; // Ensure user exists
  if (!sujet || !contenu) {
    return res.status(400).render("forum", {
      error: "Sujet et contenu sont requis",
      posts: await queryDatabase(
        "SELECT * FROM t_publication ORDER BY datePublication DESC"
      ),
      user: req.user, // Pass user object
    });
  }

  try {
    const datePublication = new Date();
    await queryDatabase(
      "INSERT INTO t_publication (sujet, contenu, datePublication, user_id) VALUES (?, ?, ?, ?)",
      [sujet, contenu, datePublication, user_id]
    );
    res.redirect("/forum");
  } catch (err) {
    res.status(500).render("forum", {
      error: "Erreur lors de l'ajout du post",
      posts: await queryDatabase(
        "SELECT * FROM t_publication ORDER BY datePublication DESC"
      ),
      user: req.user, // Pass user object
    });
  }
};
