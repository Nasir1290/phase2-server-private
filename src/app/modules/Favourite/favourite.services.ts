import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { userSelectFields } from "../User/user.interface";

const createFavouriteCar = async (userId: string, carId: string) => {
  const car = await prisma.car.findUnique({
    where: {
      id: carId,
    },
  });
  if (!car) {
    throw new ApiError(404, "Car not found");
  }
  const isAlreadyExist = await prisma.favouriteCar.findFirst({
    where: {
      userId: userId,
      carId: carId,
    },
  });
  if (isAlreadyExist) {
    throw new ApiError(400, "Car already in favourites");
  }
  const result = await prisma.favouriteCar.create({
    data: {
      carId: car.id,
      userId: userId,
    },
  });
  return result;
};

const deleteFavouriteCar = async (
  userId: string,
  carId: string,
  favouriteId: string,
) => {
  const result = await prisma.favouriteCar.delete({
    where: {
      id: favouriteId,
      carId: carId,
      userId: userId,
    },
  });
  return result;
};

const getAllFavouriteCars = async (userId: string) => {
  const result = await prisma.favouriteCar.findMany({
    where: {
      userId: userId,
    },
    include: {
      car: true,
      //   user: {
      //     select: userSelectFields,
      //   },
    },
  });
  return result;
};

const getFavouriteCarIds = async (userId: string) => {
  const result = await prisma.favouriteCar.findMany({
    where: {
      userId: userId,
    },
    select: {
      carId: true,
    },
  });
  return result;
};

const isCarInFavourites = async (userId: string, carId: string) => {
  if (!userId || !carId) {
    throw new ApiError(400, "User ID and Car ID are required");
  }
  const result = await prisma.favouriteCar.findFirst({
    where: {
      userId: userId,
      carId: carId,
    },
  });
  if (!result) {
    throw new ApiError(404, "Car not found in favourites");
  }
  return result;
};

export const FavouriteServices = {
  createFavouriteCar,
  deleteFavouriteCar,
  getAllFavouriteCars,
  getFavouriteCarIds,
  isCarInFavourites
};
