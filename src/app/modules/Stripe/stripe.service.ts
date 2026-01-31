// import Stripe from "stripe";
// import prisma from "../../../shared/prisma";
// import {
//   PromotionService,
//   addToUserWallet,
// } from "../Promotion/promotion.service";
// import { getBaseBenefitsFromPlan } from "../Subscription/subscription.service"; // Adjust path if needed
// import { BillingCycle } from "@prisma/client";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2024-06-20",
// });

// export const StripeService = {
//   handleStripeWebhook: async (event: Stripe.Event) => {
//     console.log("Webhook received:", event.type);

//     switch (event.type) {
//       // === PROMOTION (One-time payment) ===
//       case "checkout.session.completed":
//         const session = event.data.object as Stripe.Checkout.Session;
//         if (session.mode === "payment" && session.payment_status === "paid") {
//           await PromotionService.completePromotionPurchase(session.id);
//         }
//         break;

//       // === SUBSCRIPTION EVENTS ===
//       case "customer.subscription.created":
//         // Optional: Useful for logging or setup
//         const createdSub = event.data.object as Stripe.Subscription;
//         console.log("Subscription created:", createdSub.id);
//         // You can sync status here if needed
//         break;

//       case "invoice.paid":
//         const invoice = event.data.object as Stripe.Invoice;

//         // Only grant benefits on actual susbscription payments (first + renewals)
//         if (
//           invoice.billing_reason === "subscription_create" ||
//           invoice.billing_reason === "subscription_cycle"
//         ) {
//           await handleSubscriptionInvoicePaid(invoice);
//         }
//         break;

//       case "invoice.payment_failed":
//         const failedInvoice = event.data.object as Stripe.Invoice;
//         await handleSubscriptionPaymentFailed(failedInvoice);
//         break;

//       case "customer.subscription.updated":
//         const updatedSub = event.data.object as Stripe.Subscription;
//         await handleSubscriptionUpdated(updatedSub);
//         break;

//       case "customer.subscription.deleted":
//         const deletedSub = event.data.object as Stripe.Subscription;
//         await handleSubscriptionDeleted(deletedSub);
//         break;

//       case "invoice.payment_succeeded": // Deprecated, but silence it
//       case "charge.succeeded":
//       case "payment_intent.succeeded":
//       case "payment_intent.created":
//       case "invoice.created":
//       case "invoice.finalized":
//         // Informational events — safe to ignore
//         break;

//       default:
//         console.log(`Unhandled event type: ${event.type}`);
//     }

//     return { received: true };
//   },
// };

// // async function handleSubscriptionInvoicePaid(invoice: Stripe.Invoice) {
// //   if (!invoice.subscription) return;

// //   const stripeSubscriptionId = invoice.subscription as string;

// //   // Fetch subscription with plan
// //   const subscription = await prisma.subscription.findUnique({
// //     where: { stripeSubscriptionId },
// //     include: {
// //       subscriptionPlan: true,
// //     },
// //   });

// //   if (!subscription || !subscription.subscriptionPlan) {
// //     console.log("Subscription or plan not found for invoice:", invoice.id);
// //     return;
// //   }

// //   const periodStart = new Date(invoice.period_start * 1000).getTime();
// //   const periodEnd = new Date(invoice.period_end * 1000).getTime();

// //   if (
// //     subscription.currentPeriodStart?.getTime() === periodStart &&
// //     subscription.currentPeriodEnd?.getTime() === periodEnd &&
// //     subscription.status === "ACTIVE"
// //   ) {
// //     console.log("Benefits already granted for this billing period — skipping");
// //     return;
// //   }
// //   // Fetch user separately using userId
// //   const user = await prisma.user.findUnique({
// //     where: { id: subscription.userId },
// //   });

// //   if (!user) {
// //     console.log("User not found for subscription:", stripeSubscriptionId);
// //     return;
// //   }

// //   // Update subscription status and period dates
// //   await prisma.subscription.update({
// //     where: { id: subscription.id },
// //     data: {
// //       status: "ACTIVE",
// //       currentPeriodStart: new Date(invoice.period_start * 1000),
// //       currentPeriodEnd: new Date(invoice.period_end * 1000),
// //     },
// //   });

// //   //update user subscription type and add subscription id into user

