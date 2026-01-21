import { z } from 'zod';
import { PromotionType } from '@prisma/client';

export const PromotionValidation = {
  createCheckout: z.object({
    body: z.object({
      promotionId: z.string().min(1),
      carId: z.string().optional(),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
    }),
  }),
  applyWallet: z.object({
    body: z.object({
      carId: z.string().min(1),
      promotionType: z.nativeEnum(PromotionType),
    }),
  }),
};