import express from "express";
import { queryDatabase } from "../db/dbConnect.js";

const wishlistRouter = express.Router();

import jwt from "jsonwebtoken";

// Middleware to verify token and attach user info to request
function authenticateToken(req, res, next) {
  const token = req.cookies?.P_Dev;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden: Invalid token" });
    }
    req.user = user; // Attach decoded token payload to request
    next();
  });
}

// Use this middleware in your wishlistRouter POST handler

wishlistRouter.post("/", authenticateToken, async (req, res) => {
  const { site_id } = req.body;

  if (!site_id) {
    return res.status(400).json({ error: "site_id is required" });
  }

  const userId = req.user.user_id; // from token

  try {
    await queryDatabase(
      "INSERT INTO t_wishlist (user_id, site_id) VALUES (?, ?)",
      [userId, site_id]
    );

    res.status(200).json({ message: "Site added to wishlist" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error", details: error.message });
  }
});

export { wishlistRouter };
