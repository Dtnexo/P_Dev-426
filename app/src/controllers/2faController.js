import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const otpStorage = {};

export const get = (req, res) => {
  res.render("verify");
};

export const sendCode = async (req, res) => {
  if (!req.session.pending2FA || !req.session.pending2FA.email) {
    req.flash("error_msg", "Session expirée. Veuillez vous reconnecter.");
    return res.redirect("/login");
  }
  console.log("Sending OTP to:", req.session.pending2FA.email);

  const { email } = req.session.pending2FA; // Get email from session
  let min = 100000;
  let max = 999999;

  const code = Math.floor(Math.random() * (max - min + 1)) + min;

  otpStorage[email] = { code, expiresAt: Date.now() + 15 * 60 * 1000 }; // 5 min
  console.log(`Sending OTP ${code} to ${email}`); // Debugging

  const optionsEmail = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Votre code d'authentification",
    text: `Votre code est: ${code}. Il expire dans 15 minutes.`,
  };

  try {
    let info = await transporter.sendMail(optionsEmail);
    console.log("Email sent:", info.response);
    res.render("verify", { success_msg: "Code envoyé !" });
  } catch (error) {
    console.error("Email sending failed:", error);
  }
};

export const verifyCode = (req, res) => {
  const { code } = req.body;

  if (!req.session.pending2FA) {
    req.flash("error_msg", "Session expirée. Veuillez vous reconnecter.");
    return res.redirect("/login");
  }

  const { email, username, user_id } = req.session.pending2FA;

  if (
    otpStorage[email] &&
    otpStorage[email].code == code &&
    otpStorage[email].expiresAt > Date.now()
  ) {
    // Clear OTP & 2FA session
    delete otpStorage[email];
    delete req.session.pending2FA;

    // Create JWT token valid for 2 hours
    const token = jwt.sign(
      { user_id, username, email },
      process.env.SECRET_KEY,
      { expiresIn: "2h" }
    );

    // Store JWT token in an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevent access from JavaScript
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    });

    // Store final session
    req.session.user = { username, user_id };

    // Redirect to homepage after successful verification
    return res.redirect("/accueil");
  } else {
    req.flash("error_msg", "Code invalide ou expiré.");
    return res.redirect("/2fa");
  }
};
