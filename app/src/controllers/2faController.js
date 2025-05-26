import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

// Email transport setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Temporary OTP store
const otpStorage = {};

// Render 2FA verification page
export const get = (req, res) => {
  res.render("verify");
};

export const sendCode = async (req, res) => {
  const pending = req.session.pending2FA;

  if (!pending || !pending.email) {
    req.flash("error_msg", "Session expirée. Veuillez vous reconnecter.");
    return res.redirect("/login");
  }

  // ✅ If 2FA is OFF, log in directly
  if (!pending.has_2_fa) {
    const { username, user_id, email } = pending;

    const token = jwt.sign(
      { user_id, username, email },
      process.env.SECRET_KEY,
      { expiresIn: "2h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 2 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    });

    req.session.user = { username, user_id };
    delete req.session.pending2FA; // Clear 2FA session flag

    return res.redirect("/accueil");
  }

  // ✅ Continue with OTP if 2FA is enabled
  const { email } = pending;
  const code = Math.floor(Math.random() * 900000) + 100000;

  otpStorage[email] = { code, expiresAt: Date.now() + 15 * 60 * 1000 };
  console.log(`Sending OTP ${code} to ${email}`);

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
    req.flash("error_msg", "Échec de l'envoi du code.");
    res.redirect("/2fa");
  }
};

// Verify OTP and log in
export const verifyCode = (req, res) => {
  const { code } = req.body;

  if (!req.session.pending2FA) {
    req.flash("error_msg", "Session expirée. Veuillez vous reconnecter.");
    return res.redirect("/login");
  }

  const { email, username, user_id, has_2_fa } = req.session.pending2FA;

  const storedOTP = otpStorage[email];
  const isValid =
    storedOTP && storedOTP.code == code && storedOTP.expiresAt > Date.now();

  if (isValid) {
    delete otpStorage[email];
    delete req.session.pending2FA;

    const token = jwt.sign(
      { user_id, username, email },
      process.env.SECRET_KEY,
      { expiresIn: "2h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 2 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    });

    req.session.user = { username, user_id, has_2_fa };
    return res.redirect("/accueil");
  } else {
    req.flash("error_msg", "Code invalide ou expiré.");
    return res.redirect("/2fa");
  }
};
