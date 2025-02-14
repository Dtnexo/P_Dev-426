import express from "express";
import { get, createUser } from "../controllers/registerController.js";

const registerRouter = express.Router();
registerRouter.get("/", get);
registerRouter.post("/", createUser);

export { registerRouter };
