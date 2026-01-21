import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { CarService } from "./car.services";
import { fileUploader } from "../../../helpars/fileUploader";
import { Request, Response } from "express";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import { fileUploadToS3 } from "../../../helpars/s3";

const createCar = catchAsync(async (req: any, res: Response) => {
  const carData = req.body;
  const mainImage = req.files?.mainImage;
  const otherImages = req.files?.otherImages;
  const video = req.files?.video;
  const authenticationFile = req.files?.authenticationFile;
  if (mainImage) {
    carData.mainImage =
      // config.backend_image_url + "/" + mainImage?.[0]?.filename;
      await fileUploadToS3(mainImage?.[0], {
        folder: "car",
        title: "car",
      });
  }
  if (otherImages) {
    const imageUrls = await Promise.all(
      otherImages.map(
        // (image: any) => config.backend_image_url + "/" + image?.filename
        async (image: Express.Multer.File) =>
          await fileUploadToS3(image, {
            folder: "car",
            title: "car",
          })
      )
    );
    if (imageUrls.length > 6) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Maximum 6 images are allowed"
      );
    }
    carData.otherImages = imageUrls;
  }
  if (video) {
    carData.video =
      // config.backend_image_url + "/" + video?.[0]?.filename;
      await fileUploadToS3(video?.[0], {
        folder: "car",
        title: "car",
      });
  }
  if (authenticationFile) {
    carData.authenticationFile =
      // config.backend_image_url + "/" + authenticationFile?.[0]?.filename;
      await fileUploadToS3(authenticationFile?.[0], {
        folder: "car",
        title: "car",
      });
  }
  const result = await CarService.createCar(carData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Car Create successfully",
    data: result,
  });
});
const createCarByUser = catchAsync(async (req: any, res: Response) => {
  const user = req.user;
  const carData = req.body;
  carData.ownerId = user.id;
  const mainImage = req.files?.mainImage;
  const otherImages = req.files?.otherImages;
  const video = req.files?.video;
  const authenticationFile = req.files?.authenticationFile;
  if (mainImage) {
    carData.mainImage =
      // config.backend_image_url + "/" + mainImage?.[0]?.filename;
      await fileUploadToS3(mainImage?.[0], {
        folder: "car",
        title: "car",
      });
  }
  if (otherImages) {
    const imageUrls = await Promise.all(
      otherImages.map(
        // (image: any) => config.backend_image_url + "/" + image?.filename
        async (image: Express.Multer.File) =>
          await fileUploadToS3(image, {
            folder: "car",
            title: "car",
          })
      )
    );
    if (imageUrls.length > 6) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Maximum 6 images are allowed"
      );
    }
    carData.otherImages = imageUrls;
  }
  if (video) {
    carData.video =
      // config.backend_image_url + "/" + video?.[0]?.filename;
      await fileUploadToS3(video?.[0], {
        folder: "car",
        title: "car",
      });
  }
  if (authenticationFile) {
    carData.authenticationFile =
      // config.backend_image_url + "/" + authenticationFile?.[0]?.filename;
      await fileUploadToS3(authenticationFile?.[0], {
        folder: "car",
        title: "car",
      });
  }
  const result = await CarService.createCar(carData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Car Create successfully",
    data: result,
  });
});

const getCarById = catchAsync(async (req: Request, res: Response) => {
  const result = await CarService.getCarById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Car retrived successfully",
    data: result,
  });
});

const getAllCars = catchAsync(async (req: Request, res: Response) => {
  const result = await CarService.getAllCars(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cars retrived successfully",
    meta: result.meta,
    data: result.cars,
  });
});

const getAllCarsWithSuspended = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CarService.getAllCarsWithSuspended(req.query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Cars retrived successfully",
      meta: result.meta,
      data: result.cars,
    });
  }
);

const getAllPendingCars = catchAsync(async (req: Request, res: Response) => {
  const result = await CarService.getAllPendingCars(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Pending Cars retrived successfully",
    meta: result.meta,
    data: result.cars,
  });
});

const updateCar = catchAsync(async (req: any, res: Response) => {
  const mainImage = req.files?.mainImage;
  const carData = req.body;
  const otherImages = req.files?.otherImages;
  const authenticationFile = req.files?.authenticationFile;
  const video = req.files?.video;

  if (mainImage) {
    carData.mainImage =
      // config.backend_image_url + "/" + mainImage?.[0]?.filename;
      await fileUploadToS3(mainImage?.[0], {
        folder: "car",
        title: "car",
      });
  }
  if (otherImages) {
    const imageUrls = await Promise.all(
      otherImages.map(
        // (image: any) => config.backend_image_url + "/" + image?.filename
        async (image: Express.Multer.File) =>
          await fileUploadToS3(image, {
            folder: "car",
            title: "car",
          })
      )
    );
    if (imageUrls.length > 6) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Maximum 6 images are allowed"
      );
    }
    carData.otherImages = imageUrls;
  }
  if (video) {
    carData.video =
      // config.backend_image_url + "/" + video?.[0]?.filename;
      await fileUploadToS3(video?.[0], {
        folder: "car",
        title: "car",
      });
  }
  if (authenticationFile) {
    carData.authenticationFile =
      // config.backend_image_url + "/" + authenticationFile?.[0]?.filename;
      await fileUploadToS3(authenticationFile?.[0], {
        folder: "car",
        title: "car",
      });
  }

  const result = await CarService.updateCar(req.params.id, carData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Car update successfully",
    data: result,
  });
});

