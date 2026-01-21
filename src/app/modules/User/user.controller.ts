import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../../shared/sendResponse";
import config from "../../../config";
import { fileUploadToS3 } from "../../../helpars/s3";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User Created Successfully",
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const result = await UserService.getUserById(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved successfully!",
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const updateData = req.body;

  if (req.file) {
    updateData.profilePic = await fileUploadToS3(req.file, {
      folder: "user",
      title: "user",
    });
  }
  const result = await UserService.updateUser(userId, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully!",
    data: result,
  });
});

const blockUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const result = await UserService.blockUser(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully!",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await UserService.deleteUser(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully!",
    data: {},
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All users retrieved successfully!",
    meta: result.meta,
    data: result.users,
  });
});

const removeProfilePic = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await UserService.removeProfilePic(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile pic removed successfully!",
    data: {},
  });
});

export const UserController = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  blockUser,
  removeProfilePic,
};
