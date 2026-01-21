// admin.route.ts (or integrate into existing routes if preferred)
import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AdminController } from "./admin.controller";
import { AdminValidation } from "./admin.validation"; // New validation file for admin actions

const router = express.Router();

// Create subscription plan (admin only)
router.post(
  "/subscription-plans",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(AdminValidation.createSubscriptionPlan),
  AdminController.createSubscriptionPlan
);

// Create promotion (admin only)
router.post(
  "/promotions",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(AdminValidation.createPromotion),
  AdminController.createPromotion
);

export const AdminRoutes = router;
