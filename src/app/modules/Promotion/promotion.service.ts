import {
  PrismaClient,
  PromotionType,
  PurchaseHistoryStatus,
  User,
} from "@prisma/client";
import Stripe from "stripe";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

type Units = {
  inCima: number;
  inHomePage: number;
  inRisalto: number;
};

// Helper to get units from promotion (quantity always 1)
export function getUnitsFromPromotion(promotion: any): Units {
  if (promotion.type === "PACCHETTO_3IN1") {
    return { inCima: 8, inHomePage: 2, inRisalto: 4 };
  }
  const match = promotion.name.match(/(\d+) in (cima|homepage|risalto)/i);
  if (!match) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid promotion name");
  }
  const num = parseInt(match[1]);
  const t = match[2].toLowerCase();
  if (t === "cima") return { inCima: num, inHomePage: 0, inRisalto: 0 };
  if (t === "homepage") return { inCima: 0, inHomePage: num, inRisalto: 0 };
  if (t === "risalto") return { inCima: 0, inHomePage: 0, inRisalto: num };
  throw new ApiError(httpStatus.BAD_REQUEST, "Invalid promotion type in name");
}

// Helper to add units to user wallet with cap
export async function addToUserWallet(userId: string, units: Units) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  const updates = {
    inCimaTimes: Math.min(user.inCimaTimes + units.inCima, 15),
    inHomePageDays: Math.min(user.inHomePageDays + units.inHomePage, 15),
    inRisaltoDays: Math.min(user.inRisaltoDays + units.inRisalto, 15),
  };
  await prisma.user.update({ where: { id: userId }, data: updates });
  // Could calculate wasted and log or return, but for now, just cap
  const wasted = {
    inCima: units.inCima - (updates.inCimaTimes - user.inCimaTimes),
    inHomePage:
      units.inHomePage - (updates.inHomePageDays - user.inHomePageDays),
    inRisalto: units.inRisalto - (updates.inRisaltoDays - user.inRisaltoDays),
  };
  if (wasted.inCima > 0 || wasted.inHomePage > 0 || wasted.inRisalto > 0) {
    console.warn(`Wasted units for user ${userId}:`, wasted);
    // Could throw or return warning in response if needed
  }
}

// Helper to apply one unit to car
// export async function applyOneUnitToCar(
//   carId: string,
//   type: PromotionType,
//   userId: string,
//   purchaseHistoryId: string
// ) {
//   const car = await prisma.car.findUnique({ where: { id: carId } });
//   if (!car || car.ownerId !== userId) {
//     throw new ApiError(httpStatus.FORBIDDEN, "Invalid car or ownership");
//   }

//   const now = new Date();

//   let activePromo = await prisma.carPromotion.findFirst({
//     where: {
//       carId,
//       promotionType: type,
//       OR: [{ endTime: { gte: now } }, { endTime: null }],
//     },
//   });

//   if (type === "IN_CIMA") {
//     // Deactivate all other IN_CIMA promotions globally (except current car)
//     await prisma.carPromotion.updateMany({
//       where: {
//         promotionType: "IN_CIMA",
//         endTime: null,
//         carId: { not: carId },
//       },
//       data: { endTime: now },
//     });

//     if (activePromo) {
//       // Existing active promotion on this car → renew it
//       await prisma.carPromotion.update({
//         where: { id: activePromo.id },
//         data: {
//           startTime: now,
//           endTime: null, // IN_CIMA has no expiry
//           purchaseHistoryId, // ← SAVE LINK TO PURCHASE
//         },
//       });
//     } else {
//       // No active → create new
//       await prisma.carPromotion.create({
//         data: {
//           carId,
//           promotionType: type,
//           startTime: now,
//           endTime: null,
//           purchaseHistoryId, // ← SAVE LINK TO PURCHASE
//         },
//       });
//     }
//   } else {
//     // Time-based promotions: IN_HOMEPAGE or IN_RISALTO (+24 hours)
//     const durationHours = 24;
//     let endTime: Date;

//     if (activePromo) {
//       // Extend existing one
//       endTime = activePromo.endTime ? new Date(activePromo.endTime) : new Date(now);
//       endTime.setHours(endTime.getHours() + durationHours);

//       await prisma.carPromotion.update({
//         where: { id: activePromo.id },
//         data: {
//           endTime,
//           purchaseHistoryId, // ← SAVE LINK TO PURCHASE
//         },
//       });
//     } else {
//       // Create new
//       endTime = new Date(now);
//       endTime.setHours(endTime.getHours() + durationHours);

