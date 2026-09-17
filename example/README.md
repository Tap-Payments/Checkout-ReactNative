# checkout-react-native example

A minimal React Native app that exercises the `checkout-react-native` wrapper
around the Tap Checkout SDK. It has one screen: a **Start Checkout** button that
opens the Tap checkout sheet, plus an on-screen event log that records every
step and SDK callback with the time since the tap.

The example is a Yarn workspace of this repository and consumes the library
straight from `../src`, so changes to the wrapper show up without publishing.

| | Version |
|---|---|
| React Native | 0.87.1 (New Architecture only) |
| React | 19.2.3 |
| Android | Gradle 9.4.1 · AGP 9.2.1 · Kotlin 2.2.0 · compileSdk 37 / targetSdk 36 / minSdk 24 |
| iOS | deployment target 15.1 · CocoaPods via Bundler |
| Tap SDKs | `Checkout-Android` 1.0.6 · `Checkout-IOS` (via `CheckoutReactNative.podspec`) |

## Requirements

- Node **22.11 or newer** and Yarn 3 (bundled in `.yarn/releases`, no global install needed)
- **Android:** JDK 17+, Android SDK with platform 37 and build-tools 37.0.0, `ANDROID_HOME` set (or `android/local.properties` with `sdk.dir`)
- **iOS:** Xcode 16+ (tested with Xcode 27), Ruby 3.x, and CocoaPods installed through Bundler (`bundle install` in `example/`)

## Running

All commands are run from the **repository root**; `yarn example <script>`
proxies to this workspace.

```sh
yarn                     # install both workspaces
yarn example start       # Metro
yarn example android     # build + install the debug app on the running emulator/device
yarn example ios         # pod install (automatic) + build + run on a simulator
```

iOS-only, first time or after native deps change:

```sh
cd example && bundle install && bundle exec pod install
```

To run on a physical Android device with Metro, forward the packager port before
launching: `adb reverse tcp:8081 tcp:8081`.

### Release builds

Release builds embed the Hermes bundle, so they run without Metro. Both are
signed with the debug keystore — fine for testing on your own device, not for
distribution.

```sh
yarn example build:android   # android/app/build/outputs/apk/release/app-release.apk
yarn example build:ios       # Debug configuration for the simulator
```

## Configuration

Everything the SDK receives lives in [`src/checkoutConfig.ts`](src/checkoutConfig.ts):
a typed `CheckoutConfiguration` describing every option and the values it
accepts, and the `checkoutConfiguration` object the example actually sends.
The option list was taken from Tap's [Web Checkout demo](https://demo.tap.company/v2/sdk/checkout)
and the `@tap-payments/checkout-v2` package behind it; the wrapper forwards the
object to the native SDKs unchanged.

### Merchant

Replace the test values in `gateway`:

```ts
gateway: {
  publicKey: 'pk_test_…',   // Tap public key (test or live)
  merchantId: '',           // Tap merchant id
},
```

Tap validates the public key against the app identifier registered for the
merchant. If you use your own key, the app id must match what is registered:
`applicationId` in [`android/app/build.gradle`](android/app/build.gradle) and
`PRODUCT_BUNDLE_IDENTIFIER` in the Xcode project (both default to
`checkoutreactnative.example`).

### All options

