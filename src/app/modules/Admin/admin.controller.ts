// admin.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AdminService } from "./admin.service";

const createSubscriptionPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.createSubscriptionPlan(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Subscription plan created successfully",
    data: result,
  });
});

const createPromotion = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.createPromotion(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Promotion created successfully",
    data: result,
  });
});

export const AdminController = {
  createSubscriptionPlan,
  createPromotion,
};