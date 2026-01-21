// Enums (exactly matching your Prisma schema)
export enum AcceptanceStatus {
  ACCEPTED = "ACCEPTED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
}

export enum CarType {
  NORMAL = "NORMAL",
  BEST_OFFER = "BEST_OFFER",
  POPULAR = "POPULAR",
}

export enum CarStatus {
  SUSPEND = "SUSPEND",
  ACTIVE = "ACTIVE",
}

export enum Transmission {
  MANUAL = "MANUAL",
  AUTOMATIC = "AUTOMATIC",
}

export enum AdvertisingType {
  AT_THE_TOP = "AT_THE_TOP",
  IN_HOMEPAGE = "IN_HOMEPAGE",
  HIGHLIGHTED = "HIGHLIGHTED",
  ALL = "ALL",
}

export enum FuelType {
  IBRIDO = "IBRIDO",
  ELETTRICO = "ELETTRICO",
  DIESEL = "DIESEL",
  BENZINA = "BENZINA",
}

// Price is a Prisma "type" (embedded object), not a model
export interface Price {
  rentalTime?: number | null;
  price?: number | null;
  kilometerPerHour?: string | null;
}
export interface CreateCarInput {
  ownerId: string;
  model: string;
  year: number;
  color: string;
  kmh: number;
  brand: string;
  engine: string;
  maxSpeed: number;
  horsePower: number;
  seats: number;
  deposite: number;
  description: string;
  mainImage: string;
  otherImages: string[];
  video?: string | null;
  accessories: string[];
  depositePolicy: string;
  fuelPolicy: string;
  mileagePolicy: string;
  damagePolicy: string;
  advertiserName: string;
  phoneNumber: string;
  email: string;
  whatsapp: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  authenticationFile: string;
  category: string;
  acceptanceStatus?: AcceptanceStatus;
  carType?: CarType;
  carStatus?: CarStatus;
  transmission: Transmission;
  advertisingType?: AdvertisingType | null;
  fuelType: FuelType;
  price: Price[];
  city: string;
}
export interface UpdateCarInput {
  ownerId: string;
  model: string;
  year: number;
  color: string;
  kmh: number;
  brand: string;
  engine: string;
  maxSpeed: number;
  horsePower: number;
  seats: number;
  deposite: number;
  description: string;
  mainImage: string;
  otherImages: string[];
  video?: string | null;
  accessories: string[];
  depositePolicy: string;
  fuelPolicy: string;
  mileagePolicy: string;
  damagePolicy: string;
  advertiserName: string;
  phoneNumber: string;
  email: string;
  whatsapp: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  authenticationFile: string;
  category: string;
  acceptanceStatus?: AcceptanceStatus;
  carType?: CarType;
  carStatus?: CarStatus;
  transmission: Transmission;
  advertisingType?: AdvertisingType | null;
  fuelType: FuelType;
  price: Price[];
  city: string;
  oneDayRentalPrice: number;
  oneDayRentalKilometer: string;
}
