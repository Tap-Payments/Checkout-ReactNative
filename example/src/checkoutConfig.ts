/**
 * Every option the Tap Checkout SDK accepts, the values it allows, and the
 * form model the example uses to let you pick them.
 *
 * Option lists come from Tap's Web Checkout demo
 * (https://demo.tap.company/v2/sdk/checkout) and the `@tap-payments/checkout-v2`
 * package it is built on. `buildConfiguration()` assembles the SDK object the
 * same way the demo does. The React Native wrapper passes it to the native SDKs
 * unchanged, except that on Android it forces `checkoutMode: 'page'`,
 * `open: true` and `isApplePayAvailableOnClient: false`.
 */
import { COUNTRY_CODES } from './countries';

// ---------------------------------------------------------------------------
// Allowed values (as the demo lists them)
// ---------------------------------------------------------------------------

export const LANGUAGES = ['auto', 'en', 'ar'] as const;
export const THEMES = [
  'light',
  'dark',
  'light_mono',
  'dark_colored',
  'auto',
] as const;
export const CHECKOUT_MODES = ['popup', 'page'] as const;
export const PAYMENT_TYPES = ['ALL', 'WEB', 'CARD', 'DEVICE'] as const;
export const PAYMENT_METHODS = [
  'ALL',
  'AMERICAN_EXPRESS',
  'APPLE_PAY',
  'BENEFIT',
  'BENEFITPAY',
  'CAREEMPAY',
  'FAWRY',
  'GOOGLE_PAY',
  'KNET',
  'MADA',
  'MASTERCARD',
  'MEEZA',
  'OMANNET',
  'PAYPAL',
  'POST_PAY',
  'NAPS',
  'STC_PAY',
  'TABBY',
  'VISA',
] as const;
export const CURRENCIES = [
  'KWD',
  'BHD',
  'SAR',
  'AED',
  'OMR',
  'EGP',
  'GBP',
  'USD',
  'EUR',
] as const;
export const SUPPORTED_CURRENCIES = ['ALL', 'AUTO', ...CURRENCIES] as const;
export const REGIONS = ['LOCAL', 'REGIONAL', 'GLOBAL'] as const;
export const SUPPORTED_PAYMENT_TYPES = [
  'CARD',
  'DEVICE_WALLET',
  'EXPRESS_CHECKOUT_WALLET',
  'PASS_THRU_WALLET',
  'STORED_VALUE_WALLET',
  'CASH_WALLET',
  'BNPL',
] as const;
export const SCHEMES = [
  'BENEFIT',
  'VISA',
  'AMEX',
  'MASTERCARD',
  'MADA',
  'MEEZA',
  'OMANNET',
] as const;
export const TRANSACTION_MODES = ['charge', 'authorize'] as const;
export const AUTHORIZE_TYPES = ['CAPTURE', 'VOID'] as const;
export const AGREEMENT_TYPES = ['SCHEDULED', 'UNSCHEDULED'] as const;
export const AMOUNT_VARIABILITIES = ['FIXED', 'VARIABLE'] as const;
export const NUMBER_OF_PAYMENTS = ['Undefined', 'Defined'] as const;
export const CARD_FUNDING_SOURCES = ['all', 'credit', 'debit'] as const;
export const SAVE_CARD_OPTIONS = ['all', 'merchant', 'tap', 'none'] as const;
export const DISCOUNT_TYPES = ['none', 'F', 'P'] as const;
export { COUNTRY_CODES };

