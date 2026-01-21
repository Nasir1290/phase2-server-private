// import httpStatus from "http-status";
// import ApiError from "../../../errors/ApiErrors";
// import prisma from "../../../shared/prisma";
// import { deletePreviousFile } from "../../../utils/deletePreviousFile";
// import { AcceptanceStatus } from "@prisma/client";

// const createBrand = async (payload: { name: string; logo: string }) => {
//   const brand = await prisma.brand.create({
//     data: payload,
//   });
//   if (!brand) {
//     throw new ApiError(httpStatus.CONFLICT, "Brand not created!");
//   }

//   return brand;
// };

// const getAllBrand = async () => {
//   const allBrand = await prisma.brand.findMany({
//     where:{
//       Car:{
//         some:{
//           acceptanceStatus: AcceptanceStatus.ACCEPTED,
//         }
//       }
//     },
//     select:{
//       id:true,
//       name:true,
//       logo:true
//     }
//   }); 
//   return allBrand;
// };

// const getBrandById = async (id: string) => {
//   const brand = await prisma.brand.findUnique({
//     where: {
//       id,
//     },
//   });
//   return brand;
// };

// const updateBrand = async (
//   id: string,
//   payload: { name: string; logo: string }
// ) => {
//   const existingBrand = await prisma.brand.findUnique({
//     where: { id },
//   });
//   if (!existingBrand) {
//     throw new ApiError(httpStatus.NOT_FOUND, "This brand not found");
//   }
//   const brand = await prisma.brand.update({
//     where: {
//       id,
//     },
//     data: payload,
//   });

//   if (existingBrand.logo && payload.logo) {
//     deletePreviousFile(existingBrand.logo);
//   }

//   return brand;
// };

// const deleteBrand = async (id: string) => {
//   const brand = await prisma.brand.delete({
//     where: {
//       id,
//     },
//   });
//   return brand;
// };

// export const brandService = {
//   createBrand,
//   getAllBrand,
//   getBrandById,
//   updateBrand,
//   deleteBrand,
// };
