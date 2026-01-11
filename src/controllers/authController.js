import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import { Session } from '../models/session.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendMail.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';

// Controller function to handle user registration
export const registerUser = async (req, res, next) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(createHttpError(400, 'Email is already in use'));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    email,
    password: hashedPassword,
  });

  const newSession = await createSession(newUser._id);
  setSessionCookies(res, newSession);

  res.status(201).json(newUser);
};

// Controller function to handle user login
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if(!user){
    return next(createHttpError(401, 'Invalid credentials'));
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return next(createHttpError(401, 'Invalid credentials'));
  }

  await Session.deleteOne({ userId: user._id });

  const newSession = await createSession(user._id);
  setSessionCookies(res, newSession);

  res.status(200).json(user);
};

// Controller function to handle session refresh
export const refreshUserSession = async (req, res, next) => {
  const { sessionId, refreshToken } = req.cookies;

  const session = await Session.findOne({
    _id: sessionId,
    refreshToken: refreshToken,
  });
  if (!session) {
    return next(createHttpError(401, 'Session not found'));
  }

  const isRefreshTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);
  if ( isRefreshTokenExpired) {
    return next(createHttpError(401, 'Refresh token expired'));
  }

  await Session.deleteOne({
    _id: sessionId,
    refreshToken: refreshToken
   });

  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  res.status(200).json({ message: "Session refreshed" });
};

// Controller function to handle user logout
export const logoutUser = async (req, res, next) => {
  const { sessionId } = req.cookies;

  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }

  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

// Controller function to handle password reset request
export const requestResetEmail = async(req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({ message: "Password reset email sent successfully." });
  }

  const resetToken = jwt.sign(
    { sub: user._id, email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Construct reset link (assuming frontend URL is stored in env variable)
  const templatePath = path.resolve(`src/templates/reset-password-email.html`);


  const templateSource = await fs.readFile(templatePath, 'utf-8');

  const template = handlebars.compile(templateSource);

  const html = template({
    name: user.username,
    link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`
  });

  try {
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Reset your password",
      html,
    });
  } catch (error) {
    console.error("SEND EMAIL ERROR:", error);
    next(createHttpError(500, 'Failed to send the email, please try again later.'));
    return;
  }

  res.status(200).json({ message: "Password reset email sent successfully." });
};

// Controller function to handle password reset
export const resetPassword = async (req, res, next) => {
  const { password, token } = req.body;

  let payLoad;
  try {
    payLoad = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    next(createHttpError(401, 'Invalid or expired token'));
    return;
  }

  console.log(payLoad);

  const user = await User.findOne({
    _id: payLoad.sub,
    email: payLoad.email
  });
  if (!user) {
    next(createHttpError(404, 'User not found'));
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.updateOne(
    { _id: user._id },
    { password: hashedPassword }
  );

  res.status(200).json({ message: 'Password reset successfully' });
};


