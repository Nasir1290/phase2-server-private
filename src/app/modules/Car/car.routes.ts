import express from "express";
import { CarController } from "./car.controllers";
import { fileUploader } from "../../../helpars/fileUploader";
import { parseBodyData } from "../../../utils/parseBodyData";
import validateRequest from "../../middlewares/validateRequest";
import { CarValidation } from "./car.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

// Create a new car by admin
router.post(
  "/create",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  fileUploader.upload.fields([
    { name: "otherImages", maxCount: 12 },
    { name: "video", maxCount: 1 },
    { name: "mainImage", maxCount: 1 },
    { name: "authenticationFile", maxCount: 1 },
  ]),
  parseBodyData,
  validateRequest(CarValidation.createCarValidationSchema),
  CarController.createCar
);
// Create a new car by user
router.post(
  "/create-by-user",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER),
  fileUploader.upload.fields([
    { name: "otherImages", maxCount: 12 },
    { name: "video", maxCount: 1 },
    { name: "mainImage", maxCount: 1 },
    { name: "authenticationFile", maxCount: 1 },
  ]),
  parseBodyData,
  validateRequest(CarValidation.createCarValidationSchema),
  CarController.createCarByUser
);

// Get all cars
router.get("/all", CarController.getAllCars);
// Get a car by ID
router.get("/single/:id", CarController.getCarById);
// Get a car by ID
router.get("/single/:id", CarController.getCarById);
router.patch(
  "/update/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  fileUploader.upload.fields([
    { name: "otherImages", maxCount: 12 },
    { name: "video", maxCount: 1 },
    { name: "mainImage", maxCount: 1 },
     { name: "authenticationFile", maxCount: 1 }
  ]),
  parseBodyData,
  validateRequest(CarValidation.updateCarValidationSchema),
  CarController.updateCar
);
router.patch(
  "/update-by-owner/:id",
  auth(),
  fileUploader.upload.fields([
    { name: "otherImages", maxCount: 12 },
    { name: "video", maxCount: 1 },
    { name: "mainImage", maxCount: 1 },
     { name: "authenticationFile", maxCount: 1 }
  ]),
  parseBodyData,
  validateRequest(CarValidation.updateCarValidationSchema),
  CarController.updateCarByOwner
);
// Delete a car by ID
router.delete("/delete/:id", auth(), CarController.deleteCar);

//all with suspended
router.get("/all-with-suspended", CarController.getAllCarsWithSuspended);

// Update a car by ID

// Increment car view count
router.patch("/view-count/:id", CarController.incrementViewCount);
//getAll car owners
router.get(
  "/owners",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CarController.getAllCarOwners
);

//get all car by owner
router.get("/owner-cars/:id", auth(), CarController.getAllCarByowner);

//get all distinct categories
router.get("/all-categories", CarController.getAllCategoryWhichHaveCar);
//update car type
router.patch(
  "/update-type/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CarController.updateCarType
);
//best offers car
router.get("/best-offer", CarController.getBestOfferCars);
//popular cars
router.get("/popular", CarController.getPopularCars);

// Get all cars
router.get("/all-pending", CarController.getAllPendingCars);
// Get all rejected cars
router.get("/all-rejected", CarController.getAllRejectedCars);
//update car acceptance status
router.patch(
  "/update-acceptance-status/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CarController.updateCarAcceptanceStatus
);

//suspend or active car status
router.patch(
  "/suspend-or-active/:id",
  auth(),
  CarController.suspendOrActiveCar
);

//get all brand which have cars
router.get("/all-brand", CarController.getAllBrand);

//get current in cima car
router.get("/current-in-cima", CarController.getCurrentInCimaCar);

router.get("/in-homepage", CarController.getInHomepageCars);
router.get("/in-risalto", CarController.getInRisaltoCars);
router.get("/get-by-slug/:slug", CarController.getCarBySlug);
router.get(
  "/car-promotion/:checkoutId",
  auth(),
  CarController.getCarPromotionwithCheckoutId
);

router.get(
  "/owner-cars-with-auth",
  auth(),
  CarController.getAllCarByownerWithAuth
);

router.patch("/remove-other-image", auth(), CarController.removeOtherImage);

export const carRoutes = router;
