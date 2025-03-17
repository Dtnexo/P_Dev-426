import express from "express";
import { get } from "../controllers/profileController.js";

const profileRouter = express.Router();
profileRouter.get("/", get);

export { profileRouter };
