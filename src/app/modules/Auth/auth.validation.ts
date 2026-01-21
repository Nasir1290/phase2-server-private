import { z } from "zod";

const changePasswordValidationSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export const authValidation={
    changePasswordValidationSchema
}