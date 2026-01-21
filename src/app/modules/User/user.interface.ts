export interface TUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  state: string;
  zipCode: string;
  role?: string;
  userStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IUserFilterRequest = {
  name?: string | undefined;
  email?: string | undefined;
  contactNumber?: string | undefined;
  searchTerm?: string | undefined;
};

export type ISocialUser = {
  email: string;
  firstName: string;
  lastName?: string;
  profilePic: string;
};

export const userSelectFields = {
  id: true,
  firstName: true,
  lastName: true,
  sureName: true,
  profilePic: true,
  role:true,
  website: true,
  cantone: true,
  indirizzo: true,
  cap: true,
  phoneNumber: true,
  email: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
  userStatus: true,
  billingDataId: true,
  inRisaltoDays: true,
  inHomePageDays: true,
  inCimaTimes: true,
  subscriptionType: true,
  realtimeNotification: true,
  notificationSOund: true,
} as const;

export type UserSelectType = typeof userSelectFields;
