import { z } from "zod";

const createCarBookingMessageSchema = z.object({
  body: z.object({
    checkInDate: z.string(),
    checkOutDate: z.string(),
    checkInTime: z.string(),
    checkOutTime: z.string(),
    carId: z.string(),
    email: z.string().email(),
    phoneNumber: z.string(),
    message: z.string(),
    specialRequest: z.string().optional(),
  }),
});

const updateCarBookingMessageSchema = z.object({
  body: z.object({
    checkInDate: z.string().optional(),
    checkOutDate: z.string().optional(),
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    carId: z.string().optional(),
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
    message: z.string().optional(),
    specialRequest: z.string().optional(),
  }),
});

export const carBookingMessageValidation = {
  createCarBookingMessageSchema,
  updateCarBookingMessageSchema,
};
