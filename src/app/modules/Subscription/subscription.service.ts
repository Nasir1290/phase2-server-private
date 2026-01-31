import { PrismaClient, BillingCycle, SubscriptionPlan } from "@prisma/client";
import Stripe from "stripe";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const CURRENCY = "chf";

type Units = {
  inCima: number;
  inHomePage: number;
  inRisalto: number;
};

// Helper to get benefits from plan (base monthly)
export function getBaseBenefitsFromPlan(plan: SubscriptionPlan): Units {
  if (plan.name.includes("PLUS")) {
    return { inCima: 5, inHomePage: 0, inRisalto: 1 };
  }
  if (plan.name.includes("BUSINESS")) {
    return { inCima: 12, inHomePage: 1, inRisalto: 3 };
  }
  return { inCima: 0, inHomePage: 0, inRisalto: 0 };
}

export const SubscriptionService = {
  getAll: async () => {
    const getAllSubscriptionPlan = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
    });
    return getAllSubscriptionPlan;
  },

  // createSubscription: async (
  //   userId: string,
  //   subscriptionPlanId: string,
  //   billingCycle: BillingCycle,
  //   paymentMethodId: string
  // ) => {
  //   /**
  //    * STEP 1: Fetch DB data (NO transaction)
  //    */
  //   const user = await prisma.user.findUnique({ where: { id: userId } });
  //   const plan = await prisma.subscriptionPlan.findUnique({
  //     where: { id: subscriptionPlanId },
  //   });
  //   if (!user || !plan) {
  //     throw new ApiError(httpStatus.NOT_FOUND, "User or plan not found");
  //   }

  //   // === NEW: Check if user already has an active subscription ===
  //   if (user.subscriptionId) {
  //     const currentSubscription = await prisma.subscription.findUnique({
  //       where: { id: user.subscriptionId },
  //     });

  //     if (currentSubscription && currentSubscription.status === "ACTIVE") {
  //       if (currentSubscription?.cancelledAtPeriodEnd) {
  //         throw new ApiError(
  //           httpStatus.BAD_REQUEST,
  //           `Your subscription is canceled! Renew it or update subscription in the next month.`
  //         );
  //       }
  //       throw new ApiError(
  //         httpStatus.BAD_REQUEST,
  //         `You already have an active ${user.subscriptionType} subscription. Cancel your current subscription and try again in the next month.`
  //       );
  //     }
  //   }

  //   //Currently only monthly billing is supported.
  //   if (billingCycle !== "MONTHLY") {
  //     throw new ApiError(
  //       httpStatus.BAD_REQUEST,
  //       "Only monthly billing is supported"
  //     );
  //   }

  //   /**
  //    * STEP 2: Stripe customer (NO transaction)
  //    */
  //   let stripeCustomerId: string;

  //   const existingCustomers = await stripe.customers.list({
  //     email: user.email,
  //     limit: 1,
  //   });

  //   if (existingCustomers.data.length > 0) {
  //     stripeCustomerId = existingCustomers.data[0].id;
  //   } else {
  //     const customer = await stripe.customers.create({
  //       email: user.email,
  //       name: `${user.firstName} ${user.lastName || ""}`.trim(),
  //       phone: user.phoneNumber,
  //       metadata: { userId },
  //     });
  //     stripeCustomerId = customer.id;
  //   }

  //   /**
  //    * STEP 3: Attach payment method (NO transaction)
  //    */
  //   await stripe.paymentMethods.attach(paymentMethodId, {
  //     customer: stripeCustomerId,
  //   });

  //   await stripe.customers.update(stripeCustomerId, {
  //     invoice_settings: { default_payment_method: paymentMethodId },
  //   });

  //   /**
  //    * STEP 4: Create Stripe subscription (NO transaction)
  //    */
  //   const stripeSubscription = await stripe.subscriptions.create({
  //     customer: stripeCustomerId,
  //     items: [{ price: plan.stripeMonthlyPriceId }],
  //     payment_settings: {
  //       payment_method_types: ["card"],
  //       save_default_payment_method: "on_subscription",
  //     },
  //     expand: ["latest_invoice.payment_intent"],
  //   });

  //   /**
  //    * STEP 5: Extract client_secret (for 3DS if needed)
  //    */
  //   let clientSecret: string | null = null;
  //   const invoice = stripeSubscription.latest_invoice;

  //   if (
  //     invoice &&
  //     typeof invoice !== "string" &&
  //     invoice.payment_intent &&
  //     typeof invoice.payment_intent !== "string"
  //   ) {
  //     clientSecret = invoice.payment_intent.client_secret;
  //   }
  //   /**
  //    * STEP 6: Database transaction (FAST & SAFE)
  //    */
  //   const result = await prisma.$transaction(async (tx) => {
  //     const subscription = await tx.subscription.create({
  //       data: {
  //         subscriptionPlanId,
  //         stripeCustomerId,
  //         subscriptionType: plan.name.includes("PLUS")
  //           ? "PLUS"
  //           : plan.name.includes("BUSINESS")
  //           ? "BUSINESS"
  //           : "STANDARD",
  //         userId: user.id,
  //         stripeSubscriptionId: stripeSubscription.id,
  //         paymentMethod: paymentMethodId,
  //         currentPeriodStart: new Date(
  //           stripeSubscription.current_period_start * 1000
  //         ),
  //         currentPeriodEnd: new Date(
  //           stripeSubscription.current_period_end * 1000
  //         ),
  //         price: plan.monthlyPrice,
  //         billingCycle,
  //         status:
  //           stripeSubscription.status === "active" ? "ACTIVE" : "INCOMPLETE",
  //       },
  //       include: {
  //         subscriptionPlan: true,
  //       },
  //     });
  //     return subscription;
  //   });

  //   /**
  //    * STEP 7: Return response
  //    */
  //   return {
  //     subscription: result,
  //     // stripeSubscription,
  //     clientSecret, // frontend uses this if 3DS is required
  //   };
  // },


  createSubscriptionCheckout: async (
  userId: string,
  subscriptionPlanId: string,
  billingCycle: BillingCycle,
  successUrl: string,
  cancelUrl: string
) => {
  console.log({userId,subscriptionPlanId,billingCycle,successUrl,cancelUrl})
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: subscriptionPlanId } });

  if (!user || !plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "User or plan not found");
  }

  // Optional: Check no active subscription (same as before)
  if (user.subscriptionId) {
    const current = await prisma.subscription.findUnique({ where: { id: user.subscriptionId } });
    if (current?.status === "ACTIVE") {
      throw new ApiError(httpStatus.BAD_REQUEST, "You already have an active subscription");
    }
  }

  // Get or create Stripe customer
  let stripeCustomerId: string;
  const customers = await stripe.customers.list({ email: user.email, limit: 1 });
  if (customers.data.length > 0) {
    stripeCustomerId = customers.data[0].id;
  } else {
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName || ""}`.trim(),
      metadata: { userId },
    });
    stripeCustomerId = customer.id;
  }

  // Determine Stripe Price ID based on cycle
  let stripePriceId: string;
  switch (billingCycle) {
    case "MONTHLY":
      stripePriceId = plan.stripeMonthlyPriceId;
      break;
    // Add SIX_MONTHLY / YEARLY later if needed
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid billing cycle");
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: stripePriceId, quantity: 1 }],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    metadata: {
      userId,
      subscriptionPlanId,
      billingCycle,
    },
  });

  return { checkoutUrl: session.url! };
},

  cancelSubscription: async (userId: string, cancelAtPeriodEnd = true) => {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "user not found");
      }
      if (!user.subscriptionId) {
        throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found!");
      }
      const subscription = await tx.subscription.findUnique({
        where: { id: user.subscriptionId },
      });
      if (subscription?.status != "ACTIVE") {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "No active subscription for this user!"
        );
      }
      if (!subscription) {
        throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found");
      }
      const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        { cancel_at_period_end: cancelAtPeriodEnd }
      );

      return stripeSubscription;
    });
  },

  updateSubscription: async (
    subscriptionId: string,
    newBillingCycle: BillingCycle
  ) => {
    return prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.findUnique({
        where: { id: subscriptionId },
        include: { subscriptionPlan: true },
      });
      if (!subscription || !subscription.subscriptionPlan) {
        throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found");
      }
      const plan = subscription.subscriptionPlan;
      let stripePriceId: string;
      let price: number;
      switch (newBillingCycle) {
        case "MONTHLY":
          stripePriceId = plan.stripeMonthlyPriceId;
          price = plan.monthlyPrice;
          break;
        // case "SIX_MONTHLY":
        //   stripePriceId = plan.stripeSixMonthlyPriceId;
        //   price = plan.monthlyPrice * 6 * (1 - plan.sixMonthDiscount / 100);
        //   break;

        // case "YEARLY":
        //   stripePriceId = plan.stripeYearlyPriceId;
        //   price = plan.monthlyPrice * 12 * (1 - plan.yearlyDiscount / 100);
        //   break;
        default:
          throw new ApiError(httpStatus.BAD_REQUEST, "Invalid billing cycle");
      }
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      );
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        items: [
          {
            id: stripeSubscription.items.data[0].id,
            price: stripePriceId,
          },
        ],
        proration_behavior: "create_prorations",
      });
      await tx.subscription.update({
        where: { id: subscriptionId },
        data: { billingCycle: newBillingCycle, price },
      });
      return { success: true };
    });
  },

  reactivateSubscription: async (subscriptionId: string) => {
    return prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.findUnique({
        where: { id: subscriptionId },
      });
      if (!subscription) {
        throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found");
      }
      const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        { cancel_at_period_end: false }
      );
      await tx.subscription.update({
        where: { id: subscriptionId },
        data: { status: "ACTIVE" },
      });
      // Restore subscriptionType if needed, but assume handled elsewhere
      return stripeSubscription;
    });
  },

  getUserSubscriptionInfo: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        subscriptionType: true,
        subscriptionId: true,
        // Add any other user fields you want
      },
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    if (!user.subscriptionId) {
      return {
        user,
        subscription: null,
      };
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: user.subscriptionId },
      select: {
        id: true,
        status: true,
        currentPeriodEnd: true,
        cancelledAtPeriodEnd: true,
        subscriptionPlan: {
          select: {
            name: true,
            features: true,
            description: true,
          },
        },
        // Add other subscription fields if needed
      },
    });

    return {
      user,
      subscription,
    };
  },
};
