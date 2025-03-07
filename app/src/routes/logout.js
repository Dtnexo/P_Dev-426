import express from "express";
import { logout } from "../controllers/loginController.js";

const logoutRouter = express.Router();
logoutRouter.get("/", logout);

export { logoutRouter };
