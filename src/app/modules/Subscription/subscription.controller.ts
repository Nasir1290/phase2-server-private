// subscription.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { SubscriptionService } from "./subscription.service";


const getAllSubscriptionPlan = catchAsync(async (req: Request, res: Response) => {

  const result = await SubscriptionService.getAll();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Successfully Retrieved All Subscription Plans",
    data: result,
  });
});

// const createSubscription = catchAsync(async (req: Request, res: Response) => {
//   const { subscriptionPlanId, billingCycle, paymentMethodId } = req.body;
//   const userId = req.user.id;
//   const result = await SubscriptionService.createSubscription(
//     userId,
//     subscriptionPlanId,
//     billingCycle,
//     paymentMethodId
//   );
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Subscription created successfully",
//     data: result,
//   });
// });


const createSubscriptionCheckout = catchAsync(async (req: Request, res: Response) => {
  const { subscriptionPlanId, billingCycle = "MONTHLY" ,successUrl,cancelUrl} = req.body;
  const userId = req.user.id;

  const result = await SubscriptionService.createSubscriptionCheckout(
    userId,
    subscriptionPlanId,
    billingCycle,
    successUrl,
    cancelUrl
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Redirect to Stripe Checkout",
    data: { checkoutUrl: result.checkoutUrl },
  });
});

const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const cancelAtPeriodEnd = req.body.cancelAtPeriodEnd ?? true;
  const result = await SubscriptionService.cancelSubscription(userId, cancelAtPeriodEnd);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription updated successfully",
    data: result,
  });
});

const updateSubscription = catchAsync(async (req: Request, res: Response) => {
  const subscriptionId = req.params.id;
  const { newBillingCycle } = req.body;
  const result = await SubscriptionService.updateSubscription(subscriptionId, newBillingCycle);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription updated successfully",
    data: result,
  });
});

const reactivateSubscription = catchAsync(async (req: Request, res: Response) => {
  const subscriptionId = req.params.id;
  const result = await SubscriptionService.reactivateSubscription(subscriptionId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription reactivated successfully",
    data: result,
  });
});

const getUserSubscription = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await SubscriptionService.getUserSubscriptionInfo(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User subscription info retrieved successfully",
    data: result,
  });
});

export const SubscriptionController = {
  getAllSubscriptionPlan,
  // createSubscription,
  createSubscriptionCheckout,
  cancelSubscription,
  updateSubscription,
  reactivateSubscription,
  getUserSubscription,
};