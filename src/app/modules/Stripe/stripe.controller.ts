// stripe.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status";
import { StripeService } from "./stripe.service"; // Assume service for webhook

const handleWebhook = (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  StripeService.handleStripeWebhook(req.body)
    .then(() => res.status(httpStatus.OK).json({ received: true }))
    .catch((error) => res.status(httpStatus.BAD_REQUEST).send(`Webhook Error: ${error.message}`));
};

export const StripeController = {
  handleWebhook,
};