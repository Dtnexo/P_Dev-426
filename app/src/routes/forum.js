import express from "express";
import { auth } from "../controllers/authController.js";
import { getPosts, addPost } from "../controllers/forumController.js";

const forumRouter = express.Router();

forumRouter.get("/", auth, getPosts);
forumRouter.post("/", auth, addPost);

export { forumRouter };
