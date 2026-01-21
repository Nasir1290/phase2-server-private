// subscription.route.ts
import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { SubscriptionController } from "./subscription.controller";
import { SubscriptionValidation } from "./subscription.validation"; // Assume this file exists with Zod schemas

const router = express.Router();

router.get("/get-all", SubscriptionController.getAllSubscriptionPlan);

router.post(
  "/create",
  auth(),
  validateRequest(SubscriptionValidation.createSubscription),
  SubscriptionController.createSubscription
);

router.post("/cancel", auth(), SubscriptionController.cancelSubscription);

router.post(
  "/update/:id",
  auth(),
  validateRequest(SubscriptionValidation.updateSubscription),
  SubscriptionController.updateSubscription
);

router.post(
  "/reactivate/:id",
  auth(),
  SubscriptionController.reactivateSubscription
);

router.get(
  "/my-subscription",
  auth(),
  SubscriptionController.getUserSubscription
);

export const SubscriptionRoutes = router;
