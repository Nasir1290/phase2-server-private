import { UserRole } from "@prisma/client";
import express from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import auth from "../../middlewares/auth";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();

// const uploadSingle = fileUploader.upload.single("profileImage");

// register user
router.post(
  "/register",
  validateRequest(UserValidation.CreateUserValidationSchema),
  UserController.createUser
);

// get single user
router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.getUserById
);

// update user
router.patch(
  "/update-me",
  auth(),
  validateRequest(UserValidation.userUpdateSchema),
  fileUploader.upload.single("profilePic"),
  UserController.updateUser
);

// block user
router.put(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.blockUser
);
// delete user
router.delete("/", auth(), UserController.deleteUser);

// get all user
router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.getAllUsers
);

//remove profile pic
router.patch("/remove-profile-pic", auth(), UserController.removeProfilePic);

export const UserRoutes = router;
