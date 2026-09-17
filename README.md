# checkout-react-native

React Native wrapper for the [Tap Payments](https://www.tap.company) Checkout SDK.
It presents Tap's hosted checkout sheet natively on iOS (`Checkout-IOS`) and
Android (`Checkout-Android`) from a single JavaScript call, and reports the result
through callbacks.

- One function: `startCheckout(configuration, callbacks)`
- TurboModule — requires the New Architecture (the default since React Native 0.76)
- Same configuration object as Tap's web checkout — see the
  [configuration reference](#configuration)

## Installation

```sh
npm install checkout-react-native
# or
yarn add checkout-react-native
```

### iOS

```sh
cd ios && bundle exec pod install
```

The pod depends on `Checkout-IOS`, whose resource bundles declare deployment
targets below what current Xcode accepts. If your build fails with
*"deployment target is set to 12.0/13.0"*, raise them in your `Podfile`:

```ruby
post_install do |installer|
  react_native_post_install(installer, config[:reactNativePath])

  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      current = config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
      if current && Gem::Version.new(current) < Gem::Version.new(min_ios_version_supported)
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = min_ios_version_supported
      end
    end
  end
end
```

Apple Pay needs the *Apple Pay* capability and a merchant identifier in your
app target; `isApplePayAvailableOnClient` tells the SDK whether the device can
offer it.

### Android

The library is autolinked. Two things to know:

- It pulls `com.github.Tap-Payments:Checkout-Android` from JitPack; make sure
  `maven { url 'https://jitpack.io' }` is reachable from your build (the library
  declares it, but corporate proxies sometimes block it).
- The Tap SDK's manifest sets `android:usesCleartextTraffic="true"`. If your
  app manifest sets that attribute too, add `tools:replace="android:usesCleartextTraffic"`
  on `<application>` or the release manifest merge fails.

## Usage

```tsx
import { startCheckout } from 'checkout-react-native';
import type { CheckoutCallbacks } from 'checkout-react-native';

const callbacks: CheckoutCallbacks = {
  onReady: () => console.log('checkout sheet is visible'),
  onSuccess: (data) => console.log('paid', data), // JSON string with the charge
  onError: (error) => console.log('failed', error),
  onClose: () => console.log('sheet closed'),
};

startCheckout(
  {
    language: 'en',
    themeMode: 'light',
    paymentType: 'ALL',
    supportedPaymentMethods: 'ALL',
    selectedCurrency: 'KWD',
    supportedCurrencies: 'ALL',
    gateway: { publicKey: 'pk_test_…', merchantId: '' },
    customer: {
      firstName: 'Ahmed',
      lastName: 'Sharkawy',
      email: 'ahmed@example.com',
      phone: { countryCode: '965', number: '55567890' },
    },
    transaction: {
      mode: 'charge',
      charge: {
        saveCard: false,
        auto: { type: 'VOID', time: 100 },
        redirect: { url: 'https://your-app.example/return' },
        threeDSecure: true,
      },
    },
    amount: 5,
    order: {
      id: '',
      currency: 'KWD',
      amount: 5,
      items: [{ name: 'Item', quantity: 1, amount: 5, currency: 'KWD' }],
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
  },
  callbacks
);
```

### API

```ts
startCheckout(configuration: Record<string, any>, callbacks: CheckoutCallbacks): void

interface CheckoutCallbacks {
  onReady: () => void;              // the sheet is rendered and interactive
  onSuccess: (data: string) => void; // payment completed; `data` is the charge as a JSON string
  onError: (error: string) => void;  // SDK or payment error
  onClose: () => void;              // the customer dismissed the sheet
}
```

`startCheckout` returns immediately; everything happens through the callbacks.
The sheet takes a few seconds to appear after the call because the SDK loads
Tap's hosted checkout page — show your own loading state until `onReady`
(on iOS nothing is drawn before that). See the
[example app](example/README.md#notes-and-troubleshooting) for what's involved.

The wrapper passes the configuration through unchanged, with two Android
adjustments: `checkoutMode` is always `'page'` and
`isApplePayAvailableOnClient` is always `false`.

## Configuration

The configuration object follows Tap's Checkout SDK format. Every option and
the values it accepts:

| Key | Values | Notes |
|---|---|---|
| `hashString` | string | Optional request hash generated server-side with your secret key |
| `language` | `en` · `ar` | Omit to follow the device language |
| `themeMode` | `light` · `dark` · `light_mono` · `dark_colored` | Omit to follow the device appearance |
| `checkoutMode` | `popup` · `page` | Web only; the Android wrapper always uses `page` |
| `paymentType` | `ALL` · `WEB` · `CARD` · `DEVICE` | |
| `supportedPaymentMethods` | `ALL` or a list of `AMERICAN_EXPRESS` `APPLE_PAY` `BENEFIT` `BENEFITPAY` `CAREEMPAY` `FAWRY` `GOOGLE_PAY` `KNET` `MADA` `MASTERCARD` `MEEZA` `OMANNET` `PAYPAL` `POST_PAY` `NAPS` `STC_PAY` `TABBY` `VISA` | |
| `selectedCurrency` | `KWD` `BHD` `SAR` `AED` `OMR` `EGP` `GBP` `USD` `EUR` | Currency the customer pays in |
| `supportedCurrencies` | `ALL` · `AUTO` · list of currencies | `AUTO` derives the list from the merchant account |
| `supportedRegions` | list of `LOCAL` `REGIONAL` `GLOBAL` | Omit for no restriction |
| `supportedCountries` | list of ISO 3166-1 alpha-2 codes (`KW`, `SA`, `AE`, `BH`, …) | Omit for no restriction |
| `supportedPaymentTypes` | list of `CARD` `DEVICE_WALLET` `EXPRESS_CHECKOUT_WALLET` `PASS_THRU_WALLET` `STORED_VALUE_WALLET` `CASH_WALLET` `BNPL` | Omit for no restriction |
| `supportedSchemes` | list of `BENEFIT` `VISA` `AMEX` `MASTERCARD` `MADA` `MEEZA` `OMANNET` | Omit for no restriction |
| `gateway.publicKey` | string | Required. Test (`pk_test_…`) or live (`pk_live_…`) key |
| `gateway.merchantId` | string | |
| `customer.id` | string | Existing Tap customer (`cus_…`); makes the other customer fields optional |
| `customer.firstName` / `lastName` / `email` | string | |
| `customer.phone` | `{ countryCode, number }` | e.g. `{ countryCode: '965', number: '55567890' }` |
| `transaction.mode` | `charge` · `authorize` | |
| `transaction.charge` / `transaction.authorize` | object | Options for the selected mode; same shape for both: |
| &nbsp;&nbsp;`saveCard` | boolean | |
| &nbsp;&nbsp;`auto` | `{ type: 'CAPTURE' \| 'VOID', time }` | authorize only — what happens automatically after `time` hours |
| &nbsp;&nbsp;`redirect.url` | URL | Return URL for redirect-based methods |
| &nbsp;&nbsp;`threeDSecure` | boolean | |
| &nbsp;&nbsp;`agreement` | `{ type: 'SCHEDULED' \| 'UNSCHEDULED', amount_variability?: 'FIXED' \| 'VARIABLE' }` | Recurring-payment agreement |
| &nbsp;&nbsp;`subscription` | `{ type, amount_variability, txn_count }` | `txn_count: 0` when the number of payments is undefined |
| &nbsp;&nbsp;`airline.reference.booking` | string | |
| &nbsp;&nbsp;`applePayRecurringPaymentRequest` | object | Apple Pay recurring sheet: `paymentDescription`, `regularBilling { label, paymentTiming: 'recurring', recurringPaymentStartDate }`, `billingAgreement`, `managementURL`, `tokenNotificationURL` |
| `amount` | number | Total |
| `order.id` | string | |
| `order.currency` / `order.amount` | | Match `selectedCurrency` / `amount` |
| `order.items[]` | `{ amount, currency, name, quantity, description? }` | At least one item |
| `order.discount` | `{ type: 'F' \| 'P', value }` | `F` fixed amount, `P` percentage |
| `cardOptions.showBrands` | boolean | Show the accepted-scheme logos |
| `cardOptions.showLoadingState` | boolean | |
| `cardOptions.collectHolderName` | boolean | |
| `cardOptions.preLoadCardName` | string | Pre-filled holder name |
| `cardOptions.cardNameEditable` | boolean | |
| `cardOptions.cardFundingSource` | `all` · `credit` · `debit` | |
| `cardOptions.saveCardOption` | `all` · `merchant` · `tap` · `none` | Who may offer to save the card |
| `cardOptions.forceLtr` | boolean | Keep the card field left-to-right in Arabic |
| `cardOptions.alternativeCardInputs` | `{ cardScanner, cardNFC }` | |
| `isApplePayAvailableOnClient` | boolean | iOS only; the Android wrapper sets it to `false` |

A typed version of this table — `CheckoutConfiguration` with every allowed value
as a union — lives in the example at
[`example/src/checkoutConfig.ts`](example/src/checkoutConfig.ts); copy it into
your app if you want the compiler to check your configuration.

## Example app

[`example/`](example/README.md) is a React Native 0.87 app with a form for every
option above, a **Start Checkout** button
that sends what you picked, and an event log with the time of each SDK callback.
Run it from the repository root:

```sh
yarn
yarn example start
yarn example android   # or: yarn example ios
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
