// import { Prisma } from "@prisma/client";

// import { IGenericErrorResponse } from "../interfaces/common";

// const handleValidationError = (
//   error: Prisma.PrismaClientValidationError
// ): IGenericErrorResponse => {
//   const errors = [
//     {
//       path: "",
//       message: error.message,
//     },
//   ];
//   const statusCode = 400;
//   return {
//     statusCode,
//     message: "Validation Error",
//     errorMessages: errors,
//   };
// };

// export default handleValidationError;

import { Prisma } from "@prisma/client";
import { IGenericErrorResponse } from "../interfaces/common";

const handleValidationError = (
  error: Prisma.PrismaClientValidationError
): IGenericErrorResponse => {
  const errorMessages = [];

  // Match missing fields (e.g., "Argument `firstName` is missing")
  const missingFieldMatch = error.message.match(/Argument `(.+?)` is missing/);
  if (missingFieldMatch) {
    errorMessages.push({
      path: missingFieldMatch[1],
      message: `The field \`${missingFieldMatch[1]}\` is required but missing.`,
    });
  }

  // Match invalid scalar field errors (e.g., "Invalid scalar field `firstName`")
  const invalidFieldMatch = error.message.match(/Invalid scalar field `(.+?)`/);
  if (invalidFieldMatch) {
    errorMessages.push({
      path: invalidFieldMatch[1],
      message: `The field \`${invalidFieldMatch[1]}\` is invalid for the request.`,
    });
  }

  // Match unknown argument errors (e.g., "Unknown argument `canto`. Did you mean `cantone`?")
  const unknownArgumentMatch = error.message.match(
    /Unknown argument `(.+?)`. Did you mean `(.+?)`\?/
  );
  if (unknownArgumentMatch) {
    errorMessages.push({
      path: unknownArgumentMatch[1],
      message: `Unknown field \`${unknownArgumentMatch[1]}\`. Did you mean \`${unknownArgumentMatch[2]}\`?`,
    });
  }

  // Match invalid include fields (e.g., "include: { invalidField }")
  const includeMatch = error.message.match(/include: {\s*(.*?)\s*}/);
  if (includeMatch) {
    errorMessages.push({
      path: includeMatch[1],
      message: `Invalid field specified in include: \`${includeMatch[1]}\`. Ensure it's a relation field.`,
    });
  }

  // Match missing connect field (e.g., "Argument `connect` needs at least one of `id` or `email`")
  const missingConnectFieldMatch = error.message.match(
    /Argument `connect` of type UserWhereUniqueInput needs at least one of `id` or `email`/
  );
  if (missingConnectFieldMatch) {
    errorMessages.push({
      path: "owner",  // Assuming it's the "owner" relation field causing the issue
      message: `The field \`owner\` needs at least one of \`id\` or \`email\` to be provided for the connection.`,
    });
  }

  // If no specific pattern is matched, provide a default error message
  if (errorMessages.length === 0) {
    errorMessages.push({
      path: "",
      message: "A validation error occurred. Please check your request.",
    });
  }

  return {
    statusCode: 400,
    message: "Validation Error",
    errorMessages,
  };
};

export default handleValidationError;
