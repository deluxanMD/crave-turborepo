export enum Role {
  CUSTOMER = 'CUSTOMER',
  RESTAURANT_OWNER = 'RESTAURANT_OWNER',
  DRIVER = 'DRIVER',
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}
