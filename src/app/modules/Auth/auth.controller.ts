import { Request, Response } from "express";
import httpStatus from "http-status";
import { string } from "zod";
import config from "../../../config";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AuthServices } from "./auth.service";
import { authValidation } from "./auth.validation";
import ApiError from "../../../errors/ApiErrors";

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);

  if (result.refreshToken) {
    // Set refresh token in cookies for verified users
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: config.env === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
      // domain:
      //   config.env === "production"
      //     ? config.production_frontend_domain
      //     : "localhost",
    });
  }

  if (result.accessToken) {
    // Set refresh token in cookies for verified users
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: config.env === "production" ? "none" : "lax",
      path: "/",
      maxAge: 7 * 60 * 60 * 24 * 365,
      // domain:
      //   config.env === "production"
      //     ? config.production_frontend_domain
      //     : "localhost",
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.accessToken
      ? {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user,
        }
      : {},
  });
});

const enterOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.enterOtp(req.body);

  // res.cookie("token", result.accessToken, { httpOnly: true });
  res.cookie("accessToken", result.accessToken, {
    secure: config.env === "production",
    httpOnly: true,
    sameSite: config.env === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 365,
    // domain:
    //   config.env === "production"
    //     ? config.production_frontend_domain
    //     : "localhost",
  });
  res.cookie("refreshToken", result.refreshToken, {
    secure: config.env === "production",
    httpOnly: true,
    sameSite: config.env === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // domain:
    //   config.env === "production"
    //     ? config.production_frontend_domain
    //     : "localhost",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    },
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  // Clear the refresh token from cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: config.env === "production" ? "none" : "lax",
    path: "/",
    // domain:
    //   config.env === "production"
    //     ? config.production_frontend_domain
    //     : "localhost",
  });

  //clear the access toke from cookie
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: config.env === "production" ? "none" : "lax",
    path: "/",
    // domain:
    //   config.env === "production"
    //     ? config.production_frontend_domain
    //     : "localhost",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Successfully logged out",
    data: {},
  });
});

// get user profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userToken = req.headers.authorization;

  const result = await AuthServices.getMyProfile(userToken as string);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "User profile retrieved successfully",
    data: result,
  });
});

// change password
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userToken = req.headers.authorization;
  const { oldPassword, newPassword } =
    authValidation.changePasswordValidationSchema.parse(req.body);
  const result = await AuthServices.changePassword(
    userToken as string,
    newPassword,
    oldPassword,
  );
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Password changed successfully",
    data: result,
  });
});

// forgot password
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const data = await AuthServices.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Check your email!",
    data: data,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";

  await AuthServices.resetPassword(token, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password Reset!",
    data: null,
  });
});

// const socialLogin = catchAsync(async (req: Request, res: Response) => {
//   const result = await AuthServices.socialLogin(req.body);
//   res.cookie("token", result.accessToken, { httpOnly: true });

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "User logged in successfully",
//     data: result,
//   });
// });

// Add this to your auth.controller.ts

const refreshAccessToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token is required");
  }

  const result = await AuthServices.refreshAccessToken(refreshToken);

  // Set new refresh token in cookie
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: config.env === "production" ? "none" : "lax",
    path: "/",
    // maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: config.env === "production" ? "none" : "lax",
    path: "/",
    // maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token refreshed successfully",
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
});

const isCarOwner = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const data = await AuthServices.isCarOwner(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrieve car owner status successfully.",
    data: { isCarOwner: data },
  });
});

export const AuthController = {
  loginUser,
  enterOtp,
  logoutUser,
  getMyProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  isCarOwner,
  // socialLogin,
};