// //   await prisma.user.update({
// //     where: { id: user.id },
// //     data: {
// //       subscriptionId: subscription.id,
// //       subscriptionType: subscription.subscriptionPlan.name.includes("PLUS")
// //         ? "PLUS"
// //         : subscription.subscriptionPlan.name.includes("BUSINESS")
// //         ? "BUSINESS"
// //         : "STANDARD",
// //     },
// //   });

// //   // Grant monthly benefits
// //   const baseBenefits = getBaseBenefitsFromPlan(subscription.subscriptionPlan);
// //   await addToUserWallet(user.id, baseBenefits);

// //   console.log(
// //     `Benefits granted to user ${user.id} for invoice ${invoice.id}:`,
// //     baseBenefits
// //   );
// // }

// async function handleSubscriptionInvoicePaid(invoice: Stripe.Invoice) {
//   if (!invoice.subscription) return;

//   const stripeSubscriptionId = invoice.subscription as string;
//   const billingReason = invoice.billing_reason;

//   let subscription = await prisma.subscription.findUnique({
//     where: { stripeSubscriptionId },
//     include: { subscriptionPlan: true },
//   });

//   // First time (subscription_create) → create DB record
//   if (billingReason === "subscription_create" && !subscription) {
//     const metadata = invoice.metadata; // you can pass planId in metadata when creating Checkout
//     const subscriptionPlanId = metadata?.subscriptionPlanId as string;
//     const billingCycle = metadata?.billingCycle as BillingCycle;

//     const plan = await prisma.subscriptionPlan.findUnique({
//       where: { id: subscriptionPlanId },
//     });
//     if (!plan) return;

//     subscription = await prisma.subscription.create({
//       data: {
//         stripeSubscriptionId,
//         userId: metadata?.userId as string,
//         subscriptionPlanId,
//         stripeCustomerId: invoice.customer as string,
//         billingCycle,
//         price: plan.monthlyPrice,
//         status: "ACTIVE",
//         currentPeriodStart: new Date(invoice.period_start * 1000),
//         currentPeriodEnd: new Date(invoice.period_end * 1000),
//         paymentMethod: "STRIPE",
//       },
//       include: { subscriptionPlan: true },
//     });

//     // Update user
//     await prisma.user.update({
//       where: { id: metadata?.userId as string },
//       data: {
//         subscriptionId: subscription.id,
//         subscriptionType: plan.name.includes("PLUS") ? "PLUS" : "BUSINESS",
//       },
//     });
//   }

//   if (!subscription) return;

//   // Idempotency guard
//   const periodStart = new Date(invoice.period_start * 1000).getTime();
//   const periodEnd = new Date(invoice.period_end * 1000).getTime();

//   if (
//     subscription.currentPeriodStart?.getTime() === periodStart &&
//     subscription.currentPeriodEnd?.getTime() === periodEnd &&
//     subscription.status === "ACTIVE"
//   ) {
//     return;
//   }

//   // Update period & status
//   await prisma.subscription.update({
//     where: { stripeSubscriptionId },
//     data: {
//       status: "ACTIVE",
//       currentPeriodStart: new Date(invoice.period_start * 1000),
//       currentPeriodEnd: new Date(invoice.period_end * 1000),
//     },
//   });

//   const user = await prisma.user.findUnique({ where: { id: subscription.userId } });
//   if (!user) return;

//   const benefits = getBaseBenefitsFromPlan(subscription.subscriptionPlan);
//   await addToUserWallet(user.id, benefits);
// }

// async function handleSubscriptionPaymentFailed(invoice: Stripe.Invoice) {
//   const subscriptionId = invoice.subscription as string;
//   await prisma.subscription.updateMany({
//     where: { stripeSubscriptionId: subscriptionId },
//     data: { status: "PAST_DUE" },
//   });
// }

// async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
//   console.log("Enter in update block");
//   await prisma.subscription.updateMany({
//     where: { stripeSubscriptionId: subscription.id },
//     data: {
//       currentPeriodStart: new Date(subscription.current_period_start * 1000),
//       currentPeriodEnd: new Date(subscription.current_period_end * 1000),
//       status: subscription.status === "active" ? "ACTIVE" : "CANCELLED",
//       cancelledAtPeriodEnd: subscription.cancel_at_period_end ? true : false,
//     },
//   });
// }

