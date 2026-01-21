// import { z } from 'zod';

// const CarValidationSchema = z.object({
//   categoryId: z.string(),
//   brandId: z.string(), 
//   model: z.string(),
//   year: z.number().int().positive(),
//   transmission: z.string(),
//   advertisingType: z.string().optional(),
//   color: z.string(),
//   kmh: z.number().int().positive(),
//   engine: z.string(),
//   maxSpeed: z.number().int().positive(),
//   horsePower: z.number().int().positive(),
//   seats: z.number().int().positive(),
//   fuelType: z.string(),
//   description: z.string(),
//   images: z.array(z.string()),
//   video: z.string(),
//   price: z.array(z.any()), 
//   accessories: z.array(z.string()),
//   damageDeductible: z.string(),
//   depositePolicy: z.string(),
//   fuelPolicy: z.string(),
//   mileagePolicy: z.string(),
//   damagePolicy: z.string(),
//   advertiserName: z.string(),
//   phoneNumber: z.string(),
//   email: z.string().email(),
//   whatsapp: z.string(),
//   location: z.string(),
//   authenticationFile: z.string(),
// });

// export const CarValidation = {
//     CarValidationSchema
// }