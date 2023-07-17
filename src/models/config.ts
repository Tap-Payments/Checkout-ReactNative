import type {
  AllowedCardNetworks,
  MerchantCapabilities,
  SdkMode,
  TapCurrencyCode,
  AmountModificationType,
  TapPaymentType,
  CheckoutCloseButtonEnum,
  TransactionMode,
  AddressType,
  CardType,
  AuthorizeActionType,
  SaveCardType,
  TapApplePayButtonType,
  TapApplePayButtonStyleOutline,
  AddressFormat,
  TapCheckoutFlipStatus,
} from './enums';

export type Vendor = {
  id: string;
  name: string;
};

export type ItemModel = {
  name?: string;
  description?: string;
  productId?: string;
  fulfillmentService?: string;
  category: 'PHYSICAL_GOODS' | 'DIGITAL_GOODS';
  itemCode?: string;
  tags?: string;
  accountCode?: string;
  vendor?: Vendor;
  requiresShipping: boolean;
  amount?: number;
  discount?: AmountModificatorModel[];
  taxes?: Tax[];
  quantity: number;
  currency?: TapCurrencyCode;
};

export type Tax = {
  name: string;
  description?: string;
  rate: AmountModificatorModel;
};

export type TapEmailAddress = {
  value: string;
};

export type TapPhone = {
  isdNumber: string;
  phoneNumber: string;
};

export type Country = {
  isoCode: string;
};

export type Address = {
  format?: AddressFormat;
  type?: AddressType;
  country?: String;
  line1?: String;
  line2?: String;
  line3?: String;
  line4?: String;
  city?: String;
  state?: String;
  zipCode?: String;
  countryGovernorate?: String;
  area?: String;
  block?: String;
  avenue?: String;
  street?: String;
  building?: String;
  floor?: String;
  office?: String;
  apartment?: String;
  poBox?: String;
  postalCode?: String;
};

export type TapCustomer = {
  id?: string;
  email: string;
  phone: { countryCode: string; number: string };
  firstName: string;
  middleName?: string;
  lastName?: string;
  description?: string;
  metadata?: Object;
  title?: string;
  nationality?: String;
  currency?: TapCurrencyCode;
  address?: Address;
  locale?: String;
};

export type Destination = {
  identifier: string;
  amount: number;
  currency: TapCurrencyCode;
  descriptionText?: string;
  reference?: string;
};

export type AmountModificatorModel = {
  type?: AmountModificationType;
  value?: number;
  maximumFee: number;
  minimumFee: number;
};

export type ShippingProvider = {
  id: string;
  name: string;
};

export type Shipping = {
  name: String;
  descriptionText?: String;
  amount: number;
  currency: TapCurrencyCode;
  recipientName?: String;
  address?: Address;
  provider?: ShippingProvider;
};

export type Reference = {
  transactionNumber?: string;
  orderNumber?: string;
};

export type Receipt = {
  sms: boolean;
  email: boolean;
};

export type AuthorizeAction = {
  type: AuthorizeActionType;
  time: number;
};

export type config = {
  localeIdentifier: 'en' | 'ar';
  flippingStatus: TapCheckoutFlipStatus;
  sandboxKey: string;
  productionKey: string;
  allowedCardNetworks: AllowedCardNetworks[];
  merchantId: string;
  merchantCapabilities: MerchantCapabilities;
  currency: TapCurrencyCode;
  supportedCurrencies?: String[];
  amount: number;
  items: ItemModel[];
  applePayMerchantId: String;
  swipeDownToDismiss: boolean;
  paymentType: TapPaymentType;
  closeButtonStyle: CheckoutCloseButtonEnum;
  showDragHandler: boolean;
  transactionMode: TransactionMode;
  customer: TapCustomer;
  destinations?: [Destination];
  tapMerchantID?: string;
  taxes?: [Tax];
  shipping?: Shipping;
  allowedCardTypes: { cardType: CardType }[];
  postURL?: string;
  paymentDescription?: string;
  paymentMetadata: Object;
  paymentReference?: Reference;
  paymentStatementDescriptor?: string;
  require3DSecure: boolean;
  receiptSettings?: Receipt;
  authorizeAction: AuthorizeAction;
  allowsToSaveSameCardMoreThanOnce: boolean;
  enableSaveCard: boolean;
  isSaveCardSwitchOnByDefault: boolean;
  sdkMode: SdkMode;
  enableApiLogging: number[];
  collectCreditCardName: boolean;
  creditCardNameEditable: boolean;
  creditCardNamePreload: string;
  showSaveCreditCard: SaveCardType;
  isSubscription: boolean;
  recurringPaymentRequest?: Object;
  applePayButtonType: TapApplePayButtonType;
  applePayButtonStyle: TapApplePayButtonStyleOutline;
  shouldFlipCardData: boolean;
};
