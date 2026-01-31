import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { FavouriteServices } from "./favourite.services";

const favouriteController = {
  createFavouriteCar: catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const { carId } = req.body;

    const result = await FavouriteServices.createFavouriteCar(user.id, carId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Car added to favourites",
      data: result,
    });
  }),

  deleteFavouriteCar: catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const { carId, favouriteId } = req.body;

    const result = await FavouriteServices.deleteFavouriteCar(
      user.id,
      carId,
      favouriteId,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Car removed from favourites",
      data: result,
    });
  }),

  getAllFavouriteCars: catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    const result = await FavouriteServices.getAllFavouriteCars(user.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Favourite cars retrieved successfully",
      data: result,
    });
  }),
  getAllFavouriteCarIds: catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    const result = await FavouriteServices.getFavouriteCarIds(user.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Favourite car IDs retrieved successfully",
      data: result,
    });
  }),
  isCarInFavourites: catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const carId = req.params.id;

    const result = await FavouriteServices.isCarInFavourites(user.id, carId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Car status retrieved successfully",
      data: result,
    });
  }),
};

export default favouriteController;
