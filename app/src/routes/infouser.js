import express from "express";
import { get } from "../controllers/infouserController.js";

const infouserRouter = express.Router();
infouserRouter.get("/", get);

export { infouserRouter };
