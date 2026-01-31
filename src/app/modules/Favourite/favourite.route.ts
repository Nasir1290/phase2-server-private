import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import favouriteController from "./favourite.controller";

const router = express.Router();

// Create a new car by admin
router.post("/add", auth(), favouriteController.createFavouriteCar);
router.delete("/remove", auth(), favouriteController.deleteFavouriteCar);
router.get("/all", auth(), favouriteController.getAllFavouriteCars);
router.get("/all-ids", auth(), favouriteController.getAllFavouriteCarIds);
router.get("/is-in-favourites/:id", auth(), favouriteController.isCarInFavourites);

export const favouriteRoutes = router;
