import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../utils/queryBuilder";
import { deletePreviousFile } from "../../../utils/deletePreviousFile";
import { userSelectFields } from "../User/user.interface";
import {
  AcceptanceStatus,
  Car,
  CarPromotion,
  CarStatus,
  CarType,
  UserRole,
  UserStatus,
} from "@prisma/client";
import emailSender from "../../../helpars/emailSender";
import { deleteFileFromS3 } from "../../../helpars/s3";
import { CreateCarInput, UpdateCarInput } from "./car.interface";
import { getCityFromCoordinates } from "../../../helpars/findCity";
import slugify from "slugify";
import { nanoid } from "nanoid";

const createCar = async (payload: CreateCarInput) => {
  const { ownerId, ...rest } = payload;
  if (!ownerId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Owner id is required!");
  }
  const isOwnerExist = await prisma.user.findUnique({
    where: { id: ownerId },
  });
  if (!isOwnerExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Owner not found!");
  }
  const { latitude, longitude } = rest;
  const cityInformation = await getCityFromCoordinates(
    latitude as number,
    longitude as number,
  );
  if (!cityInformation) {
    throw new ApiError(httpStatus.NOT_FOUND, "City not found!");
  }
  rest.city = cityInformation?.city;
  const base = slugify(`${rest.brand}-${rest.model}-${rest.year}-}`, {
    lower: true,
  });
  let slug = base;
  // Try base slug first, then add -2, -3, etc.
  let existing = await prisma.car.findUnique({ where: { slug } });
  if (existing) {
    let counter = 2;
    do {
      slug = `${base}-${counter}`;
      existing = await prisma.car.findUnique({ where: { slug } });
      counter++;
    } while (existing);
  }
  const oneDayRentalInfo = rest.price.find((rt) => rt.rentalTime === 24);
  if (!oneDayRentalInfo) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "One day rental info is required!",
    );
  }
  const oneDayRentalPrice = oneDayRentalInfo.price;
  const oneDayRentalKilometer = oneDayRentalInfo.kilometerPerHour;
  if (!oneDayRentalPrice || !oneDayRentalKilometer) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "One day rental price and kilometer per hour is required!",
    );
  }
  console.log(oneDayRentalPrice, oneDayRentalKilometer);
  rest.price = rest.price.filter((rt) => rt.rentalTime !== 24);

  // for maximum uniqueness and shorter URLs, use short ID
  slug = `${base}-${nanoid(4)}`;

  const car = await prisma.car.create({
    data: {
      owner: {
        connect: { id: ownerId },
      },
      slug: slug,
      oneDayRentalPrice,
      oneDayRentalKilometer,
      ...rest,
    },
    include: {
      owner: { select: userSelectFields },
    },
  });

  return car;
};

// const getAllCars = async (query: Record<string, any>) => {
//   const queryBuilder = new QueryBuilder(prisma.car, query);
//   // Apply basic query building
//   queryBuilder
//     .search(["model", "description", "brand"])
//     .filter()
//     .rawFilter({
//       acceptanceStatus: AcceptanceStatus.ACCEPTED,
//       carStatus: CarStatus.ACTIVE,
//     })
//     .sort()
//     .include({
//       owner: {
//         select: userSelectFields,
//       },
//       carPromotions: {
//         select: {
//           id: true,
//           carId: true,
//           promotionType: true,
//           purchaseHistoryId: true,
//           startTime: true,
//           endTime: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//       },
//     });

//   // Add location sorting if coordinates provided
//   if (query.latitude && query.longitude) {
//     const userLat = parseFloat(query.latitude);
//     const userLng = parseFloat(query.longitude);
//     queryBuilder.addPostProcessor((cars) => {
//       const processedCars = cars.map((car) => {
//         const distance =
//           car.latitude && car.longitude
//             ? calculateDistance(userLat, userLng, car.latitude, car.longitude)
//             : Infinity;
//         return {
//           ...car,
//           distance,
//         };
//       });
//       const sortedCars = processedCars.sort((a, b) => a.distance - b.distance);
//       return sortedCars;
//     });
//   }

//   // Add price sorting if requested in original query
//   if (query?.sort?.includes("price")) {
//     const sortOrder = query.sort.startsWith("-") ? -1 : 1;
//     queryBuilder.addPostProcessor((cars) => {
//       const sortedCars = cars.sort((a, b) => {
//         const priceA =
//           a.price.find((p: any) => p.rentalTime === 24)?.price || 0;
//         const priceB =
//           b.price.find((p: any) => p.rentalTime === 24)?.price || 0;
//         return (priceA - priceB) * sortOrder;
//       });
//       return sortedCars;
//     });
//   }

//   // Apply pagination
//   queryBuilder.paginate();
//   // Execute query and get results
//   const cars = await queryBuilder.execute();

//   const now = new Date();

//   const result = cars
//     .map((car) => {
//       const activePromotions = car.carPromotions.filter(
//         (promo: CarPromotion) => {
//           // IN_CIMA without endTime
//           if (promo.promotionType === "IN_CIMA" && promo.endTime === null) {
//             return true;
//           }

//           // IN_RISALTO with active endTime
//           if (
//             promo.promotionType === "IN_RISALTO" &&
//             promo.endTime &&
//             new Date(promo.endTime) > now
//           ) {
//             return true;
//           }

//           return false;
//         }
//       );

//       return {
//         ...car,
//         carPromotions: activePromotions,
//       };
//     })
//     // keep only cars that still have promotions
//     .filter((car) => car.carPromotions.length > 0);

//   console.log(result);

//   const meta = await queryBuilder.countTotal();
//   return { cars: result, meta };
// };

