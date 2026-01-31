import express from "express";

import { AuthRoutes } from "../modules/Auth/auth.routes";
import { UserRoutes } from "../modules/User/user.route";
import { carRoutes } from "../modules/Car/car.routes";
import { contactUsRoutes } from "../modules/ContactUs/contactus.route";
import { carbookingmessageRoutes } from "../modules/CarBookingMessage/CarBookingMessage.route";
import { SubscriptionRoutes } from "../modules/Subscription/subscription.route";
import { StripeRoutes } from "../modules/Stripe/stripe.route";
import { PromotionRoutes } from "../modules/Promotion/promotion.route";
import { AdminRoutes } from "../modules/Admin/admin.route";
import { favouriteRoutes } from "../modules/Favourite/favourite.route";
// import { categoryRoutes } from "../modules/Category/category.routes";
// import { brandRoutes } from "../modules/Brand/brand.routes";

// import { paymentRoutes } from "../modules/Payment/payment.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },

  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/car",
    route: carRoutes,
  },
  {
    path: "/contact",
    route: contactUsRoutes,
  },
  {
    path: "/car-booking",
    route: carbookingmessageRoutes,
  },
  {
    path: "/subscription",
    route: SubscriptionRoutes,
  },
  {
    path: "/stripe",
    route: StripeRoutes,
  },
  {
    path: "/promotion",
    route: PromotionRoutes,
  },
  {
    path: "/admin",
    route: AdminRoutes,
  },
  {
    path: "/favourite",
    route: favouriteRoutes,
  },
  // {
  //   path: "/category",
  //   route: categoryRoutes,
  // },
  // {
  //   path: "/brand",
  //   route: brandRoutes,
  // },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
