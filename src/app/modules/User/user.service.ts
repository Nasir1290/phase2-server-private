import bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { User, UserRole, UserStatus } from "@prisma/client";
import { TUser, userSelectFields } from "./user.interface";
import httpStatus from "http-status";
import { deletePreviousFile } from "../../../utils/deletePreviousFile";
import emailSender from "../../../helpars/emailSender";
import QueryBuilder from "../../../utils/queryBuilder";
import { deleteFileFromS3 } from "../../../helpars/s3";

const createUser = async (payload: User) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser?.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user is deleted");
  }

  if (existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "This user information already exists",
    );
  }

  const hashedPassword: string = await bcrypt.hash(payload.password, 12);
  const userData = {
    ...payload,
    password: hashedPassword,
    role: UserRole.USER,
    userStatus: UserStatus.ACTIVE,
  };

  const user = await prisma.user.create({
    data: userData,
    select: userSelectFields,
  });
  if (!user) {
    throw new ApiError(httpStatus.CONFLICT, "User not created!");
  }

  return user;
};

const getUserById = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: { id },
  });

  return result;
};

const updateUser = async (id: string, payload: any) => {
  // console.log(payload)
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user not found");
  }
  const result = await prisma.user.update({
    where: { id },
    data: payload,
  });
  if (existingUser.profilePic && payload.profilePic) {
    await deleteFileFromS3(existingUser.profilePic);
  }

  return result;
};

const blockUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user not found");
  }

  // Determine the new status
  const newStatus =
    user.userStatus === UserStatus.BLOCKED
      ? UserStatus.ACTIVE
      : UserStatus.BLOCKED;

  const result = await prisma.user.update({
    where: { id },
    data: { userStatus: newStatus },
  });

  return result;
};

const deleteUser = async (id: string) => {
  const result = await prisma.user.update({
    where: { id },
    data: { isDeleted: true },
  });

  const html = `
   <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Deletion Notification</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #f6f9fc;
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            animation: fadeIn 0.8s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .header {
            background: linear-gradient(135deg, #FF7600, #FFA500);
            padding: 40px 20px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .body {
            padding: 30px 20px;
            text-align: center;
        }
        .body p {
            font-size: 18px;
            color: #333333;
            margin-bottom: 20px;
        }
        .body .highlight {
            font-size: 24px;
            font-weight: 600;
            color: #FF7600;
            margin: 20px 0;
            padding: 10px 20px;
            background-color: #fff3e0;
            border-radius: 8px;
            display: inline-block;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #999999;
            border-top: 1px solid #e0e0e0;
        }
        .footer a {
            color: #FF7600;
            text-decoration: none;
            font-weight: 500;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header Section -->
        <div class="header">
            <h1>Account Deletion Notification</h1>
        </div>

        <!-- Body Section -->
        <div class="body">
            <p>Hello, <strong>${result.firstName}</strong>,</p>
            <p>We regret to inform you that your account has been <span class="highlight">successfully deleted</span> from our system.</p>
            <p>If this was a mistake or you have any concerns, please contact our support team immediately.</p>
            <div style="margin-top: 40px;">
                <p style="font-size: 16px; color: #555555;">Thank you for being a part of our community. We hope to see you again in the future!</p>
            </div>
        </div>

        <!-- Footer Section -->
        <div class="footer">
            <p>© 2025 Renty Swiss. All rights reserved.</p>
            <p>Need help? <a href="mailto:support@rentyswiss.com">Contact Support</a></p>
        </div>
    </div>
</body>
</html>
  `;

  await emailSender("Account Deletion Notification", result.email, html);
  if (result.profilePic) {
    await deleteFileFromS3(result.profilePic);
  }
  return result;
};

const getAllUsers = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.user, query);
  const result = await queryBuilder
    .search(["firstName", "lastName"])
    .filter()
    .sort()
    .paginate()
    .fields()
    .rawFilter({
      userStatus: "ACTIVE",
    })
    .execute();
  const meta = await queryBuilder.countTotal();
  return { users: result, meta };
};

const removeProfilePic = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user not found");
  }

  await prisma.user.update({
    where: { id },
    data: {
      profilePic: null,
    },
  });
  if (user.profilePic) {
    await deleteFileFromS3(user.profilePic);
  }
};

export const UserService = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  blockUser,
  removeProfilePic,
};