const updateCar = async (id: string, data: Partial<UpdateCarInput>) => {
  const existingCar = await prisma.car.findUnique({
    where: { id },
  });
  if (!existingCar) {
    throw new ApiError(httpStatus.NOT_FOUND, "Car not found!");
  }
  if (data.price) {
    if (data.price.find((p) => p.rentalTime === 24)) {
      data.oneDayRentalPrice = data.price.find(
        (p) => p.rentalTime === 24,
      )?.price!;
      data.oneDayRentalKilometer = data.price.find(
        (p) => p.rentalTime === 24,
      )?.kilometerPerHour!;
      data.price = data.price.filter((p) => p.rentalTime !== 24);
    }
  }
  const car = await prisma.car.update({
    where: { id },
    data: data,
  });

  try {
    if (existingCar.otherImages && data.otherImages) {
      existingCar.otherImages.map(
        async (image: string) => await deleteFileFromS3(image),
      );
    }
    if (existingCar.mainImage && data.mainImage) {
      await deleteFileFromS3(existingCar.mainImage);
    }
    if (existingCar.video && data.video) {
      await deleteFileFromS3(existingCar.video);
    }
    if (existingCar.authenticationFile && data.authenticationFile) {
      await deleteFileFromS3(existingCar.authenticationFile);
    }
  } catch (error) {
    console.log(error);
  }
  return car;
};

const updateCarByOwner = async (
  ownerId: string,
  id: string,
  data: Partial<UpdateCarInput>,
) => {
  const existingCar = await prisma.car.findUnique({
    where: { id },
  });

  if (!existingCar) {
    throw new ApiError(httpStatus.NOT_FOUND, "Car not found!");
  }
  if (existingCar.ownerId !== ownerId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You are not the owner of this car.",
    );
  }
  if (data.price) {
    if (data.price.find((p) => p.rentalTime === 24)) {
      data.oneDayRentalPrice = data.price.find(
        (p) => p.rentalTime === 24,
      )?.price!;
      data.oneDayRentalKilometer = data.price.find(
        (p) => p.rentalTime === 24,
      )?.kilometerPerHour!;
      data.price = data.price.filter((p) => p.rentalTime !== 24);
    }
  }

  if (data.otherImages && existingCar.otherImages) {
    data.otherImages = [...existingCar.otherImages, ...data.otherImages];
  }

  const car = await prisma.car.update({
    where: { id },
    data: data,
  });

  try {
    if (existingCar.otherImages && data.otherImages) {
      existingCar.otherImages.map(
        async (image: string) => await deleteFileFromS3(image),
      );
    }
    if (existingCar.mainImage && data.mainImage) {
      await deleteFileFromS3(existingCar.mainImage);
    }
    if (existingCar.video && data.video) {
      await deleteFileFromS3(existingCar.video);
    }
    if (existingCar.authenticationFile && data.authenticationFile) {
      await deleteFileFromS3(existingCar.authenticationFile);
    }
  } catch (error) {
    console.log(error);
  }
  return car;
};

const deleteCar = async (id: string) => {
  const car = await prisma.car.delete({
    where: { id },
  });
  if (car.mainImage) {
    await deleteFileFromS3(car.mainImage);
  }
  if (car.otherImages) {
    car.otherImages.map(async (image: string) => await deleteFileFromS3(image));
  }
  if (car.video) {
    await deleteFileFromS3(car.video);
  }
  if (car.authenticationFile) {
    await deleteFileFromS3(car.authenticationFile);
  }
  return car;
};

const getCarById = async (id: string) => {
  const car = await prisma.car.findFirstOrThrow({
    where: {
      id,
    },
    include: {
      owner: { select: userSelectFields },
    },
  });
  return car;
};

const getAllPendingCars = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.car, query);
  const cars = await queryBuilder
    .search(["name", "description", "model", "brand", "category"])
    .filter()
    .rawFilter({
      acceptanceStatus: AcceptanceStatus.PENDING,
    })
    .include({
      owner: {
        select: userSelectFields,
      },
    })
    .sort()
    .fields()
    .paginate()
    .execute();
  const meta = await queryBuilder.countTotal();
  return { cars, meta };
};

const getAllCars = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.car, query);
  const cars = await queryBuilder
    .search(["name", "description"])
    .filter()
    .rawFilter({
      acceptanceStatus: AcceptanceStatus.ACCEPTED,
      carStatus: CarStatus.ACTIVE,
    })
    .include({
      owner: {
        select: userSelectFields,
      },
    })
    .fields()
    .paginate()
    .execute();

  const meta = await queryBuilder.countTotal();

  // Now, sort the cars based on rentalTime = 24 price
  if (query?.sort?.includes("price")) {
    // Determine whether we should sort ascending or descending
    const sortOrder = query.sort.startsWith("-") ? -1 : 1;


    // Log prices before sorting
    cars.forEach((car: any, index: number) => {
      const priceA =
        car.price.find((p: any) => p.rentalTime === 24)?.price || 0;
    });

    cars.sort((a: any, b: any) => {
      // Find price for rentalTime = 24
      const priceA = a.price.find((p: any) => p.rentalTime === 24)?.price || 0;
      const priceB = b.price.find((p: any) => p.rentalTime === 24)?.price || 0;

      console.log("Prices being compared:", priceA, priceB); // Debugging line to check prices

      // Sort by price in the correct order (ascending or descending)
      return (priceA - priceB) * sortOrder;
    });

    console.log("Sorted cars:", cars); // Debugging line to check sorted cars
  }
  return { cars, meta };
};

// Helper function to calculate distance

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const getAllCarsWithSuspended = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.car, query);
  const cars = await queryBuilder
    .search(["name", "description"])
    .filter()
    .rawFilter({
      acceptanceStatus: AcceptanceStatus.ACCEPTED,
    })
    .include({
      owner: {
        select: userSelectFields,
      },
    })
    .fields()
    .sort()
    .paginate()
    .execute();

  const meta = await queryBuilder.countTotal();

  // Now, sort the cars based on rentalTime = 24 price
  if (query?.sort?.includes("price")) {
    // Determine whether we should sort ascending or descending
    const sortOrder = query.sort.startsWith("-") ? -1 : 1;

    // Log prices before sorting
    cars.forEach((car: any, index: number) => {
      const priceA =
        car.price.find((p: any) => p.rentalTime === 24)?.price || 0;
    });

    cars.sort((a: any, b: any) => {
      // Find price for rentalTime = 24
      const priceA = a.price.find((p: any) => p.rentalTime === 24)?.price || 0;
      const priceB = b.price.find((p: any) => p.rentalTime === 24)?.price || 0;

      // Sort by price in the correct order (ascending or descending)
      return (priceA - priceB) * sortOrder;
    });
  }

  return { cars, meta };
};

