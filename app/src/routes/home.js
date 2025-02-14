import express from "express";
import { get } from "../controllers/homeController.js";

const homeRouter = express.Router();
homeRouter.get("/", get);
export { homeRouter };
