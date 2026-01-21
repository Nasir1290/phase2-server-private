// import { Request, Response } from "express";
// import catchAsync from "../../../shared/catchAsync";
// import { categoryService } from "./category.services";
// import sendResponse from "../../../shared/sendResponse";
// import httpStatus from "http-status";

// const createCategory = catchAsync(async (req: Request, res: Response) => {
//   const data = req.body;
//   const result = await categoryService.createCategory(data);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Category created successfully",
//     data: result,
//   });
// });

// const getAllCategory = catchAsync(async (req: Request, res: Response) => {
//   const result = await categoryService.getAllCategory();

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Categories retrieved successfully",
//     data: result,
//   });
// });

// const getCategoryById = catchAsync(async (req: Request, res: Response) => {
//   const data = req.params.id;
//   const result = await categoryService.getCategoryById(data);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Category retrieved successfully",
//     data: result,
//   });
// });

// const updateCategory = catchAsync(async (req: Request, res: Response) => {
//   const data = req.params.id;
//   const result = await categoryService.updateCategory(data, req.body);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Category updated successfully",
//     data: result,
//   });
// });

// const deleteCategory = catchAsync(async (req: Request, res: Response) => {
//   const data = req.params.id;
//   const result = await categoryService.deleteCategory(data);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Category deleted successfully",
//     data: result,
//   });
// });

// export const categoryController = {
//   createCategory,
//   getCategoryById,
//   updateCategory,
//   deleteCategory,
//   getAllCategory
// };