const incrementViewCount = async (id: string) => {
  const carExisting = await prisma.car.findUnique({
    where: { id },
  });
  if (!carExisting) {
    throw new ApiError(httpStatus.NOT_FOUND, "Car not found!");
  }
  const car = await prisma.car.update({
    where: { id },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });
  return car;
};

const getAllCarOwners = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.user, query);
  const owners = await queryBuilder
    .filter()
    .rawFilter({
      userStatus: UserStatus.ACTIVE,
      Car: {
        some: {},
      },
    })
    .select(userSelectFields)
    .execute();
  await prisma.user.findMany({
    where: {
      Car: {
        some: {},
      },
    },
  });

  const meta = await queryBuilder.countTotal();
  return { meta, owners };
};

const getAllCarByowner = async (id: string, query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.car, query);
  const cars = await queryBuilder
    .search(["model", "brand"])
    .filter()
    .fields()
    .rawFilter({
      ownerId: id,
      acceptanceStatus: {
        in: [AcceptanceStatus.ACCEPTED, AcceptanceStatus.PENDING],
      },
    })
    .include({
      owner: {
        select: userSelectFields,
      },
      carPromotions: true,
    })
    .paginate()
    .execute();
  const meta = await queryBuilder.countTotal();
  return { meta, cars };
};

const getAllCategoryWhichHaveCar = async () => {
  const categories = await prisma.car.groupBy({
    where: { acceptanceStatus: AcceptanceStatus.ACCEPTED },
    by: ["category"],
  });

  const allCategories = categories.map((category) => category.category);
  return allCategories;
};

const updateCarAcceptanceStatus = async (
  id: string,
  status: AcceptanceStatus,
) => {
  const result = await prisma.car.update({
    where: {
      id,
    },
    data: {
      acceptanceStatus: status,
    },
  });
  if (result.acceptanceStatus === AcceptanceStatus.ACCEPTED) {
    await prisma.car.update({
      where: { id: result.id },
      data: { acceptenceDate: new Date() },
    });
    const mailOptions = {
      from: `"${result.email}" <${result.email}>`,
      to: result.email,
      subject: `Annuncio pubblicato ${result.brand} ${result.model}`,
      html: generateEmailHtml(),
    };
    await emailSender(mailOptions.subject, mailOptions.to, generateEmailHtml());
  }

  return result;
};

const updateCarType = async (id: string, type: CarType) => {
  const car = await prisma.car.findUnique({
    where: { id },
  });
  if (!car) {
    throw new ApiError(httpStatus.NOT_FOUND, "Car not found!");
  }
  const result = await prisma.car.update({
    where: {
      id,
    },
    data: {
      carType: car.carType === type ? CarType.NORMAL : type,
    },
  });

  return result;
};

const getBestOfferCars = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.car, query);
  const cars = await queryBuilder
    .filter()
    .rawFilter({
      carType: CarType.BEST_OFFER,
    })
    .execute();
  const meta = await queryBuilder.countTotal();
  return { cars, meta };
};

const getPopularCars = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.car, query);
  const cars = await queryBuilder
    .filter()
    .rawFilter({
      carType: CarType.POPULAR,
    })
    .execute();
  const meta = await queryBuilder.countTotal();
  return { cars, meta };
};

const getAllRejectedCars = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.car, query);
  const cars = await queryBuilder
    .search(["name", "description", "model", "brand", "category"])
    .filter()
    .rawFilter({
      acceptanceStatus: AcceptanceStatus.REJECTED,
    })
    .include({
      owner: {
        select: userSelectFields,
      },
    })
    .fields()
    .paginate()
    .sort()
    .execute();
  const meta = await queryBuilder.countTotal();
  return { cars, meta };
};

const suspendOrActiveCar = async (
  id: string,
  status: CarStatus,
  // ownerId: string
) => {
  const result = await prisma.car.update({
    where: {
      id,
      // ownerId,
    },
    data: {
      carStatus: status,
    },
  });
  return result;
};

const getAllBrand = async () => {
  const all = await prisma.car.groupBy({
    where: {
      acceptanceStatus: AcceptanceStatus.ACCEPTED,
      carStatus: CarStatus.ACTIVE,
    },
    by: ["brand"],
    _count: true,
  });

  const allBrand = all.map((item) => ({
    brand: item.brand,
    count: item._count,
  }));
  return allBrand;
};

