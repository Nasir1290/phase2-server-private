import { z } from "zod";

export const createCarBookingMessageSchema = z.object({
  body: z.object({
    checkInDate: z.string().nonempty("Check-in date is required"),
    checkOutDate: z.string().nonempty("Check-out date is required"),
    checkInTime: z.string().nonempty("Check-in time is required"),
    checkOutTime: z.string().nonempty("Check-out time is required"),
    firstName: z.string().nonempty("first name is required"),
    totalKilometer: z.string().nonempty("total kilometer is required"),
    lastName: z.string().optional(),
    dateOfBirth: z.string().nonempty("Date of Birth is required"),
    carId: z.string().nonempty("Car ID is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().nonempty("Phone number is required"),
    message: z.string().optional(),
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
    firstName: z.string().optional(),
    totalKilometer: z.string().optional(),
    lastName: z.string().optional(),
    dateOfBirth: z.string().optional(),
  }),
});

export const carBookingMessageValidation = {
  createCarBookingMessageSchema,
  updateCarBookingMessageSchema,
};