const updateCarByOwner = catchAsync(async (req: any, res: Response) => {
  const user = req.user;
  const mainImage = req.files?.mainImage;
  const carData = req.body;
  const otherImages = req.files?.otherImages;
  const authenticationFile = req.files?.authenticationFile;
  const video = req.files?.video;

  if (mainImage) {
    carData.mainImage =
      // config.backend_image_url + "/" + mainImage?.[0]?.filename;
      await fileUploadToS3(mainImage?.[0], {
        folder: "car",
        title: "car",
      });
  }
  if (otherImages) {
    const imageUrls = await Promise.all(
      otherImages.map(
        // (image: any) => config.backend_image_url + "/" + image?.filename
        async (image: Express.Multer.File) =>
          await fileUploadToS3(image, {
            folder: "car",
            title: "car",
          })
      )
    );
    if (imageUrls.length > 6) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Maximum 6 images are allowed"
      );
    }
    carData.otherImages = imageUrls;
  }
  if (video) {
    carData.video =
      // config.backend_image_url + "/" + video?.[0]?.filename;
      await fileUploadToS3(video?.[0], {
        folder: "car",
        title: "car",
      });
  }
  if (authenticationFile) {
    carData.authenticationFile =
      // config.backend_image_url + "/" + authenticationFile?.[0]?.filename;
      await fileUploadToS3(authenticationFile?.[0], {
        folder: "car",
        title: "car",
      });
  }

  const result = await CarService.updateCarByOwner(
    user.id,
    req.params.id,
    carData
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Car update successfully",
    data: result,
  });
});

const deleteCar = catchAsync(async (req: Request, res: Response) => {
  const result = await CarService.deleteCar(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Car deleted successfully",
    data: {},
  });
});

const incrementViewCount = catchAsync(async (req: Request, res: Response) => {
  const result = await CarService.incrementViewCount(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Car views increment successfully",
    data: result,
  });
});

const getAllCarOwners = catchAsync(async (req: Request, res: Response) => {
  const result = await CarService.getAllCarOwners(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Car owners retrieved successfully",
    data: result,
  });
});

const getAllCarByowner = catchAsync(async (req: Request, res: Response) => {
  const result = await CarService.getAllCarByowner(req.params.id, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Car owners retrieved successfully",
    data: result,
  });
});

const getAllCategoryWhichHaveCar = catchAsync(async (req, res) => {
  const result = await CarService.getAllCategoryWhichHaveCar();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Car owners retrieved successfully",
    data: result,
  });
});

const updateCarType = catchAsync(async (req: Request, res: Response) => {
  const result = await CarService.updateCarType(
    req.params.id,
    req.body.carType
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Car type updated successfully",
    data: result,
  });
});

const getBestOfferCars = catchAsync(async (req, res) => {
  const result = await CarService.getBestOfferCars(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Best offer cars retrieved successfully",
    meta: result.meta,
    data: result.cars,
  });
});

const getPopularCars = catchAsync(async (req, res) => {
  const result = await CarService.getPopularCars(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Popular cars retrieved successfully",
    meta: result.meta,
    data: result.cars,
  });
});

const updateCarAcceptanceStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CarService.updateCarAcceptanceStatus(
      req.params.id,
      req.body.acceptanceStatus
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Car status updated successfully",
      data: result,
    });
  }
);

const getAllRejectedCars = catchAsync(async (req: Request, res: Response) => {
  const result = await CarService.getAllRejectedCars(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rejected Cars retrived successfully",
    meta: result.meta,
    data: result.cars,
  });
});

const suspendOrActiveCar = catchAsync(async (req: Request, res: Response) => {
  const result = await CarService.suspendOrActiveCar(
    req.params.id,
    req.body.status
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Car status updated successfully",
    data: result,
  });
});

const getAllBrand = catchAsync(async (req: Request, res: Response) => {
  const result = await CarService.getAllBrand();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Brands retrieved successfully",
    data: result,
  });
});

const getCurrentInCimaCar = catchAsync(async (req: Request, res: Response) => {
  const result = await CarService.getCurrentInCimaCar();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Current In Cima car retrieved successfully",
    data: result,
  });
});

const getInHomepageCars = catchAsync(async (req: Request, res: Response) => {
  const cars = await CarService.getInHomepageCars();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "In Homepage cars retrieved successfully",
    data: cars,
  });
});

const getInRisaltoCars = catchAsync(async (req: Request, res: Response) => {
  const cars = await CarService.getInRisaltoCars();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "In Risalto cars retrieved successfully",
    data: cars,
  });
});

const getCarBySlug = catchAsync(async (req: Request, res: Response) => {
  const car = await CarService.getCarBySlug(req.params.slug);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Car retrieved successfully",
    data: car,
  });
});

const getCarPromotionwithCheckoutId = catchAsync(
  async (req: Request, res: Response) => {
    const promotion = await CarService.getCarPromotionwithCheckoutId(
      req.params.checkoutId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Car promotion information retrieved successfully",
      data: promotion,
    });
  }
);

const getAllCarByownerWithAuth = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await CarService.getAllCarByownerWithAuth(
      user.id,
      req.query
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Car owners retrieved successfully",
      data: result,
    });
  }
);

const removeOtherImage = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await CarService.removeOtherImage(
    req.body.carId,
    req.body.imageUrl,
    user.role,
    user.id
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Image removed successfully",
    data: {},
  });
});

export const CarController = {
  createCar,
  createCarByUser,
  getCarById,
  getAllCars,
  updateCar,
  updateCarByOwner,
  deleteCar,
  getBestOfferCars,
  getPopularCars,
  incrementViewCount,
  getAllCarOwners,
  getAllCarByowner,
  getAllCategoryWhichHaveCar,
  updateCarType,
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
  removeOtherImage,
};
