const OrderStatuses = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
};

const paypalBaseUrl = {
  sandbox: "https://api-m.sandbox.paypal.com",
};

const AvailableOrderStatusEnums = Object.values(OrderStatuses);

/**
 * @type {{ UNKNOWN:"UNKNOWN"; PAYSTACK: "PAYSTACK"; FLUTTERWAVE: "FLUTTERWAVE"; BANK: "BANK";} as const}
 */
const PaymentMethods = {
  UNKNOWN: "UNKNOWN",
  BANK: "BANK",
  PAYSTACK: "PAYSTACK",
  FLUTTERWAVE: "FLUTTERWAVE",
};

const AvailablePaymentMethods = Object.values(PaymentMethods);

const paystackStatus = {
  success: "success",
};

const RoleEnums = {
  USER: "USER",
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
};

const AvailableRoles = Object.values(RoleEnums);

const LoginType = {
  EMAIL_PASSWORD: "EMAIL_PASSWORD",
  GOOGLE: "GOOGLE",
};

const AvailableLoginType = Object.values(LoginType);

const MAX_SUB_IMAGES_TO_BE_UPLOAD = 10;

module.exports = {
  paystackStatus,
  AvailableOrderStatusEnums,
  OrderStatuses,
  PaymentMethods,
  AvailablePaymentMethods,
  RoleEnums,
  AvailableRoles,
  LoginType,
  AvailableLoginType,
  MAX_SUB_IMAGES_TO_BE_UPLOAD,
  paypalBaseUrl,
};
