import express from "express";
import { get, authenticateUser } from "../controllers/loginController.js";

const loginRouter = express.Router();
loginRouter.get("/", get);
loginRouter.post("/", authenticateUser);

export { loginRouter };
