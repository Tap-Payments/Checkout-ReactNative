/**
 * Every option the Tap Checkout SDK accepts, with the values it allows.
 *
 * Extracted from Tap's Web Checkout demo (https://demo.tap.company/v2/sdk/checkout)
 * and the `@tap-payments/checkout-v2` package it is built on. The React Native
 * wrapper passes this object to the native SDKs unchanged, except that on
 * Android it forces `checkoutMode: 'page'`, `open: true` and
 * `isApplePayAvailableOnClient: false`.
 */

// ---------------------------------------------------------------------------
// Allowed values
// ---------------------------------------------------------------------------

export type Language = 'en' | 'ar';

/** Omit `themeMode` to follow the device appearance ("auto" in the demo). */
export type ThemeMode = 'light' | 'dark' | 'light_mono' | 'dark_colored';

/** Web-only. The Android wrapper always uses 'page'. */
export type CheckoutMode = 'popup' | 'page';

export type PaymentType = 'ALL' | 'WEB' | 'CARD' | 'DEVICE';

export type PaymentMethod =
  | 'AMERICAN_EXPRESS'
  | 'APPLE_PAY'
  | 'BENEFIT'
  | 'BENEFITPAY'
  | 'CAREEMPAY'
  | 'FAWRY'
  | 'GOOGLE_PAY'
  | 'KNET'
  | 'MADA'
  | 'MASTERCARD'
  | 'MEEZA'
  | 'OMANNET'
  | 'PAYPAL'
  | 'POST_PAY'
  | 'NAPS'
  | 'STC_PAY'
  | 'TABBY'
  | 'VISA';

export type Currency =
  | 'KWD'
  | 'BHD'
  | 'SAR'
  | 'AED'
  | 'OMR'
  | 'QAR'
  | 'EGP'
  | 'GBP'
  | 'USD'
  | 'EUR';

export type SupportedRegion = 'LOCAL' | 'REGIONAL' | 'GLOBAL';

/** ISO 3166-1 alpha-2 country code, e.g. 'KW', 'SA', 'AE', 'BH', 'EG', 'OM', 'QA'. */
export type CountryCode = string;

export type SupportedPaymentType =
  | 'CARD'
  | 'DEVICE_WALLET'
  | 'EXPRESS_CHECKOUT_WALLET'
  | 'PASS_THRU_WALLET'
  | 'STORED_VALUE_WALLET'
  | 'CASH_WALLET'
  | 'BNPL';

export type CardScheme =
  | 'BENEFIT'
  | 'VISA'
  | 'AMEX'
  | 'MASTERCARD'
  | 'MADA'
  | 'MEEZA'
  | 'OMANNET';

export type TransactionMode = 'charge' | 'authorize';

/** What to do automatically after an authorize: capture it or void it. */
export type AutoType = 'CAPTURE' | 'VOID';

export type AgreementType = 'SCHEDULED' | 'UNSCHEDULED';
export type AmountVariability = 'FIXED' | 'VARIABLE';

export type CardFundingSource = 'all' | 'credit' | 'debit';

/** Who may offer to save the card: everyone, the merchant only, Tap only, or nobody. */
export type SaveCardOption = 'all' | 'merchant' | 'tap' | 'none';

/** 'F' = fixed amount, 'P' = percentage. */
export type DiscountType = 'F' | 'P';

// ---------------------------------------------------------------------------
// Shape
// ---------------------------------------------------------------------------

export type OrderItem = {
  amount: number | string;
  currency: Currency;
  name: string;
  quantity: number;
  description?: string;
};

export type Agreement = {
  type: AgreementType;
  /** Only meaningful for SCHEDULED agreements. */
  amount_variability?: AmountVariability;
};

export type Subscription = {
  type: AgreementType;
  amount_variability: AmountVariability;
  /** Number of payments; 0 when the count is undefined. */
  txn_count: number;
};

export type ApplePayRecurringPaymentRequest = {
  paymentDescription: string;
  regularBilling: {
    label: string;
    paymentTiming: 'recurring';
    recurringPaymentStartDate: string;
  };
  billingAgreement: string;
  managementURL: string;
  tokenNotificationURL: string;
};

/** Settings for the chosen transaction mode (the same shape for charge and authorize). */
export type TransactionOptions = {
  saveCard?: boolean;
  /** authorize only: what to do automatically and after how many hours. */
  auto?: { type: AutoType; time: number };
  /** Where the customer is sent after a redirect-based payment. */
  redirect?: { url: string };
  threeDSecure?: boolean;
  agreement?: Agreement;
  subscription?: Subscription;
  airline?: { reference: { booking: string } };
  applePayRecurringPaymentRequest?: ApplePayRecurringPaymentRequest;
};

