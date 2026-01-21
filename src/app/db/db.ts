import bcrypt from "bcrypt";
import prisma from "../../shared/prisma";
import { User } from "@prisma/client";

export const initiateSuperAdmin = async () => {
  const payload: Partial<User> = {
    firstName: "Admin" as string,
    lastName: "Admin" as string,
    email: "bittengo@gmail.com" as string,
    password: "123456" as string,
    createdAt: new Date(),
    updatedAt: new Date(),
    phoneNumber: "+41 78 248 05 01",
  };

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingSuperAdmin) {
    return;
  }

  await prisma.$transaction(async (TransactionClient) => {
    const hashedPassword: string = await bcrypt.hash(
      payload.password as string,
      12
    );
    const adminId =
      "#" +
      payload?.firstName?.slice(0, 1).toUpperCase() +
      payload?.lastName?.slice(0, 1).toUpperCase() +
      Math.floor(Math.random() * 1000000);

    await TransactionClient.user.create({
      data: {
        email: payload.email as string,
        password: hashedPassword,
        phoneNumber: payload.phoneNumber as string,
        role: "SUPER_ADMIN",
        firstName: payload.firstName as string,
        userStatus: "ACTIVE",
        isVerified: true,
      },
    });
  });
};
