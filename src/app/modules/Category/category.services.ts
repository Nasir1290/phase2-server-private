// import httpStatus from "http-status";
// import ApiError from "../../../errors/ApiErrors";
// import prisma from "../../../shared/prisma";

// const createCategory = async (payload: { name: string }) => {
//   const category = await prisma.category.create({
//     data: payload,
//   });
//   if (!category) {
//     throw new ApiError(httpStatus.CONFLICT, "Category not created!");
//   }

//   return category;
// };

// const getAllCategory = async () => {
//   const categories = await prisma.category.findMany();
//   return categories;
// };

// const getCategoryById = async (id: string) => {
//   const category = await prisma.category.findUnique({
//     where: { id },
//   });
//   if (!category) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Category not found!");
//   }

//   return category;
// };

// const updateCategory = async (id: string, payload: { name: string }) => {
//   const category = await prisma.category.update({
//     where: { id },
//     data: payload,
//   });
//   if (!category) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Category not found!");
//   }

//   return category;
// };

// const deleteCategory = async (id: string) => {
//   const category = await prisma.category.delete({
//     where: { id },
//   });
//   if (!category) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Category not found!");
//   }

//   return category;
// };

// export const categoryService = {
//   createCategory,
//   getAllCategory,
//   getCategoryById,
//   deleteCategory,
//   updateCategory,
// };