| Key | Values | Notes |
|---|---|---|
| `hashString` | string | Optional request hash generated server-side with your secret key |
| `language` | `en` · `ar` | Omit to follow the device language |
| `themeMode` | `light` · `dark` · `light_mono` · `dark_colored` | Omit to follow the device appearance |
| `checkoutMode` | `popup` · `page` | Web only; the Android wrapper always uses `page` |
| `paymentType` | `ALL` · `WEB` · `CARD` · `DEVICE` | |
| `supportedPaymentMethods` | `ALL` or a list of `AMERICAN_EXPRESS` `APPLE_PAY` `BENEFIT` `BENEFITPAY` `CAREEMPAY` `FAWRY` `GOOGLE_PAY` `KNET` `MADA` `MASTERCARD` `MEEZA` `OMANNET` `PAYPAL` `POST_PAY` `NAPS` `STC_PAY` `TABBY` `VISA` | |
| `selectedCurrency` | `KWD` `BHD` `SAR` `AED` `OMR` `QAR` `EGP` `GBP` `USD` `EUR` | Currency the customer pays in |
| `supportedCurrencies` | `ALL` · `AUTO` · list of currencies | `AUTO` derives the list from the merchant account |
| `supportedRegions` | list of `LOCAL` `REGIONAL` `GLOBAL` | Empty = no restriction |
| `supportedCountries` | list of ISO 3166-1 alpha-2 codes (`KW`, `SA`, `AE`, `BH`, …) | Empty = no restriction |
| `supportedPaymentTypes` | list of `CARD` `DEVICE_WALLET` `EXPRESS_CHECKOUT_WALLET` `PASS_THRU_WALLET` `STORED_VALUE_WALLET` `CASH_WALLET` `BNPL` | Empty = no restriction |
| `supportedSchemes` | list of `BENEFIT` `VISA` `AMEX` `MASTERCARD` `MADA` `MEEZA` `OMANNET` | Empty = no restriction |
| `gateway.publicKey` | string | Required |
| `gateway.merchantId` | string | |
| `customer.id` | string | Existing Tap customer id; makes the other customer fields optional |
| `customer.firstName` / `lastName` / `email` | string | |
| `customer.phone` | `{ countryCode, number }` | e.g. `{ countryCode: '965', number: '55567890' }` |
| `transaction.mode` | `charge` · `authorize` | |
| `transaction.charge` / `transaction.authorize` | object | Options for the selected mode, same shape for both: |
| &nbsp;&nbsp;`saveCard` | boolean | |
| &nbsp;&nbsp;`auto` | `{ type: 'CAPTURE' \| 'VOID', time }` | authorize only — what happens automatically after `time` hours |
| &nbsp;&nbsp;`redirect.url` | URL | Return URL for redirect-based methods |
| &nbsp;&nbsp;`threeDSecure` | boolean | |
| &nbsp;&nbsp;`agreement` | `{ type: 'SCHEDULED' \| 'UNSCHEDULED', amount_variability?: 'FIXED' \| 'VARIABLE' }` | Recurring-payment agreement |
| &nbsp;&nbsp;`subscription` | `{ type, amount_variability, txn_count }` | `txn_count: 0` when the number of payments is undefined |
| &nbsp;&nbsp;`airline.reference.booking` | string | |
| &nbsp;&nbsp;`applePayRecurringPaymentRequest` | object | Apple Pay recurring sheet details (`paymentDescription`, `regularBilling`, `billingAgreement`, `managementURL`, `tokenNotificationURL`) |
| `amount` | number / string | Total |
| `order.id` | string | |
| `order.currency` / `order.amount` | | Should match `selectedCurrency` / `amount` |
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

The demo (v0.0.3) also shows **Show CVV** and **Show Saved Card CVV** under card
options, but it never forwards them to the SDK and the SDK has no such keys, so
they are intentionally not part of `CheckoutConfiguration`.

## What the screen does

- **Start Checkout** calls `startCheckout(configurations, callbacks)`. The
  hosted checkout takes several seconds to become ready and draws nothing until
  then (on iOS the sheet is fully transparent), so the button shows a spinner and
  "Opening…" and stays disabled until the SDK reports `onReady`, `onClose` or
  `onError`.
- **Event log** lists the tap, the configuration sent to the SDK, the native
  call returning, and every callback with its payload. Each entry shows the
  clock time and the time since the tap. Entries are mirrored to `console.log`
  as `[checkout +X ms] …`, so they also appear in Metro, logcat and Xcode.

A typical Android run looks like this — note that the wrapper and native bridge
cost ~10 ms; the rest is the SDK loading its hosted page:

```
+0 ms     Start Checkout tapped (android 36)
+2 ms     startCheckout() called  { publicKey, merchantId, amount, currency, … }
+8 ms     startCheckout() returned — waiting for the SDK
+5.6 s    onReady — checkout sheet is visible
```

## Notes and troubleshooting

- **Checkout takes 6–9 s to appear.** This is inside the SDK's WebView, not the
  wrapper: one API call (`checkoutprofile`) waits ~2.5 s on the server and blocks
  everything after it, config JSON is fetched twice (page + card iframe), and
  responses are not cached between taps. Android Studio's Network Inspector only
  shows the SDK's two native pre-flight calls; the WebView traffic is visible in
  logcat (`tag:intercepted`) or via `chrome://inspect` on a debug build.
- **iOS: "deployment target is set to 12.0/13.0"** — the `Podfile`'s
  `post_install` raises every pod below `min_ios_version_supported` to it,
  because Xcode 27 rejects the `SnapKit` and `Checkout-IOS` resource-bundle
  targets otherwise. Keep that block if you edit the Podfile.
- **Android release: manifest merger `usesCleartextTraffic` conflict** — the
  Tap Android SDK's manifest hardcodes `usesCleartextTraffic="true"`; the app
  manifest uses `tools:replace` so cleartext is on in debug (Metro) and off in
  release.
- **Android emulator closes the checkout by itself** a couple of seconds after
  `onReady` with some merchant configurations, while real devices and iOS are
  fine. Test payment flows on a device.
- **Blank screen on a device after launch** — Metro isn't reachable; run
  `adb reverse tcp:8081 tcp:8081` and reload.
- **`SDK location not found`** — set `ANDROID_HOME` or create
  `android/local.properties` with `sdk.dir=/path/to/Android/sdk`.