//       await prisma.carPromotion.create({
//         data: {
//           carId,
//           promotionType: type,
//           startTime: now,
//           endTime,
//           purchaseHistoryId, // ← SAVE LINK TO PURCHASE
//         },
//       });
//     }
//   }
// }

export async function applyOneUnitToCar(
  carId: string,
  type: PromotionType,
  userId: string,
  purchaseHistoryId?: string // ← Make optional
) {
  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car || car.ownerId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Invalid car or ownership");
  }

  const now = new Date();

  let activePromo = await prisma.carPromotion.findFirst({
    where: {
      carId,
      promotionType: type,
      OR: [{ endTime: { gte: now } }, { endTime: null }],
    },
  });

  const commonData = purchaseHistoryId ? { purchaseHistoryId } : {};

  if (type === "IN_CIMA") {
    await prisma.carPromotion.updateMany({
      where: {
        promotionType: "IN_CIMA",
        endTime: null,
        carId: { not: carId },
      },
      data: { endTime: now },
    });

    if (activePromo) {
      await prisma.carPromotion.update({
        where: { id: activePromo.id },
        data: {
          startTime: now,
          endTime: null,
          ...commonData, // ← Only add if exists
        },
      });
    } else {
      await prisma.carPromotion.create({
        data: {
          carId,
          promotionType: type,
          startTime: now,
          endTime: null,
          ...commonData,
        },
      });
    }
  } else {
    const durationHours = 24;
    let endTime: Date;

    if (activePromo) {
      endTime = activePromo.endTime
        ? new Date(activePromo.endTime)
        : new Date(now);
      endTime.setHours(endTime.getHours() + durationHours);

      await prisma.carPromotion.update({
        where: { id: activePromo.id },
        data: {
          endTime,
          ...commonData,
        },
      });
    } else {
      endTime = new Date(now);
      endTime.setHours(endTime.getHours() + durationHours);

      await prisma.carPromotion.create({
        data: {
          carId,
          promotionType: type,
          startTime: now,
          endTime,
          ...commonData,
        },
      });
    }
  }
}

// Helper to add promotion units (apply 1 per type if carId, rest to wallet)
export async function addPromotionUnits(
  userId: string,
  carId: string | undefined,
  units: Units,
  purchaseHistoryId: string
) {
  if (carId) {
    if (units.inCima > 0) {
      await applyOneUnitToCar(carId, "IN_CIMA", userId, purchaseHistoryId);
      units.inCima--;
    }
    if (units.inHomePage > 0) {
      await applyOneUnitToCar(carId, "IN_HOMEPAGE", userId, purchaseHistoryId);
      units.inHomePage--;
    }
    if (units.inRisalto > 0) {
      await applyOneUnitToCar(carId, "IN_RISALTO", userId, purchaseHistoryId);
      units.inRisalto--;
    }
  }
  // Add remaining to wallet
  await addToUserWallet(userId, units);
}

