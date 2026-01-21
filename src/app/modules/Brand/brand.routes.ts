// import { Router } from "express";
// import { brandController } from "./brand.controllers";
// import auth from "../../middlewares/auth";
// import { UserRole } from "@prisma/client";
// import { fileUploader } from "../../../helpars/fileUploader";

// const router = Router();

// router.post(
//   "/create",
//   auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
//   fileUploader.upload.single("logo"),
//   brandController.createBrand
// );
// router.get("/all", brandController.getAllBrand);
// router.get("/get/:id", brandController.getBrandById);
// router.patch(
//   "/update/:id",
//   auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
//   fileUploader.upload.single("logo"),
//   brandController.updateBrand
// );
// router.delete(
//   "/delete/:id",
//   auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
//   brandController.deleteBrand
// );

// export const brandRoutes = router;
