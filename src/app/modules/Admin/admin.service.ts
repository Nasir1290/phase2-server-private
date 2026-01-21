// admin.service.ts
import { PrismaClient, PromotionType, SubscriptionType } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";

export const AdminService = {
  createSubscriptionPlan: async (payload: {
    name: SubscriptionType;
    description: string;
    features: string[];
    monthlyPrice: number;
    sixMonthDiscount?: number; // Optional
    yearlyDiscount?: number; // Optional
    isActive: boolean;
    stripeProductId: string;
    stripeMonthlyPriceId: string;
    stripeSixMonthlyPriceId?: string; // Optional
    stripeYearlyPriceId?: string; // Optional
  }) => {
    const existingPlan = await prisma.subscriptionPlan.findFirst({
      where: { stripeProductId: payload.stripeProductId },
    });
    if (existingPlan) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Subscription plan already exists"
      );
    }

    const plan = await prisma.subscriptionPlan.create({
      data: payload,
    });

    return plan;
  },

  createPromotion: async (payload: {
    type: PromotionType;
    name: string;
    priceCents: number;
    stripePriceId: string;
    isBundle: boolean;
  }) => {
    // Optional: Validate if Stripe price ID exists (requires Stripe SDK)
    // For now, assume provided manually and valid

    const existingPromotion = await prisma.promotion.findFirst({
      where: { stripePriceId: payload.stripePriceId },
    });
    if (existingPromotion) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Promotion with this Stripe price ID already exists"
      );
    }

    const promotion = await prisma.promotion.create({
      data: payload,
    });

    return promotion;
  },
};