const generateEmailHtml = () => {
  return `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="format-detection" content="telephone=no">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Annuncio pubblicato con successo! 🚀</title>
      <style type="text/css" emogrify="no">#outlook a { padding:0; } .ExternalClass { width:100%; } .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; } table td { border-collapse: collapse; mso-line-height-rule: exactly; } .editable.image { font-size: 0 !important; line-height: 0 !important; } .nl2go_preheader { display: none !important; mso-hide:all !important; mso-line-height-rule: exactly; visibility: hidden !important; line-height: 0px !important; font-size: 0px !important; } body { width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0; } img { outline:none; text-decoration:none; -ms-interpolation-mode: bicubic; } a img { border:none; } table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; } th { font-weight: normal; text-align: left; } *[class="gmail-fix"] { display: none !important; } </style>
      <style type="text/css" emogrify="no"> @media (max-width: 600px) { .gmx-killpill { content: ' \x03D1';} } </style>
      <style type="text/css" emogrify="no">@media (max-width: 600px) { .gmx-killpill { content: ' \x03D1';} .r0-o { border-style: solid !important; margin: 0 auto 0 auto !important; width: 320px !important } .r1-i { background-color: #ffffff !important } .r2-c { box-sizing: border-box !important; text-align: center !important; valign: top !important; width: 100% !important } .r3-o { border-style: solid !important; margin: 0 auto 0 auto !important; width: 100% !important } .r4-i { background-color: #f7f7f7 !important; padding-bottom: 20px !important; padding-left: 15px !important; padding-right: 15px !important; padding-top: 20px !important } .r5-c { box-sizing: border-box !important; display: block !important; valign: top !important; width: 100% !important } .r6-o { border-style: solid !important; width: 100% !important } .r7-i { padding-left: 0px !important; padding-right: 0px !important } .r8-o { background-size: auto !important; border-style: solid !important; margin: 0 auto 0 auto !important; width: 37% !important } .r9-i { padding-bottom: 15px !important; padding-top: 15px !important } .r10-i { background-color: #f7f7f7 !important; padding-bottom: 40px !important; padding-left: 15px !important; padding-right: 15px !important; padding-top: 20px !important } .r11-i { background-color: #f7f7f7 !important; padding-left: 0px !important; padding-right: 0px !important } .r12-c { box-sizing: border-box !important; padding-bottom: 0px !important; padding-top: 20px !important; text-align: center !important; valign: top !important; width: 100% !important } .r13-o { border-bottom-width: 0px !important; border-left-width: 0px !important; border-right-width: 0px !important; border-style: solid !important; border-top-width: 0px !important; margin: 0 auto 0 auto !important; margin-bottom: 12px !important; margin-top: 17px !important; width: 100% !important } .r14-i { background-color: #ffffff !important; padding-bottom: 0px !important; padding-left: 0px !important; padding-right: 0px !important; padding-top: 0px !important; text-align: center !important } .r15-o { border-style: solid !important; margin: 0 auto 0 auto !important; margin-bottom: 0px !important; margin-top: 0px !important; width: 38% !important } .r16-i { text-align: center !important } .r17-r { background-color: #c10000 !important; border-radius: 20px !important; border-width: 1px !important; box-sizing: border-box; height: initial !important; padding-bottom: 9px !important; padding-top: 9px !important; text-align: center !important; width: 100% !important } .r18-c { background-color: #f7f7f7 !important; box-sizing: border-box !important; color: #3b3f44 !important; padding-bottom: 20px !important; padding-left: 0px !important; padding-right: 0px !important; padding-top: 20px !important; text-align: center !important; width: 100% !important } .r19-c { box-sizing: border-box !important; text-align: center !important; width: 100% !important } .r20-o { border-style: solid !important; margin: 0 auto 0 auto !important; margin-bottom: 0px !important; margin-top: 0px !important; width: 100% !important } .r21-i { font-size: 0px !important; padding-bottom: 15px !important; padding-left: 85px !important; padding-right: 85px !important; padding-top: 15px !important } .r22-c { box-sizing: border-box !important; width: 32px !important } .r23-o { border-style: solid !important; margin-right: 8px !important; width: 32px !important } .r24-i { padding-bottom: 5px !important; padding-top: 5px !important } .r25-o { border-style: solid !important; margin-right: 0px !important; width: 32px !important } .r26-i { background-color: #f7f7f7 !important; padding-bottom: 20px !important; padding-left: 15px !important; padding-right: 15px !important; padding-top: 80px !important } .r27-c { box-sizing: border-box !important; text-align: left !important; valign: top !important; width: 100% !important } .r28-o { border-style: solid !important; margin: 0 auto 0 0 !important; width: 100% !important } .r29-i { padding-bottom: 10px !important; padding-left: 0px !important; padding-right: 0px !important; padding-top: 0px !important; text-align: center !important } .r30-i { padding-bottom: 0px !important; padding-left: 0px !important; padding-right: 0px !important; padding-top: 10px !important; text-align: center !important } body { -webkit-text-size-adjust: none } .nl2go-responsive-hide { display: none } .nl2go-body-table { min-width: unset !important } .mobshow { height: auto !important; overflow: visible !important; max-height: unset !important; visibility: visible !important } .resp-table { display: inline-table !important } .magic-resp { display: table-cell !important } } </style>
      <!--[if !mso]><!-->
      <style type="text/css" emogrify="no">@import url("https://fonts.googleapis.com/css2?family=Roboto"); </style>
      <!--<![endif]-->
      <style type="text/css">p, h1, h2, h3, h4, ol, ul, li { margin: 0; } .nl2go-default-textstyle { color: #414141; font-family: Roboto, Arial; font-size: 16px; line-height: 1.5; word-break: break-word } .default-button { color: #ffffff; font-family: Arial; font-size: 16px; font-style: normal; font-weight: normal; line-height: 1.15; text-decoration: none; word-break: break-word } a, a:link { color: #d1252b; text-decoration: underline } .default-heading1 { color: #414141; font-family: Arial; font-size: 36px; word-break: break-word } .default-heading2 { color: #414141; font-family: Arial; font-size: 32px; word-break: break-word } .default-heading3 { color: #1F2D3D; font-family: Arial; font-size: 24px; word-break: break-word } .default-heading4 { color: #1F2D3D; font-family: Arial; font-size: 18px; word-break: break-word } a[x-apple-data-detectors] { color: inherit !important; text-decoration: inherit !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; } .no-show-for-you { border: none; display: none; float: none; font-size: 0; height: 0; line-height: 0; max-height: 0; mso-hide: all; overflow: hidden; table-layout: fixed; visibility: hidden; width: 0; } </style>
      <!--[if mso]>
      <xml>
         <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
         </o:OfficeDocumentSettings>
      </xml>
      <![endif]-->
      <style type="text/css">a:link{color: #d1252b; text-decoration: underline;}</style>
   </head>
   <body bgcolor="#ffffff" text="#414141" link="#d1252b" yahoo="fix" style="background-color: #ffffff;">
      <table cellspacing="0" cellpadding="0" border="0" role="presentation" class="nl2go-body-table" width="100%" style="background-color: #ffffff; width: 100%;">
         <tr>
            <td>
               <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="600" align="center" class="r0-o" style="table-layout: fixed; width: 600px;">
                  <tr>
                     <td valign="top" class="r1-i" style="background-color: #ffffff;">
                        <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" align="center" class="r3-o" style="table-layout: fixed; width: 100%;">
                           <tr>
                              <td class="r4-i" style="background-color: #f7f7f7; padding-bottom: 20px; padding-top: 20px;">
                                 <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                    <tr>
                                       <th width="100%" valign="top" class="r5-c" style="font-weight: normal;">
                                          <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r6-o" style="table-layout: fixed; width: 100%;">
                                             <tr>
                                                <td valign="top" class="r7-i" style="padding-left: 15px; padding-right: 15px;">
                                                   <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                                      <tr>
                                                         <td class="r2-c" align="center">
                                                            <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="131" class="r8-o" style="table-layout: fixed; width: 131px;">
                                                               <tr>
                                                                  <td class="r9-i" style="font-size: 0px; line-height: 0px; padding-bottom: 15px; padding-top: 15px;"> <img src="https://img.mailinblue.com/7962968/images/content_library/original/67e1767b6d28d744d3e833e8.png" width="131" border="0" style="display: block; width: 100%;"></td>
                                                               </tr>
                                                            </table>
                                                         </td>
                                                      </tr>
                                                   </table>
                                                </td>
                                             </tr>
                                          </table>
                                       </th>
                                    </tr>
                                 </table>
                              </td>
                           </tr>
                        </table>
                        <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" align="center" class="r3-o" style="table-layout: fixed; width: 100%;">
                           <tr>
                              <td class="r10-i" style="background-color: #f7f7f7; padding-bottom: 40px; padding-top: 20px;">
                                 <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                    <tr>
                                       <th width="100%" valign="top" class="r5-c" style="background-color: #f7f7f7; font-weight: normal;">
                                          <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r6-o" style="table-layout: fixed; width: 100%;">
                                             <tr>
                                                <td valign="top" class="r11-i" style="background-color: #f7f7f7; padding-left: 15px; padding-right: 15px;">
                                                   <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                                      <tr>
                                                         <td class="r12-c" align="center" style="border-radius: 10px; font-size: 0px; line-height: 0px; padding-top: 20px; valign: top;"> <img src="https://img.mailinblue.com/7962968/images/content_library/original/67e1895b6fdd629320b1d778.png" width="570" border="0" style="display: block; width: 100%; border-radius: 10px;"></td>
                                                      </tr>
                                                   </table>
                                                </td>
                                             </tr>
                                          </table>
                                       </th>
                                    </tr>
                                 </table>
                              </td>
                           </tr>
                        </table>
                        <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" align="center" class="r3-o" style="table-layout: fixed; width: 100%;">
                           <tr>
                              <td class="r4-i" style="background-color: #f7f7f7; padding-bottom: 20px; padding-top: 20px;">
                                 <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                    <tr>
                                       <th width="100%" valign="top" class="r5-c" style="background-color: #f7f7f7; font-weight: normal;">
                                          <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r6-o" style="table-layout: fixed; width: 100%;">
                                             <tr>
                                                <td valign="top" class="r11-i" style="background-color: #f7f7f7; padding-left: 15px; padding-right: 15px;">
                                                   <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                                      <tr>
                                                         <td class="r2-c" align="left">
                                                            <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r13-o" style="border-bottom-width: 0px; border-collapse: separate; border-left-width: 0px; border-radius: 23px; border-right-width: 0px; border-top-width: 0px; margin-bottom: 12px; margin-top: 17px; table-layout: fixed; width: 100%;">
                                                               <tr>
                                                                  <td align="center" valign="top" class="r14-i nl2go-default-textstyle" style="color: #414141; font-family: Roboto,Arial; font-size: 16px; line-height: 1.5; word-break: break-word; background-color: #ffffff; border-radius: 23px; text-align: center;">
                                                                     <div>
                                                                        <p style="margin: 0;"> </p>
                                                                        <p style="margin: 0;"><span style="font-family: 'Arial black', helvetica, sans-serif, Arial; font-size: 14px;"><strong>Annuncio pubblicato!</strong></span></p>
                                                                        <p style="margin: 0;"> </p>
                                                                        <p style="margin: 0;"><span style="font-size: 13px;">Il tuo annuncio è appena stato pubblicato.</span></p>
                                                                        <p style="margin: 0;"> </p>
                                                                        <p style="margin: 0;"><span style="font-size: 13px;">Puoi modificare o cancellare il tuo annuncio in qualsiasi momento.</span></p>
                                                                        <p style="margin: 0;"><span style="font-size: 13px;">​</span></p>
                                                                        <p style="margin: 0;"><span style="font-size: 13px;">Grazie per aver scelto Bittengo.​</span></p>
                                                                        <p style="margin: 0;"><span style="font-size: 13px;">​</span></p>
                                                                        <p style="margin: 0;"><span style="font-size: 13px;">Cordiali saluti,​</span></p>
                                                                        <p style="margin: 0;"><span style="font-size: 13px;">Il team di Bittengo</span></p>
                                                                        <p style="margin: 0;"> </p>
                                                                     </div>
                                                                  </td>
                                                               </tr>
                                                            </table>
                                                         </td>
                                                      </tr>
                                                   </table>
                                                </td>
                                             </tr>
                                          </table>
                                       </th>
                                    </tr>
                                 </table>
                              </td>
                           </tr>
                        </table>
                        <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" align="center" class="r3-o" style="table-layout: fixed; width: 100%;">
                           <tr>
                              <td class="r4-i" style="background-color: #f7f7f7; padding-bottom: 20px; padding-top: 20px;">
                                 <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                    <tr>
                                       <th width="100%" valign="top" class="r5-c" style="background-color: #f7f7f7; font-weight: normal;">
                                          <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r6-o" style="table-layout: fixed; width: 100%;">
                                             <tr>
                                                <td valign="top" class="r11-i" style="background-color: #f7f7f7; padding-left: 15px; padding-right: 15px;">
                                                   <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                                      <tr>
                                                         <td class="r2-c" align="center">
                                                            <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="153" class="r15-o" style="table-layout: fixed; width: 153px;">
                                                               <tr>
                                                                  <td height="17" align="center" valign="top" class="r16-i nl2go-default-textstyle" style="color: #414141; font-family: Roboto,Arial; font-size: 16px; line-height: 1.5; word-break: break-word;">
                                                                     <!--[if mso]> 
                                                                     <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://bittengo.org" style="v-text-anchor:middle; height: 36px; width: 152px;" arcsize="50%" fillcolor="#c10000" strokecolor="#c10000" strokeweight="1px" data-btn="1">
                                                                        <w:anchorlock> </w:anchorlock>
                                                                        <v:textbox inset="0,0,0,0">
                                                                           <div style="display:none;">
                                                                              <center class="default-button"><span><span style="font-size:14px;">Sito web</span>&nbsp;</span></center>
                                                                           </div>
                                                                        </v:textbox>
                                                                     </v:roundrect>
                                                                     <![endif]-->  <!--[if !mso]><!-- --> <a href="https://bittengo.org" class="r17-r default-button" target="_blank" title="Conferma ora" data-btn="1" style="font-style: normal; font-weight: normal; line-height: 1.15; text-decoration: none; word-break: break-word; border-style: solid; word-wrap: break-word; display: block; -webkit-text-size-adjust: none; background-color: #c10000; border-color: #c10000; border-radius: 20px; border-width: 1px; color: #ffffff; font-family: Arial; font-size: 16px; height: 17px; mso-hide: all; padding-bottom: 9px; padding-top: 9px; width: 151px;"> <span><span style="font-size: 14px;">Sito web</span> </span></a> <!--<![endif]--> 
                                                                  </td>
                                                               </tr>
                                                            </table>
                                                         </td>
                                                      </tr>
                                                   </table>
                                                </td>
                                             </tr>
                                          </table>
                                       </th>
                                    </tr>
                                 </table>
                              </td>
                           </tr>
                        </table>
                        <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" align="center" class="r3-o" style="table-layout: fixed; width: 100%;">
                           <tr>
                              <td class="r4-i" style="background-color: #f7f7f7; padding-bottom: 20px; padding-top: 20px;">
                                 <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                    <tr>
                                       <th width="100%" valign="top" class="r5-c" style="font-weight: normal;">
                                          <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r6-o" style="table-layout: fixed; width: 100%;">
                                             <tr>
                                                <td valign="top" class="r7-i" style="padding-left: 15px; padding-right: 15px;">
                                                   <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                                      <tr>
                                                         <td class="r18-c" align="center" style="background-color: #f7f7f7; color: #3b3f44; padding-bottom: 20px; padding-top: 20px;">
                                                            <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" height="2" style="border-top-style: solid; background-clip: border-box; border-top-color: #000000; border-top-width: 2px; font-size: 2px; line-height: 2px;">
                                                               <tr>
                                                                  <td height="0" style="font-size: 0px; line-height: 0px;">­</td>
                                                               </tr>
                                                            </table>
                                                         </td>
                                                      </tr>
                                                   </table>
                                                </td>
                                             </tr>
                                          </table>
                                       </th>
                                    </tr>
                                 </table>
                              </td>
                           </tr>
                        </table>
                        <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" align="center" class="r3-o" style="table-layout: fixed; width: 100%;">
                           <tr>
                              <td class="r4-i" style="background-color: #f7f7f7; padding-bottom: 20px; padding-top: 20px;">
                                 <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                    <tr>
                                       <th width="100%" valign="top" class="r5-c" style="font-weight: normal;">
                                          <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r6-o" style="table-layout: fixed; width: 100%;">
                                             <tr>
                                                <td valign="top" class="r7-i" style="padding-left: 15px; padding-right: 15px;">
                                                   <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                                      <tr>
                                                         <td class="r19-c" align="center">
                                                            <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="570" align="center" class="r3-o" style="table-layout: fixed; width: 570px;">
                                                               <tr>
                                                                  <td valign="top">
                                                                     <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                                                        <tr>
                                                                           <td class="r19-c" align="center" style="display: inline-block;">
                                                                              <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="570" align="center" class="r20-o" style="table-layout: fixed; width: 570px;">
                                                                                 <tr>
                                                                                    <td class="r21-i" style="padding-bottom: 15px; padding-left: 212px; padding-right: 212px; padding-top: 15px;">
                                                                                       <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                                                                          <tr>
                                                                                             <th width="57" class="r22-c mobshow resp-table" style="font-weight: normal;">
                                                                                                <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r23-o" style="table-layout: fixed; width: 100%;">
                                                                                                   <tr>
                                                                                                      <td class="r24-i" style="font-size: 0px; line-height: 0px; padding-bottom: 5px; padding-top: 5px;"> <a href="https://www.instagram.com/bittengo_official?igsh=MW5tMnExb2FsOGxuaw%3D%3D&utm_source=qr" target="_blank" style="color: #d1252b; text-decoration: underline;"> <img src="https://creative-assets.mailinblue.com/editor/social-icons/rounded_bw/instagram_32px.png" width="32" border="0" style="display: block; width: 100%;"></a> </td>
                                                                                                      <td class="nl2go-responsive-hide" width="25" style="font-size: 0px; line-height: 1px;">­ </td>
                                                                                                   </tr>
                                                                                                </table>
                                                                                             </th>
                                                                                             <th width="57" class="r22-c mobshow resp-table" style="font-weight: normal;">
                                                                                                <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r23-o" style="table-layout: fixed; width: 100%;">
                                                                                                   <tr>
                                                                                                      <td class="r24-i" style="font-size: 0px; line-height: 0px; padding-bottom: 5px; padding-top: 5px;"> <a href="https://bittengo-frontend.vercel.app" target="_blank" style="color: #d1252b; text-decoration: underline;"> <img src="https://creative-assets.mailinblue.com/editor/social-icons/rounded_bw/website_32px.png" width="32" border="0" style="display: block; width: 100%;"></a> </td>
                                                                                                      <td class="nl2go-responsive-hide" width="25" style="font-size: 0px; line-height: 1px;">­ </td>
                                                                                                   </tr>
                                                                                                </table>
                                                                                             </th>
                                                                                             <th width="32" class="r22-c mobshow resp-table" style="font-weight: normal;">
                                                                                                <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r25-o" style="table-layout: fixed; width: 100%;">
                                                                                                   <tr>
                                                                                                      <td class="r24-i" style="font-size: 0px; line-height: 0px; padding-bottom: 5px; padding-top: 5px;"> <a href="https://www.facebook.com/share/15yFdw4ATZ/?mibextid=wwXIfr" target="_blank" style="color: #d1252b; text-decoration: underline;"> <img src="https://creative-assets.mailinblue.com/editor/social-icons/rounded_bw/facebook_32px.png" width="32" border="0" style="display: block; width: 100%;"></a> </td>
                                                                                                   </tr>
                                                                                                </table>
                                                                                             </th>
                                                                                          </tr>
                                                                                       </table>
                                                                                    </td>
                                                                                 </tr>
                                                                              </table>
                                                                           </td>
                                                                        </tr>
                                                                     </table>
                                                                  </td>
                                                               </tr>
                                                            </table>
                                                         </td>
                                                      </tr>
                                                   </table>
                                                </td>
                                             </tr>
                                          </table>
                                       </th>
                                    </tr>
                                 </table>
                              </td>
                           </tr>
                        </table>
                        <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" align="center" class="r3-o" style="table-layout: fixed; width: 100%;">
                           <tr>
                              <td class="r26-i" style="background-color: #f7f7f7; padding-bottom: 20px; padding-top: 80px;">
                                 <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                    <tr>
                                       <th width="100%" valign="top" class="r5-c" style="font-weight: normal;">
                                          <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r6-o" style="table-layout: fixed; width: 100%;">
                                             <tr>
                                                <td valign="top" class="r7-i" style="padding-left: 15px; padding-right: 15px;">
                                                   <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                                      <tr>
                                                         <td class="r27-c" align="left">
                                                            <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r28-o" style="table-layout: fixed; width: 100%;">
                                                               <tr>
                                                                  <td align="center" valign="top" class="r29-i nl2go-default-textstyle" style="color: #414141; font-family: Roboto,Arial; font-size: 16px; line-height: 1.5; word-break: break-word; padding-bottom: 10px; text-align: center;">
                                                                     <div>
                                                                        <p style="margin: 0; color: #000000; font-size: 14px;"><strong>BITTENGO</strong></p>
                                                                     </div>
                                                                  </td>
                                                               </tr>
                                                            </table>
                                                         </td>
                                                      </tr>
                                                      <tr>
                                                         <td class="r27-c" align="left">
                                                            <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r28-o" style="table-layout: fixed; width: 100%;">
                                                               <tr>
                                                                  <td align="center" valign="top" class="r29-i nl2go-default-textstyle" style="color: #414141; font-family: Roboto,Arial; font-size: 16px; line-height: 1.5; word-break: break-word; padding-bottom: 10px; text-align: center;">
                                                                     <div>
                                                                        <p style="margin: 0;"><span style="color: #666666; font-size: 14px;">Via massagno 17, 6900, Massagno</span></p>
                                                                     </div>
                                                                  </td>
                                                               </tr>
                                                            </table>
                                                         </td>
                                                      </tr>
                                                      <tr>
                                                         <td class="r27-c" align="left">
                                                            <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r28-o" style="table-layout: fixed; width: 100%;">
                                                               <tr>
                                                                  <td align="center" valign="top" class="r30-i nl2go-default-textstyle" style="color: #414141; font-family: Roboto,Arial; font-size: 16px; line-height: 1.5; word-break: break-word; padding-top: 10px; text-align: center;">
                                                                     <div>
                                                                        <p style="margin: 0;"><span style="color: #666666; font-size: 14px;">Questa email è stata inviata a {{ result.email }}.</span></p>
                                                                        <p style="margin: 0;"><span style="color: #666666; font-size: 14px;">Hai ricevuto questa email perché sei iscritto/a alla nostra newsletter.</span></p>
                                                                     </div>
                                                                  </td>
                                                               </tr>
                                                            </table>
                                                         </td>
                                                      </tr>
                                                      <tr>
                                                         <td class="r27-c" align="left">
                                                            <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r28-o" style="table-layout: fixed; width: 100%;">
                                                               <tr>
                                                                  <td align="center" valign="top" class="r30-i nl2go-default-textstyle" style="color: #414141; font-family: Roboto,Arial; font-size: 16px; line-height: 1.5; word-break: break-word; padding-top: 10px; text-align: center;">
                                                                     <div>
                                                                        <p style="margin: 0;"><a href="{{ unsubscribe }}" target="_blank" style="color: #d1252b; text-decoration: underline;"><span style="color: #666666; font-size: 14px;"><u>Annulla iscrizione</u></span></a></p>
                                                                     </div>
                                                                  </td>
                                                               </tr>
                                                            </table>
                                                         </td>
                                                      </tr>
                                                   </table>
                                                </td>
                                             </tr>
                                          </table>
                                       </th>
                                    </tr>
                                 </table>
                              </td>
                           </tr>
                        </table>
                     </td>
                  </tr>
               </table>
            </td>
         </tr>
      </table>
   </body>
</html>
  `;
};

