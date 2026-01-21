// stripe.route.ts (separate for webhook)
import express from "express";
import { StripeController } from "./stripe.controller";

const router = express.Router();
// router.get("/", () => console.log("object"));
router.post(
  "/webhooks",
  express.raw({ type: "application/json" }),
  StripeController.handleWebhook
);

export const StripeRoutes = router;
