// import express from "express";
// import { categoryController } from "./category.controllers";
// import auth from "../../middlewares/auth";
// import { UserRole } from "@prisma/client";

// const router = express.Router();

// // Create a category
// router.post(
//   "/create",
//   auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
//   categoryController.createCategory
// );

// // Get a category by ID
// router.get("/get/:id", categoryController.getCategoryById);

// // Get all categories
// router.get("/all", categoryController.getAllCategory);

// // Update a category by ID
// router.patch(
//   "/update/:id",
//   auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
//   categoryController.updateCategory
// );

// // Delete a category by ID
// router.delete(
//   "/delete/:id",
//   auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
//   categoryController.deleteCategory
// );

// export const categoryRoutes = router;