export async function getCurrentInCimaCar(): Promise<Car | null> {
  const now = new Date();

  const activeInCimaPromotion = await prisma.carPromotion.findFirst({
    where: {
      promotionType: "IN_CIMA",
      endTime: null, // Only active IN_CIMA (no expiry)
    },
    orderBy: {
      startTime: "desc", // Latest one wins (safety)
    },
    select: {
      carId: true, // We only need the carId here
    },
  });

  if (!activeInCimaPromotion) {
    return null; // No car has IN_CIMA right now
  }

  // Now fetch the FULL car details using the carId
  const car = await prisma.car.findUnique({
    where: { id: activeInCimaPromotion.carId },
    include: {
      owner: {
        select: {
          firstName: true,
          lastName: true,
          phoneNumber: true,
          email: true,
        },
      },
    },
  });

  return car;
}

// promotion.service.ts

export const getInHomepageCars = async () => {
  const now = new Date();

  const activePromos = await prisma.carPromotion.findMany({
    where: {
      promotionType: "IN_HOMEPAGE",
      endTime: { gte: now },
    },
    include: {
      car: {
        include: {
          owner: {
            select: {
              firstName: true,
              lastName: true,
              phoneNumber: true,
              email: true,
              subscriptionType: true,
            },
          },
        },
      },
    },
    orderBy: { endTime: "desc" }, // Soonest to expire first (or change to desc)
  });

  // Return car + promotion timing
  return activePromos.map((promo) => {
    const endTime = promo.endTime;

    // But we handle null safely
    const remainingHours = endTime
      ? Math.round((endTime.getTime() - now.getTime()) / (1000 * 60 * 60))
      : null;

    return {
      car: promo.car,
      promotion: {
        startTime: promo.startTime,
        promotionType: promo.promotionType,
        endTime: endTime,
        remainingHours,
      },
    };
  });
};

