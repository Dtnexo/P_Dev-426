import express from "express";
import { get } from "../controllers/forumController.js";

const forumRouter = express.Router();
forumRouter.get("/", get);

forumRouter.post("/", (req, res) => {});

export { forumRouter };
