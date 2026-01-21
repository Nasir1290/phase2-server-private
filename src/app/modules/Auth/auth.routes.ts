import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidation } from "../User/user.validation";
import { AuthController } from "./auth.controller";
import { authValidation } from "./auth.validation";

const router = express.Router();

// user login route
router.post(
  "/login",
  validateRequest(UserValidation.UserLoginValidationSchema),
  AuthController.loginUser
);

router.post("/otp-enter", AuthController.enterOtp);

// user logout route
router.post("/logout", AuthController.logoutUser);

router.get("/get-me", auth(), AuthController.getMyProfile);

// router.post("/social-login", AuthController.socialLogin);

router.put(
  "/change-password",
  auth(),
  AuthController.changePassword
);

router.post("/forgot-password", AuthController.forgotPassword);

router.post("/reset-password", AuthController.resetPassword);

export const AuthRoutes = router;
