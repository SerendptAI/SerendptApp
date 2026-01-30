export type User = {
  name?: string;
  email?: string;
  password?: string;
  businessName?: string;
  businessEmail?: string;
  address?: string;
  phone?: number;
  cacNumber?: string;
  otp?: string;
};

export type SignupRequest = {
  full_name?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
};

export type LoginRequest = {
  name?: string;
  email?: string;
  password?: string;
};

export type ForgotPasswordRequest = {
  email?: string;
};

export type ResetPasswordRequest = {
  email?: string;
  new_password?: string;
  confirm_new_password?: string;
};

export type VerifyForgotPasswordRequest = {
  email?: string;
  otp?: string;
};
export type GoogleLoginRequest = {
  id_token?: string;
};

export type SignupResponse = {
  message: string;
  email: string;
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  otp_required?: boolean;
};
export type ResendOtpRequest = {
  email: string;
  purpose: string;
};

export type AuthResponse = {
  message: string;
  user_email: string;
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  otp_required?: boolean;
};

export type VerifyOtpRequest = {
  email: string;
  otp_code: string;
};
