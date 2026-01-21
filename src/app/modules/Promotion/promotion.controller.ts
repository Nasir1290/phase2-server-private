// promotion.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { PromotionService } from "./promotion.service";
import ApiError from "../../../errors/ApiErrors";

const createPromotionCheckout = catchAsync(
  async (req: Request, res: Response) => {
    const { promotionId, carId, successUrl, cancelUrl } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!promotionId || !successUrl || !cancelUrl) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "promotionId, successUrl, and cancelUrl are required"
      );
    }

    const result = await PromotionService.createPromotionCheckout(
      userId,
      promotionId,
      successUrl,
      cancelUrl,
      carId // ← Optional carId passed last
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Checkout session created successfully",
      data: result,
    });
  }
);

const getUserPromotionHistory = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const result = await PromotionService.getUserPromotionHistory(userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Promotion history retrieved successfully",
      data: result,
    });
  }
);

const applyFromWallet = catchAsync(async (req: Request, res: Response) => {
  const { carId, promotionType } = req.body;
  const userId = req.user.id;
  const result = await PromotionService.applyFromWallet(
    userId,
    carId,
    promotionType
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Promotion applied from wallet successfully",
    data: result,
  });
});

const getAllPromotions = catchAsync(async (req: Request, res: Response) => {
  const promotions = await PromotionService.getAllPromotions();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Promotions retrieved successfully",
    data: promotions,
  });
});

export const PromotionController = {
  createPromotionCheckout,
  getUserPromotionHistory,
  applyFromWallet,
  getAllPromotions,
};