export const getInRisaltoCars = async () => {
  const now = new Date();

  const activePromos = await prisma.carPromotion.findMany({
    where: {
      promotionType: "IN_RISALTO",
      endTime: { gte: now },
    },
    include: {
      car: {
        include: {
          owner: {
            select: {
              firstName: true,
              lastName: true,
              phoneNumber: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { endTime: "asc" },
  });

  // Return car + promotion timing
  return activePromos.map((promo) => {
    const endTime = promo.endTime;

    // But we handle null safely
    const remainingHours = endTime
      ? Math.round((endTime.getTime() - now.getTime()) / (1000 * 60 * 60))
      : null;

    return {
      car: promo.car,
      promotion: {
        startTime: promo.startTime,
        endTime: endTime,
        remainingHours,
      },
    };
  });
};

const getCarBySlug = async (slug: string) => {
  const car = await prisma.car.findUnique({
    where: {
      slug: slug,
    },
    include: {
      owner: {
        select: userSelectFields,
      },
    },
  });
  if (!car) {
    throw new ApiError(httpStatus.NOT_FOUND, "Car not found");
  }
  return car;
};

const getCarPromotionwithCheckoutId = async (checkoutId: string) => {
  const purchaseHistory = await prisma.purchaseHistory.findFirst({
    where: { stripeCheckoutId: checkoutId, status: "COMPLETED" },
  });
  if (!purchaseHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Purchase history not found");
  }

  const carPromotion = await prisma.carPromotion.findFirst({
    where: {
      purchaseHistoryId: purchaseHistory.id,
    },
    include: {
      car: true,
    },
  });
  if (!carPromotion) {
    throw new ApiError(httpStatus.NOT_FOUND, "Car promotion not found");
  }

  return carPromotion;
};

const getAllCarByownerWithAuth = async (
  id: string,
  query: Record<string, any>,
) => {
  const queryBuilder = new QueryBuilder(prisma.car, query);
  const cars = await queryBuilder
    .search(["model", "brand"])
    .filter()
    .fields()
    .rawFilter({
      ownerId: id,
      acceptanceStatus: {
        in: [AcceptanceStatus.ACCEPTED, AcceptanceStatus.PENDING],
      },
    })
    .include({
      owner: {
        select: userSelectFields,
      },
    })
    .paginate()
    .execute();
  const meta = await queryBuilder.countTotal();
  return { meta, cars };
};

const removeOtherImage = async (
  carId: string,
  imageUrl: string,
  userRole: UserRole,
  userId = null,
) => {
  const car = await prisma.car.findUnique({
    where: {
      id: carId,
    },
  });
  if (!car) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Car not found to remove other image",
    );
  }
  if (userRole == UserRole.USER) {
    if (!userId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "UserId is required");
    }
    if (car.ownerId !== userId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You are not the owner of this car",
      );
    }
    console.log("passed");
  }
  const newOtherImages = car.otherImages.filter(
    (image: string) => image !== imageUrl,
  );
  await prisma.car.update({
    where: { id: car.id },
    data: { otherImages: newOtherImages },
  });
  await deleteFileFromS3(imageUrl);
  return {};
};

export const CarService = {
  createCar,
  getCarById,
  getAllCars,
  updateCar,
  deleteCar,
  incrementViewCount,
  getAllCarOwners,
  getAllCarByowner,
  getAllCategoryWhichHaveCar,
  updateCarType,
  getBestOfferCars,
  getPopularCars,
  getAllPendingCars,
  updateCarAcceptanceStatus,
  getAllRejectedCars,
  suspendOrActiveCar,
  getAllBrand,
  getAllCarsWithSuspended,
  getCurrentInCimaCar,
  getInHomepageCars,
  getInRisaltoCars,
  getCarBySlug,
  getCarPromotionwithCheckoutId,
  getAllCarByownerWithAuth,
  updateCarByOwner,
  removeOtherImage,
};
