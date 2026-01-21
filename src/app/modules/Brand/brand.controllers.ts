// import { Request, Response } from "express";
// import catchAsync from "../../../shared/catchAsync";
// import { brandService } from "./brand.services";
// import sendResponse from "../../../shared/sendResponse";
// import httpStatus from "http-status";
// import config from "../../../config";

// const createBrand = catchAsync(async (req: Request, res: Response) => {
//   const data = req.body;
//   const logo = req.file?.filename;
//   if (logo) {
//     data.logo = config.backend_image_url + "/" + logo;
//   }
//   const result = await brandService.createBrand(data);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Brand created successfully",
//     data: result,
//   });
// });

// const getAllBrand = catchAsync(async (req: Request, res: Response) => {
//   const result = await brandService.getAllBrand();

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Brands retrieved successfully",
//     data: result,
//   });
// });

// const getBrandById = catchAsync(async (req: Request, res: Response) => {
//   const data = req.params.id;
//   const result = await brandService.getBrandById(data);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Brand retrieved successfully",
//     data: result,
//   });
// });

// const updateBrand = catchAsync(async (req: Request, res: Response) => {
//   const data = req.params.id;
//   const logo = req.file?.filename;
//   if (logo) {
//     req.body.logo = config.backend_image_url + "/" + logo;
//   }
//   const result = await brandService.updateBrand(data, req.body);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Brand updated successfully",
//     data: result,
//   });
// });

// const deleteBrand = catchAsync(async (req: Request, res: Response) => {
//   const data = req.params.id;
//   const result = await brandService.deleteBrand(data);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Brand deleted successfully",
//     data: result,
//   });
// });

// export const brandController = {
//   createBrand,
//   getAllBrand,
//   getBrandById,
//   updateBrand,
//   deleteBrand,
// };