// async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
//   await prisma.subscription.updateMany({
//     where: { stripeSubscriptionId: subscription.id },
//     data: { status: "CANCELLED" },
//   });
//   // Set user to STANDART
//   const dbSubscription = await prisma.subscription.findFirst({
//     where: { stripeSubscriptionId: subscription.id },
//   });
//   if (dbSubscription) {
//     await prisma.user.updateMany({
//       where: { subscriptionId: dbSubscription.id },
//       data: { subscriptionType: "STANDARD", subscriptionId: null },
//     });
//   }
// }

import Stripe from "stripe";
import prisma from "../../../shared/prisma";
import {
  PromotionService,
  addToUserWallet,
} from "../Promotion/promotion.service";
import { getBaseBenefitsFromPlan } from "../Subscription/subscription.service";
import { BillingCycle } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const StripeService = {
  handleStripeWebhook: async (event: Stripe.Event) => {
    console.log("Webhook received:", event.type);

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "payment" && session.payment_status === "paid") {
          await PromotionService.completePromotionPurchase(session.id);
        }
        break;

      case "customer.subscription.created":
        const createdSub = event.data.object as Stripe.Subscription;
        console.log("New subscription created:", createdSub.id);

        // Create DB record if it doesn't exist yet
        const existing = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: createdSub.id },
        });

        if (!existing) {
          // Fetch metadata from session (most reliable source)
          const sessions = await stripe.checkout.sessions.list({
            subscription: createdSub.id,
            limit: 1,
          });

          const metadata = sessions.data[0]?.metadata || createdSub.metadata;

          const subscriptionPlanId = metadata?.subscriptionPlanId as string;
          const billingCycle = metadata?.billingCycle as BillingCycle;
          const userId = metadata?.userId as string;

          if (!subscriptionPlanId || !billingCycle || !userId) {
            console.log(
              "Missing metadata for new subscription:",
              createdSub.id,
            );
            break;
          }

          const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: subscriptionPlanId },
          });

          if (!plan) {
            console.log("Plan not found for new subscription");
            break;
          }

          const subscription = await prisma.subscription.create({
            data: {
              stripeSubscriptionId: createdSub.id,
              userId,
              subscriptionPlanId,
              subscriptionType: plan.name,
              stripeCustomerId: createdSub.customer as string,
              billingCycle,
              price: plan.monthlyPrice,
              status: createdSub.status.toUpperCase() as any,
              currentPeriodStart: new Date(
                createdSub.current_period_start * 1000,
              ),
              currentPeriodEnd: new Date(createdSub.current_period_end * 1000),
              paymentMethod: "STRIPE_CHECKOUT",
            },
            include: { subscriptionPlan: true },
          });

          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionId: subscription.id,
              subscriptionType: plan.name.includes("PLUS")
                ? "PLUS"
                : "BUSINESS",
            },
          });

          console.log(
            "Subscription record created on creation event:",
            subscription.id,
          );
        }
        break;

      case "invoice.paid":
        const invoice = event.data.object as Stripe.Invoice;
        if (
          invoice.billing_reason === "subscription_create" ||
          invoice.billing_reason === "subscription_cycle"
        ) {
          await handleSubscriptionInvoicePaid(invoice);
        }
        break;

      case "invoice.payment_failed":
        await handleSubscriptionPaymentFailed(
          event.data.object as Stripe.Invoice,
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      // Silence noisy events
      case "charge.succeeded":
      case "payment_intent.succeeded":
      case "payment_intent.created":
      case "invoice.created":
      case "invoice.finalized":
      case "customer.updated":
      case "test_helpers.test_clock.created":
      case "test_helpers.test_clock.ready":
      case "invoice.upcoming":
        break;

      default:
        console.log(`Unhandled event: ${event.type}`);
    }

    return { received: true };
  },
};

// async function handleSubscriptionInvoicePaid(invoice: Stripe.Invoice) {
//   if (!invoice.subscription) return;

//   const stripeSubscriptionId = invoice.subscription as string;
//   const billingReason = invoice.billing_reason;

//   let subscription = await prisma.subscription.findUnique({
//     where: { stripeSubscriptionId },
//     include: { subscriptionPlan: true },
//   });

//   console.log({ billingReason, subscription });

//   // === FIRST PAYMENT: Create DB record ===
//   if (billingReason === "subscription_create" && !subscription) {
//     // Retrieve metadata from the original Checkout Session
//     const session = await stripe.checkout.sessions.list({
//       subscription: stripeSubscriptionId,
//       limit: 1,
//     });

//     const metadata = session.data[0]?.metadata || invoice.metadata;

