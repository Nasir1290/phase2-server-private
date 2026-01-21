// admin.validation.ts (Zod schemas for validation)
import { z } from 'zod';
import { PromotionType } from '@prisma/client';

export const AdminValidation = {
createSubscriptionPlan: z.object({
  body: z.object({
    description: z.string().min(1),
    features: z.array(z.string()),
    monthlyPrice: z.number().positive(),
    sixMonthDiscount: z.number().min(0).max(100).optional(),
    yearlyDiscount: z.number().min(0).max(100).optional(),
    isActive: z.boolean(),
    stripeProductId: z.string().min(1),
    stripeMonthlyPriceId: z.string().min(1),
    stripeSixMonthlyPriceId: z.string().optional(),
    stripeYearlyPriceId: z.string().optional(),
  }),
}),
  createPromotion: z.object({
    body: z.object({
      type: z.nativeEnum(PromotionType),
      name: z.string().min(1),
      priceCents: z.number().positive(),
      stripePriceId: z.string().min(1),
      isBundle: z.boolean(),
    }),
  }),
};