export type CheckoutConfiguration = {
  /** Optional integrity hash of the request, generated server-side with your secret key. */
  hashString?: string;
  /** Omit to follow the device language. */
  language?: Language;
  /** Omit to follow the device appearance. */
  themeMode?: ThemeMode;
  checkoutMode?: CheckoutMode;
  paymentType: PaymentType;
  supportedPaymentMethods: 'ALL' | PaymentMethod[];
  selectedCurrency: Currency;
  /** 'ALL', 'AUTO' (derive from the merchant), or an explicit list. */
  supportedCurrencies: 'ALL' | 'AUTO' | Currency[];
  supportedRegions?: SupportedRegion[];
  supportedCountries?: CountryCode[];
  supportedPaymentTypes?: SupportedPaymentType[];
  supportedSchemes?: CardScheme[];
  gateway: {
    publicKey: string;
    merchantId?: string;
  };
  customer: {
    /** Existing Tap customer id; when set, the other fields become optional. */
    id?: string;
    firstName: string;
    lastName?: string;
    email?: string;
    phone?: { countryCode: string; number: string };
  };
  transaction: {
    mode: TransactionMode;
    charge?: TransactionOptions;
    authorize?: TransactionOptions;
  };
  amount: number | string;
  order: {
    id?: string;
    currency: Currency;
    amount: number | string;
    items: OrderItem[];
    discount?: { type: DiscountType; value: number };
  };
  cardOptions: {
    showBrands: boolean;
    showLoadingState: boolean;
    collectHolderName: boolean;
    preLoadCardName: string;
    cardNameEditable: boolean;
    cardFundingSource: CardFundingSource;
    saveCardOption: SaveCardOption;
    forceLtr: boolean;
    alternativeCardInputs?: { cardScanner: boolean; cardNFC: boolean };
  };
  /** iOS only; the Android wrapper sets it to false. */
  isApplePayAvailableOnClient?: boolean;
};

// ---------------------------------------------------------------------------
// The configuration this example sends
// ---------------------------------------------------------------------------

export const TAP_PUBLIC_KEY = 'pk_test_ohzQrUWRnTkCLD1cqMeudyjX';
export const TAP_MERCHANT_ID = '';

const CURRENCY: Currency = 'KWD';
const AMOUNT = '5';

export const checkoutConfiguration: CheckoutConfiguration = {
  hashString: '',
  language: 'en',
  themeMode: 'light',
  checkoutMode: 'page',

  // Which payment options to offer. 'ALL' lets the merchant account decide;
  // narrow any of these to restrict the list, e.g.
  //   paymentType: 'CARD', supportedPaymentMethods: ['VISA', 'MASTERCARD', 'MADA']
  paymentType: 'ALL',
  supportedPaymentMethods: 'ALL',
  selectedCurrency: CURRENCY,
  supportedCurrencies: 'ALL',
  supportedRegions: [],
  supportedCountries: [],
  supportedPaymentTypes: [],
  supportedSchemes: [],

  gateway: {
    publicKey: TAP_PUBLIC_KEY,
    merchantId: TAP_MERCHANT_ID,
  },

  customer: {
    firstName: 'Android',
    lastName: 'Test',
    email: 'example@gmail.com',
    phone: { countryCode: '965', number: '55567890' },
  },

  // Use `mode: 'authorize'` with an `authorize` block of the same shape to
  // authorize now and capture (or void) later.
  transaction: {
    mode: 'charge',
    charge: {
      saveCard: true,
      auto: { type: 'VOID', time: 100 },
      redirect: { url: 'https://demo.tap.company/v2/sdk/checkout' },
      threeDSecure: true,
      // Recurring / subscription payments. Remove both for a one-off payment.
      subscription: {
        type: 'SCHEDULED',
        amount_variability: 'FIXED',
        txn_count: 0,
      },
      airline: {
        reference: { booking: '' },
      },
    },
  },

  amount: AMOUNT,
  order: {
    id: '',
    currency: CURRENCY,
    amount: AMOUNT,
    items: [
      {
        amount: AMOUNT,
        currency: CURRENCY,
        name: 'Item Title 1',
        quantity: 1,
        description: 'item description 1',
      },
    ],
    // discount: { type: 'P', value: 10 },
  },

  cardOptions: {
    showBrands: true,
    showLoadingState: false,
    collectHolderName: true,
    preLoadCardName: '',
    cardNameEditable: true,
    cardFundingSource: 'all',
    saveCardOption: 'all',
    forceLtr: false,
    alternativeCardInputs: { cardScanner: true, cardNFC: true },
  },

  isApplePayAvailableOnClient: true,
};