export type Language = (typeof LANGUAGES)[number];
export type Theme = (typeof THEMES)[number];
export type CheckoutMode = (typeof CHECKOUT_MODES)[number];
export type PaymentType = (typeof PAYMENT_TYPES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type Currency = (typeof CURRENCIES)[number];
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
export type Region = (typeof REGIONS)[number];
export type CountryCode = (typeof COUNTRY_CODES)[number];
export type SupportedPaymentType = (typeof SUPPORTED_PAYMENT_TYPES)[number];
export type Scheme = (typeof SCHEMES)[number];
export type TransactionMode = (typeof TRANSACTION_MODES)[number];
export type AuthorizeType = (typeof AUTHORIZE_TYPES)[number];
export type AgreementType = (typeof AGREEMENT_TYPES)[number];
export type AmountVariability = (typeof AMOUNT_VARIABILITIES)[number];
export type NumberOfPayments = (typeof NUMBER_OF_PAYMENTS)[number];
export type CardFundingSource = (typeof CARD_FUNDING_SOURCES)[number];
export type SaveCardOption = (typeof SAVE_CARD_OPTIONS)[number];
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

// ---------------------------------------------------------------------------
// What the SDK receives
// ---------------------------------------------------------------------------

export type OrderItem = {
  amount: number;
  currency: Currency;
  name: string;
  quantity: number;
  description?: string;
};

export type TransactionOptions = {
  saveCard: boolean;
  /** authorize only: what happens automatically after `time` hours. */
  auto: { type: AuthorizeType; time: number };
  /** Where the customer returns after a redirect-based payment. */
  redirect: { url: string };
  threeDSecure: boolean;
  agreement?: { type: AgreementType; amount_variability?: AmountVariability };
  subscription?: {
    type: AgreementType;
    amount_variability: AmountVariability;
    txn_count: number;
  };
  airline?: { reference: { booking: string } };
  applePayRecurringPaymentRequest?: {
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
};

export type CheckoutConfiguration = {
  hashString?: string;
  language?: Exclude<Language, 'auto'>;
  themeMode?: Exclude<Theme, 'auto'>;
  checkoutMode: CheckoutMode;
  paymentType: PaymentType;
  supportedPaymentMethods: 'ALL' | PaymentMethod[];
  selectedCurrency: Currency;
  supportedCurrencies: 'ALL' | 'AUTO' | Currency[];
  supportedRegions?: Region[];
  supportedCountries?: CountryCode[];
  supportedPaymentTypes?: SupportedPaymentType[];
  supportedSchemes?: Scheme[];
  gateway: { publicKey: string; merchantId?: string };
  customer: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: { countryCode: string; number: string };
  };
  transaction: { mode: TransactionMode } & Partial<
    Record<TransactionMode, TransactionOptions>
  >;
  amount: number;
  order: {
    id: string;
    currency: Currency;
    amount: number;
    items: OrderItem[];
    discount?: { type: 'F' | 'P'; value: number };
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
    alternativeCardInputs: { cardScanner: boolean; cardNFC: boolean };
  };
  /** iOS only; the Android wrapper sets it to false. */
  isApplePayAvailableOnClient: boolean;
};

// ---------------------------------------------------------------------------
// Form model — one field per control in the demo, grouped by its five steps
// ---------------------------------------------------------------------------

export type FormItem = {
  name: string;
  description: string;
  quantity: string;
  amount: string;
};

export type FormState = {
  // Step 1 — gateway & acceptance
  publicKey: string;
  merchantId: string;
  supportedCurrencies: SupportedCurrency[];
  paymentType: PaymentType;
  supportedPaymentMethods: PaymentMethod[];
  selectedCurrency: Currency;
  language: Language;
  supportedRegions: Region[];
  supportedCountries: CountryCode[];
  supportedPaymentTypes: SupportedPaymentType[];
  supportedSchemes: Scheme[];
  // Step 2 — customer
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  // Step 3 — card options
  showBrands: boolean;
  showLoadingState: boolean;
  collectHolderName: boolean;
  preLoadCardName: string;
  cardNameEditable: boolean;
  cardFundingSource: CardFundingSource;
  saveCardOption: SaveCardOption;
  forceLtr: boolean;
  cardScanner: boolean;
  cardNFC: boolean;
  // Step 4 — order
  orderId: string;
  discountType: DiscountType;
  discountValue: string;
  items: FormItem[];
  // Step 5 — transaction
  transactionMode: TransactionMode;
  theme: Theme;
  checkoutMode: CheckoutMode;
  threeDSecure: boolean;
  hashString: string;
  authorizeType: AuthorizeType;
  autoTimeHours: string;
  saveCard: boolean;
  redirectUrl: string;
  agreedPayment: boolean;
  agreementType: AgreementType;
  amountVariability: AmountVariability;
  numberOfPayments: NumberOfPayments;
  txnCount: string;
  applePayPaymentDescription: string;
  applePayBillingLabel: string;
  applePayBillingAgreement: string;
  applePayManagementUrl: string;
  applePayTokenNotificationUrl: string;
  airline: boolean;
  airlineBookingReference: string;
  isApplePayAvailableOnClient: boolean;
};

export const defaultForm: FormState = {
  publicKey: 'pk_test_ohzQrUWRnTkCLD1cqMeudyjX',
  merchantId: '',
  supportedCurrencies: ['ALL'],
  paymentType: 'ALL',
  supportedPaymentMethods: ['ALL'],
  selectedCurrency: 'KWD',
  language: 'en',
  supportedRegions: [],
  supportedCountries: [],
  supportedPaymentTypes: [],
  supportedSchemes: [],

  customerId: '',
  firstName: 'Ahmed',
  lastName: 'Sharkawy',
  email: 'example@gmail.com',
  countryCode: '20',
  phoneNumber: '1099137773',

  showBrands: true,
  showLoadingState: false,
  collectHolderName: true,
  preLoadCardName: '',
  cardNameEditable: true,
  cardFundingSource: 'all',
  saveCardOption: 'all',
  forceLtr: false,
  cardScanner: true,
  cardNFC: true,

  orderId: '',
  discountType: 'none',
  discountValue: '0',
  items: [
    {
      name: 'Item Title 1',
      description: 'item description 1',
      quantity: '1',
      amount: '5',
    },
  ],

  transactionMode: 'charge',
  theme: 'light',
  checkoutMode: 'page',
  threeDSecure: true,
  hashString: '',
  authorizeType: 'VOID',
  autoTimeHours: '100',
  saveCard: true,
  redirectUrl: 'https://demo.tap.company/v2/sdk/checkout',
  agreedPayment: false,
  agreementType: 'SCHEDULED',
  amountVariability: 'FIXED',
  numberOfPayments: 'Undefined',
  txnCount: '1',
  applePayPaymentDescription:
    'A description of the recurring payment to display to the user in the payment sheet.',
  applePayBillingLabel: 'Recurring',
  applePayBillingAgreement:
    'A localized billing agreement displayed to the user in the payment sheet prior to the payment authorization.',
  applePayManagementUrl: 'https://demo.tap.company',
  applePayTokenNotificationUrl: 'https://demo.tap.company',
  airline: false,
  airlineBookingReference: '',
  isApplePayAvailableOnClient: true,
};

// ---------------------------------------------------------------------------
// Form → SDK configuration (mirrors the demo's logic)
// ---------------------------------------------------------------------------

const num = (s: string, fallback = 0) => {
  const n = Number(s);
  return Number.isFinite(n) ? n : fallback;
};
const listOrUndefined = <T>(list: T[]) => (list.length ? list : undefined);
const emptyToUndefined = (s: string) =>
  s.trim().length ? s.trim() : undefined;

export const orderTotal = (items: FormItem[]) =>
  Math.round(
    items.reduce((sum, i) => sum + num(i.amount) * num(i.quantity, 1), 0) * 1000
  ) / 1000;

export function buildConfiguration(f: FormState): CheckoutConfiguration {
  const total = orderTotal(f.items);
  const discountValue = num(f.discountValue);

  const agreement = f.agreedPayment
    ? f.agreementType === 'UNSCHEDULED'
      ? { type: 'UNSCHEDULED' as const }
      : { type: f.agreementType, amount_variability: f.amountVariability }
    : undefined;

  const subscription =
    f.agreedPayment && f.agreementType !== 'UNSCHEDULED'
      ? {
          type: f.agreementType,
          amount_variability: f.amountVariability,
          txn_count: f.numberOfPayments === 'Undefined' ? 0 : num(f.txnCount),
        }
      : undefined;

  const transactionOptions: TransactionOptions = {
    saveCard: f.saveCard,
    auto: { type: f.authorizeType, time: num(f.autoTimeHours, 100) },
    redirect: { url: f.redirectUrl },
    threeDSecure: f.threeDSecure,
    agreement,
    subscription,
    airline: f.airline
      ? { reference: { booking: f.airlineBookingReference } }
      : undefined,
    applePayRecurringPaymentRequest: f.agreedPayment
      ? {
          paymentDescription: f.applePayPaymentDescription,
          regularBilling: {
            label: f.applePayBillingLabel,
            paymentTiming: 'recurring',
            recurringPaymentStartDate: new Date().toISOString(),
          },
          billingAgreement: f.applePayBillingAgreement,
          managementURL: f.applePayManagementUrl,
          tokenNotificationURL: f.applePayTokenNotificationUrl,
        }
      : undefined,
  };

  return {
    hashString: emptyToUndefined(f.hashString),
    language: f.language === 'auto' ? undefined : f.language,
    themeMode: f.theme === 'auto' ? undefined : f.theme,
    checkoutMode: f.checkoutMode,
    paymentType: f.paymentType,
    supportedPaymentMethods: f.supportedPaymentMethods.includes('ALL')
      ? 'ALL'
      : f.supportedPaymentMethods,
    selectedCurrency: f.selectedCurrency,
    supportedCurrencies: f.supportedCurrencies.includes('ALL')
      ? 'ALL'
      : f.supportedCurrencies.includes('AUTO')
        ? 'AUTO'
        : (f.supportedCurrencies as Currency[]),
    supportedRegions: listOrUndefined(f.supportedRegions),
    supportedCountries: listOrUndefined(f.supportedCountries),
    supportedPaymentTypes: listOrUndefined(f.supportedPaymentTypes),
    supportedSchemes: listOrUndefined(f.supportedSchemes),
    gateway: {
      publicKey: f.publicKey.trim(),
      merchantId: emptyToUndefined(f.merchantId),
    },
    customer: {
      id: emptyToUndefined(f.customerId),
      firstName: f.firstName,
      lastName: f.lastName,
      email: f.email,
      phone: { countryCode: f.countryCode, number: f.phoneNumber },
    },
    transaction: {
      mode: f.transactionMode,
      [f.transactionMode]: transactionOptions,
    },
    amount: total,
    order: {
      id: f.orderId,
      currency: f.selectedCurrency,
      amount: total,
      items: f.items.map((i) => ({
        name: i.name,
        description: i.description,
        quantity: num(i.quantity, 1),
        amount: num(i.amount),
        currency: f.selectedCurrency,
      })),
      discount:
        f.discountType !== 'none' && discountValue > 0
          ? { type: f.discountType, value: discountValue }
          : undefined,
    },
    cardOptions: {
      showBrands: f.showBrands,
      showLoadingState: f.showLoadingState,
      collectHolderName: f.collectHolderName,
      preLoadCardName: f.preLoadCardName,
      cardNameEditable: f.cardNameEditable,
      cardFundingSource: f.cardFundingSource,
      saveCardOption: f.saveCardOption,
      forceLtr: f.forceLtr,
      alternativeCardInputs: { cardScanner: f.cardScanner, cardNFC: f.cardNFC },
    },
    isApplePayAvailableOnClient: f.isApplePayAvailableOnClient,
  };
}