//     const subscriptionPlanId = metadata?.subscriptionPlanId as string;
//     const billingCycle = metadata?.billingCycle as BillingCycle;
//     const userId = metadata?.userId as string;

//     if (!subscriptionPlanId || !billingCycle || !userId) {
//       console.log(
//         "Missing metadata for new subscription:",
//         stripeSubscriptionId,
//       );
//       return;
//     }

//     const plan = await prisma.subscriptionPlan.findUnique({
//       where: { id: subscriptionPlanId },
//     });
//     if (!plan) return;

//     subscription = await prisma.subscription.create({
//       data: {
//         stripeSubscriptionId,
//         userId,
//         subscriptionPlanId,
//         subscriptionType: plan.name,
//         stripeCustomerId: invoice.customer as string,
//         billingCycle,
//         price: plan.monthlyPrice,
//         status: "ACTIVE",
//         currentPeriodStart: new Date(invoice.period_start * 1000),
//         currentPeriodEnd: new Date(invoice.period_end * 1000),
//         paymentMethod: "STRIPE_CHECKOUT",
//       },
//       include: { subscriptionPlan: true },
//     });

//     // Update user
//     await prisma.user.update({
//       where: { id: userId },
//       data: {
//         subscriptionId: subscription.id,
//         subscriptionType: plan.name.includes("PLUS") ? "PLUS" : "BUSINESS",
//       },
//     });

//     console.log("Come here")
//   }

//   if (!subscription) return;

//   // === IDEMPOTENCY GUARD ===
//   const periodStart = new Date(invoice.period_start * 1000).getTime();
//   const periodEnd = new Date(invoice.period_end * 1000).getTime();

//   if (
//     subscription.currentPeriodStart?.getTime() === periodStart &&
//     subscription.currentPeriodEnd?.getTime() === periodEnd &&
//     subscription.status === "ACTIVE"
//   ) {
//     console.log("Benefits already granted for this period — skipping");
//     return;
//   }

//   // Update subscription
//   await prisma.subscription.update({
//     where: { stripeSubscriptionId },
//     data: {
//       status: "ACTIVE",
//       currentPeriodStart: new Date(invoice.period_start * 1000),
//       currentPeriodEnd: new Date(invoice.period_end * 1000),
//     },
//   });

//   const user = await prisma.user.findUnique({
//     where: { id: subscription.userId },
//   });
//   if (!user) return;

//   const benefits = getBaseBenefitsFromPlan(subscription.subscriptionPlan);
//   await addToUserWallet(user.id, benefits);

//   console.log(`Benefits granted to user ${user.id}:`, benefits);
// }

async function handleSubscriptionInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const stripeSubscriptionId = invoice.subscription as string;

  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
    include: { subscriptionPlan: true },
  });

  if (!subscription || !subscription.subscriptionPlan) {
    console.log("Subscription not found for invoice:", invoice.id);
    return;
  }

  // Idempotency guard
  const periodStart = new Date(invoice.period_start * 1000).getTime();
  const periodEnd = new Date(invoice.period_end * 1000).getTime();

  if (
    subscription.currentPeriodStart?.getTime() === periodStart &&
    subscription.currentPeriodEnd?.getTime() === periodEnd &&
    subscription.status === "ACTIVE"
  ) {
    console.log("Benefits already granted for this period — skipping");
    return;
  }

  await prisma.subscription.update({
    where: { stripeSubscriptionId },
    data: {
      status: "ACTIVE",
      currentPeriodStart: new Date(invoice.period_start * 1000),
      currentPeriodEnd: new Date(invoice.period_end * 1000),
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: subscription.userId },
  });
  if (!user) return;

  const benefits = getBaseBenefitsFromPlan(subscription.subscriptionPlan);
  await addToUserWallet(user.id, benefits);

  console.log(`Benefits granted to user ${user.id}:`, benefits);
}

async function handleSubscriptionPaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  await prisma.subscription.update({
    where: { stripeSubscriptionId: invoice.subscription as string },
    data: { status: "PAST_DUE" },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      status: subscription.status.toUpperCase() as any,
      cancelledAtPeriodEnd: subscription.cancel_at_period_end ?? false,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const dbSubscription = await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: "CANCELLED" },
  });

  await prisma.user.update({
    where: { id: dbSubscription.userId },
    data: {
      subscriptionType: "STANDARD",
      subscriptionId: null,
    },
  });
}
