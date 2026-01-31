import { Router } from "express";
import { carbookingmessageController } from "./CarBookingMessage.controller";
import validateRequest from "../../middlewares/validateRequest";
import { carBookingMessageValidation } from "./CarBookingMessage.validation";
import auth from "../../middlewares/auth";

const router = Router();

router.post(
  "/create",
  auth(),
  validateRequest(carBookingMessageValidation.createCarBookingMessageSchema),
  carbookingmessageController.createCarBookingMessage
);
router.get("/get-all", carbookingmessageController.getAllCarBookingMessages);
router.get(
  "/get-single/:id",
  auth(),
  carbookingmessageController.getSingleCarBookingMessage
);
router.put(
  "/update/:id",
  validateRequest(carBookingMessageValidation.updateCarBookingMessageSchema),
  carbookingmessageController.updateCarBookingMessage
);
router.delete(
  "/delete/:id",
  carbookingmessageController.deleteCarBookingMessage
);

export const carbookingmessageRoutes = router;
