import { z } from 'zod';
import { BillingCycle } from '@prisma/client';

export const SubscriptionValidation = {
  createSubscription: z.object({
    body: z.object({
      subscriptionPlanId: z.string().min(1),
      billingCycle: z.nativeEnum(BillingCycle),
      // paymentMethodId: z.string().min(1),
    }),
  }),
  updateSubscription: z.object({
    body: z.object({
      newBillingCycle: z.nativeEnum(BillingCycle),
    }),
  }),
};