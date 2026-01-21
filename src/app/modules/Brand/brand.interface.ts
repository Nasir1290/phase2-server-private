import { AdvertisingType, FuelType, Transmission } from "@prisma/client";


 export type TCar = {
  categoryId: string;
  brandId: string;
  ownerId: string; 
  model: string;
  year: number;
  transmission: Transmission;
  advertisingType?: AdvertisingType; //optional
  color: string;
  kmh: number;
  engine: string;
  maxSpeed: number;
  horsePower: number;
  seats: number;
  fuelType: FuelType;
  description: string;
  images: string[];
  video: string;
  price: any[]; // Assuming price is an array of JSON objects
  accessories: string[];
  damageDeductible: string;
  depositePolicy: string;
  fuelPolicy: string;
  mileagePolicy: string;
  damagePolicy: string;
  advertiserName: string;
  phoneNumber: string;
  email: string;
  whatsapp: string;
  location: string;
  authenticationFile: string;
};
