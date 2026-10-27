/**
 * Checks, without a network or the checkout sheet, that the configuration the example app sends
 * matches the defaults documented in README.md (which are the Tap web demo's) and the mapping rules
 * of the configuration reference. Same checks as CheckoutSettingsTests.swift (iOS) and
 * CheckoutSettingsTest.kt (Android).
 *
 * Run: yarn test
 */

import {
  PLACEHOLDER_PUBLIC_KEY,
  defaultItem,
  defaultSettings,
  hasPublicKey,
  loadSettings,
  makeConfiguration,
  memoryStorage,
  resetSettings,
  saveSettings,
  type CheckoutSettings,
  type Configuration,
} from '../CheckoutSettings';
import { merge } from '../UITestHooks';

function config(
  change: (settings: CheckoutSettings) => void = () => {}
): Configuration {
  const settings = defaultSettings();
  settings.publicKey = 'pk_test_x';
  change(settings);
  return makeConfiguration(settings);
}

const charge = (configuration: Configuration) =>
  configuration.transaction.charge;

it('defaults match the README', () => {
  const c = config();
  expect(c.open).toBe(true);
  expect(c.hashString).toBe('');
  expect(c.checkoutMode).toBe('popup');
  expect(c.language).toBe('en');
  expect(c.themeMode).toBe('light');
  expect(c.paymentType).toBe('ALL');
  expect(c.supportedPaymentMethods).toBe('ALL');
  expect(c.selectedCurrency).toBe('SAR');
  expect(c.supportedCurrencies).toBe('ALL');
  expect(c.isApplePayAvailableOnClient).toBe(true);
  expect(c.amount).toBe(0.1);
  expect(c.gateway).toEqual({ publicKey: 'pk_test_x' });
  for (const key of [
    'supportedRegions',
    'supportedCountries',
    'supportedPaymentTypes',
    'supportedSchemes',
  ]) {
    expect(c).not.toHaveProperty(key);
  }
});

it('customer defaults', () => {
  expect(config().customer).toEqual({
    firstName: 'Ahmed',
    lastName: 'Sharkawy',
    email: 'example@gmail.com',
    phone: { countryCode: '20', number: '1099137773' },
  });
  expect(config((s) => (s.customerId = 'cus_1')).customer.id).toBe('cus_1');
});

it('card option defaults', () => {
  expect(config().cardOptions).toEqual({
    showBrands: true,
    showLoadingState: false,
    collectHolderName: true,
    preLoadCardName: '',
    cardNameEditable: true,
    cardFundingSource: 'all',
    saveCardOption: 'all',
    forceLtr: false,
  });
  expect(
    config((s) => (s.cardScanner = true)).cardOptions.alternativeCardInputs
  ).toEqual({ cardScanner: true });
  expect(
    config((s) => (s.cardNFC = true)).cardOptions.alternativeCardInputs
  ).toEqual({ cardNFC: true });
});

it('order defaults', () => {
  const order = config().order;
  expect(order.id).toBe('');
  expect(order.currency).toBe('SAR');
  expect(order.amount).toBe(0.1);
  expect(order.items).toEqual([
    {
      amount: 0.1,
      currency: 'SAR',
      name: 'Item Title 1',
      quantity: 1,
      description: 'item description 1',
    },
  ]);
  expect(order).not.toHaveProperty('discount');
});

it('charge transaction defaults', () => {
  const transaction = config().transaction;
  expect(transaction.mode).toBe('charge');
  expect(transaction.charge).toEqual({
    saveCard: true,
    auto: { type: 'VOID', time: 100 },
    redirect: { url: 'https://demo.tap.company/v2/sdk/checkout' },
    threeDSecure: true,
    subscription: {
      type: 'SCHEDULED',
      amount_variability: 'FIXED',
      txn_count: 0,
    },
    airline: { reference: { booking: '' } },
  });
});

it('authorize uses an object named after the mode', () => {
  const transaction = config((s) => {
    s.mode = 'authorize';
    s.authorizeType = 'CAPTURE';
  }).transaction;
  expect(transaction.mode).toBe('authorize');
  expect(transaction).not.toHaveProperty('charge');
  expect(transaction.authorize.auto).toEqual({ type: 'CAPTURE', time: 100 });
});

