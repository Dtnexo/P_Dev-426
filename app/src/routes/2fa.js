import express from "express";
import { get, sendCode, verifyCode } from "../controllers/2faController.js";

const twoFA = express.Router();

twoFA.get("/", get);
twoFA.post("/send", sendCode); // Sending the OTP
twoFA.post("/verify", verifyCode); // Verifying the OTP
twoFA.get("/resend", sendCode); // Resending OTP
twoFA.post("/send", sendCode);

export { twoFA };
