import { celebrate } from "celebrate";
import { Router } from "express";
import { requestResetEmailSchema, resetPasswordSchema } from "../validations/authValidation.js";
import { requestResetEmail, resetPassword } from "../controllers/authController.js";

const router = Router();

router.post('/auth/request-reset-email', celebrate(requestResetEmailSchema), requestResetEmail);

router.post("/auth/reset-password", celebrate(resetPasswordSchema), resetPassword);

export default router;
