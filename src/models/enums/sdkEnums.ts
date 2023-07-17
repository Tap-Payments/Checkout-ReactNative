export enum AllowedCardNetworks {
  VISA = 'VISA',
  AMEX = 'AMEX',
  JCB = 'JCB',
  MADA = 'MADA',
}

export enum TapCheckoutFlipStatus {
  noFlipping = 1,
  flipOnLoadWithFlippingBack = 2,
  flipOnLoadWithOutFlippingBack = 3,
}

export enum MerchantCapabilities {
  capability3DS,
  capabilityCredit,
  capabilityDebit,
  capabilityEMV,
}

export enum SaveCardType {
  None,
  Merchant,
  Tap,
  All,
}

export enum SdkMode {
  production,
  sandbox,
}

export enum SDKCallMode {
  getAppleToken,
  getTapToken,
}

export enum TapApplePayButtonType {
  appleLogoOnly = 'plain',
  buyWithApplePay = 'buy',
  setupApplePay = 'setup',
  payWithApplePay = 'pay',
  donateWithApplePay = 'donate',
  checkoutWithApplePay = 'checkout',
  bookWithApplePay = 'book',
  subscribeWithApplePay = 'subscripe',
}

export enum TapApplePayButtonStyleOutline {
  Black = 'black',
  White = 'white',
  WhiteOutline = 'whiteoutline',
  Auto = 'auto',
}

export enum AmountModificationType {
  Percentage = 'P',
  Fixed = 'F',
}
export enum AuthorizeActionType {
  Capture = 'CAPTURE',
  Void = 'VOID',
}
export enum CardType {
  All = 'CardType',
  Debit = 'Debit',
  Credit = 'Credit',
}

export enum TapPaymentType {
  All = 'all',
  /// Meaning, only web (redirectional) payments wil be visible (like KNET, BENEFIT, FAWRY, etc.)
  Web = 'web',
  /// Meaning, only card (debit and credit) form payment will be visible
  Card = 'card',
  /// Meaning, only telecom operators payments wil be visible (like VIVA, STC, etc.)
  Telecom = 'telecom',
  /// Meaning, only Apple pay will be visible
  ApplePay = 'apple_pay',
  /// Only device payments. (e.g. Apple pay)
  Device = 'device',
  /// If the user is paying with a saved card
  SavedCard = 'saved_card',
}

/// Defines the style of the checkout close button
export enum CheckoutCloseButtonEnum {
  /// Will show a close button icon only
  icon = 1,
  /// Will show the word "CLOSE" as a title only
  title = 2,
}

export enum TransactionMode {
  purchase = 'PURCHASE',
  authorizeCapture = 'AUTHORIZE_CAPTURE',
  cardSaving = 'SAVE_CARD',
  cardTokenization = 'TOKENIZE_CARD',
}

export enum AddressType {
  residential = 'RESIDENTIAL',
  commercial = 'COMMERCIAL',
}

export enum AddressFormat {
  a = 'FORMAT_A',
  b = 'FORMAT_B',
  c = 'FORMAT_C',
}
