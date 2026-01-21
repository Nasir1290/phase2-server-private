import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { carbookingmessageService } from "./CarBookingMessage.service";

const createCarBookingMessage = catchAsync(async (req: Request, res: Response) => {
    const result = await carbookingmessageService.createCarBookingMessage(req);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "CarBookingMessage created successfully",
        data: result,
    });
});

const getAllCarBookingMessages = catchAsync(async (req: Request, res: Response) => {
    const results = await carbookingmessageService.getAllCarBookingMessages(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "CarBookingMessages retrieved successfully",
        meta:results.meta,
        data: results.data,
    });
});

const getSingleCarBookingMessage = catchAsync(async (req: Request, res: Response) => {
    const result = await carbookingmessageService.getSingleCarBookingMessage(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "CarBookingMessage retrieved successfully",
        data: result,
    });
});

const updateCarBookingMessage = catchAsync(async (req: Request, res: Response) => {
    const result = await carbookingmessageService.updateCarBookingMessage(req.params.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "CarBookingMessage updated successfully",
        data: result,
    });
});

const deleteCarBookingMessage = catchAsync(async (req: Request, res: Response) => {
    const result = await carbookingmessageService.deleteCarBookingMessage(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.NO_CONTENT,
        success: true,
        message: "CarBookingMessage deleted successfully",
        data: result,
    });
});

export const carbookingmessageController = {
    createCarBookingMessage,
    getAllCarBookingMessages,
    getSingleCarBookingMessage,
    updateCarBookingMessage,
    deleteCarBookingMessage,
};