it('discount and totals', () => {
  const second = { ...defaultItem(), name: 'Item Title 2', amount: 0.2 };
  const percent = config((s) => {
    s.items = [defaultItem(), second];
    s.discountType = 'P';
    s.discountValue = 10;
  });
  expect(percent.amount).toBe(0.27);
  expect(percent.order.discount).toEqual({ type: 'P', value: 10 });

  // A total of 0 or less becomes 1, like the web demo.
  const tooMuch = config((s) => {
    s.discountType = 'F';
    s.discountValue = 5;
  });
  expect(tooMuch.amount).toBe(1);

  const three = { ...defaultItem(), quantity: 3 };
  expect(config((s) => (s.items = [three])).amount).toBe(0.3);
});

it('auto and empty values are not sent', () => {
  const c = config((s) => {
    s.language = 'auto';
    s.theme = 'auto';
  });
  expect(c).not.toHaveProperty('language');
  expect(c).not.toHaveProperty('themeMode');
  expect(c.gateway).not.toHaveProperty('merchantId');
});

it('lists and collapsing', () => {
  expect(
    config((s) => (s.supportedCurrencies = ['AUTO', 'SAR'])).supportedCurrencies
  ).toBe('AUTO');
  expect(
    config((s) => (s.supportedCurrencies = ['SAR', 'ALL'])).supportedCurrencies
  ).toBe('ALL');
  expect(
    config((s) => (s.supportedCurrencies = ['SAR', 'KWD'])).supportedCurrencies
  ).toEqual(['SAR', 'KWD']);
  expect(
    config((s) => (s.supportedPaymentMethods = ['VISA']))
      .supportedPaymentMethods
  ).toEqual(['VISA']);
  expect(
    config((s) => (s.supportedCountries = ['SA'])).supportedCountries
  ).toEqual(['SA']);
});

it('agreement and subscription', () => {
  const unscheduled = charge(
    config((s) => {
      s.agreedPayment = true;
      s.agreementType = 'UNSCHEDULED';
    })
  );
  expect(unscheduled.agreement).toEqual({ type: 'UNSCHEDULED' });
  // No subscription when UNSCHEDULED.
  expect(unscheduled).not.toHaveProperty('subscription');
  expect(unscheduled.applePayRecurringPaymentRequest).toBeDefined();

  const defined = charge(
    config((s) => {
      s.agreedPayment = true;
      s.numberOfPayments = 'Defined';
      s.paymentCount = 4;
    })
  );
  expect(defined.agreement).toEqual({
    type: 'SCHEDULED',
    amount_variability: 'FIXED',
  });
  expect(defined.subscription.txn_count).toBe(4);
});

it('airline is sent unless no', () => {
  expect(charge(config((s) => (s.airline = 'no')))).not.toHaveProperty(
    'airline'
  );
  const yes = charge(
    config((s) => {
      s.airline = 'yes';
      s.bookingReference = 'ABC123';
    })
  );
  expect(yes.airline).toEqual({ reference: { booking: 'ABC123' } });
});

it('placeholder key is not a key', () => {
  const settings = defaultSettings();
  settings.publicKey = PLACEHOLDER_PUBLIC_KEY;
  expect(hasPublicKey(settings)).toBe(false);
  settings.publicKey = '  ';
  expect(hasPublicKey(settings)).toBe(false);
  settings.publicKey = 'pk_test_x';
  expect(hasPublicKey(settings)).toBe(true);
});

it('test overrides merge and remove', () => {
  const merged = merge(config(), {
    language: 'ar',
    cardOptions: { showBrands: false },
    hashString: null,
  });
  expect(merged.language).toBe('ar');
  expect(merged.cardOptions.showBrands).toBe(false);
  // Other card options are kept.
  expect(merged.cardOptions.saveCardOption).toBe('all');
  expect(merged).not.toHaveProperty('hashString');
});

it('settings survive save and load', () => {
  const storage = memoryStorage();
  const settings = defaultSettings();
  settings.mode = 'authorize';
  settings.items.push(defaultItem());
  saveSettings(settings, storage);
  const loaded = loadSettings(storage);
  expect(loaded.mode).toBe('authorize');
  expect(loaded.items).toHaveLength(2);
  resetSettings(storage);
  // Reset goes back to the defaults.
  expect(loadSettings(storage).mode).toBe('charge');
});