export const PromotionService = {
  createPromotionCheckout: async (
    userId: string,
    promotionId: string,
    successUrl: string,
    cancelUrl: string,
    carId?: string // ← Optional at the end
  ) => {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      const promotion = await tx.promotion.findUnique({
        where: { id: promotionId },
      });

      if (!user || !promotion) {
        throw new ApiError(httpStatus.NOT_FOUND, "User or promotion not found");
      }

      let car = null;
      if (carId) {
        car = await tx.car.findUnique({ where: { id: carId } });
        if (!car || car.ownerId !== userId) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            "Car not found or invalid ownership"
          );
        }
      }

      // === PRE-PURCHASE CHECK: Only run if carId provided ===
      if (carId && car) {
        const now = new Date();

        const activePromos = await tx.carPromotion.findMany({
          where: {
            carId,
            OR: [{ endTime: { gte: now } }, { endTime: null }],
          },
        });

        const activeTypes = activePromos.map((p) => p.promotionType);

        if (promotion.isBundle) {
          const bundleTypes = ["IN_CIMA", "IN_HOMEPAGE", "IN_RISALTO"] as const;
          const conflictingTypes = bundleTypes.filter((type) =>
            activeTypes.includes(type)
          );

          if (conflictingTypes.length > 0) {
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              `This car already has active promotion(s): ${conflictingTypes.join(
                ", "
              )}. Bundle cannot be purchased.`
            );
          }
        } else {
          if (activeTypes.includes(promotion.type)) {
            const typeName = promotion.type.replace("IN_", "In ");
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              `This car already has an active ${typeName} promotion. Wait for it to expire or choose another car.`
            );
          }
        }
      }
      // === END CHECK ===

      const purchaseHistory = await tx.purchaseHistory.create({
        data: {
          userId,
          promotionId,
          stripeCheckoutId: "pending",
          totalCents: promotion.priceCents,
          quantity: 1,
          status: "PENDING",
        },
      });

      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        payment_method_types: ["card"],
        line_items: [
          {
            price: promotion.stripePriceId,
            quantity: 1,
          },
        ],
        allow_promotion_codes: true,
        mode: "payment",
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          promotionId,
          carId: carId || null,
          purchaseHistoryId: purchaseHistory.id,
        },
      } as Stripe.Checkout.SessionCreateParams);

      await tx.purchaseHistory.update({
        where: { id: purchaseHistory.id },
        data: { stripeCheckoutId: session.id },
      });

      return { session, purchaseHistory };
    });
  },

  completePromotionPurchase: async (checkoutSessionId: string) => {
    return prisma.$transaction(async (tx) => {
      const session = await stripe.checkout.sessions.retrieve(
        checkoutSessionId
      );
      if (session.payment_status !== "paid") {
        throw new ApiError(httpStatus.BAD_REQUEST, "Payment not completed");
      }
      const { userId, promotionId, carId, purchaseHistoryId } =
        session.metadata!;
      await tx.purchaseHistory.update({
        where: { id: purchaseHistoryId },
        data: { status: "COMPLETED" },
      });
      const promotion = await tx.promotion.findUnique({
        where: { id: promotionId },
      });
      if (!promotion) {
        throw new ApiError(httpStatus.NOT_FOUND, "Promotion not found");
      }
      const units = getUnitsFromPromotion(promotion);
      await addPromotionUnits(userId, carId, units, purchaseHistoryId);
      return { success: true };
    });
  },

  getUserPromotionHistory: async (userId: string) => {
    const history = await prisma.purchaseHistory.findMany({
      where: { userId },
      include: { promotion: true },
      orderBy: { createdAt: "desc" },
    });
    return history;
  },

  applyFromWallet: async (
    userId: string,
    carId: string,
    promotionType: PromotionType
  ) => {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

      // === NEW: Prevent applying if car already has active promotion of this type ===
      const now = new Date();
      const activePromos = await tx.carPromotion.findMany({
        where: {
          carId,
          OR: [{ endTime: { gte: now } }, { endTime: null }],
        },
      });

      const activeTypes = activePromos.map((p) => p.promotionType);

      if (activeTypes.includes(promotionType)) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `This car already has an active ${promotionType} promotion. ` +
            ` Wait for it to expire or choose another car.`
        );
      }
      // === END NEW ===

      let field: keyof User;
      let value: number;
      switch (promotionType) {
        case "IN_CIMA":
          field = "inCimaTimes";
          value = user.inCimaTimes;
          break;
        case "IN_HOMEPAGE":
          field = "inHomePageDays";
          value = user.inHomePageDays;
          break;
        case "IN_RISALTO":
          field = "inRisaltoDays";
          value = user.inRisaltoDays;
          break;
        default:
          throw new ApiError(httpStatus.BAD_REQUEST, "Invalid promotion type");
      }

      if (value <= 0) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "No units available in wallet"
        );
      }

      await applyOneUnitToCar(carId, promotionType, userId);
      await tx.user.update({
        where: { id: userId },
        data: { [field]: { decrement: 1 } },
      });

      return { success: true };
    });
  },

  getActiveCarPromotions: async (carId: string) => {
    const now = new Date();
    const activePromotions = await prisma.carPromotion.findMany({
      where: {
        carId,
        OR: [{ endTime: { gte: now } }, { endTime: null }],
      },
      include: { car: true },
    });
    return activePromotions;
  },
  getAllPromotions: async () => {
    const promotions = await prisma.promotion.findMany({
      orderBy: { priceCents: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        priceCents: true,
        isBundle: true,
      },
    });

    return promotions.map((p) => ({
      ...p,
      priceFormatted: `${(p.priceCents / 100).toFixed(2)} CHF`,
    }));
  },
};
