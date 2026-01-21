// promotion.route.ts
import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { PromotionController } from "./promotion.controller";
import { PromotionValidation } from "./promotion.validation"; // Assume this file exists with Zod schemas

const router = express.Router();

router.post(
  "/checkout",
  auth(),
  validateRequest(PromotionValidation.createCheckout),
  PromotionController.createPromotionCheckout
);

router.get("/history", auth(), PromotionController.getUserPromotionHistory);

router.post(
  "/apply-wallet",
  auth(),
  validateRequest(PromotionValidation.applyWallet),
  PromotionController.applyFromWallet
);

router.get("/all", PromotionController.getAllPromotions);

export const PromotionRoutes = router;
