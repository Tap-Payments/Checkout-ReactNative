# checkout-react-native example

A React Native app that exercises the `checkout-react-native` wrapper around
the Tap Checkout SDK. One screen: a form covering every checkout option, a
**Start Checkout** button that sends what
you picked, and an event log that records every step and SDK callback with the
time since the tap.

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

The screen is a form with the same five steps as Tap's web checkout —
**Gateway**, **Customer**, **Card**, **Order**, **Transaction** — plus a
**Log** tab. Every
option the SDK accepts is a control there: dropdowns for enumerated values
(single or multiple choice, with `ALL`/`AUTO` behaving exclusively), switches for yes/no, and text fields for free text. Conditional fields
appear only when relevant (authorize type only for `authorize`,
agreement details only when "Agreed payment" is on, and so on).

**Start Checkout** builds the SDK object from the current form and sends it; the
exact object is printed in the Log tab.

Code:

- [`src/checkoutConfig.ts`](src/checkoutConfig.ts) — the option lists
  (`PAYMENT_METHODS`, `CURRENCIES`, …), the typed `CheckoutConfiguration` the
  SDK receives, the `FormState` model with `defaultForm`, and
  `buildConfiguration(form)` which assembles the SDK object (drops empty lists, collapses `['ALL']` to `'ALL'`, nests the
  transaction options under the selected mode, …).
- [`src/countries.ts`](src/countries.ts) — the ISO 3166-1 alpha-2 codes
  accepted by `supportedCountries`.
- [`src/components/fields.tsx`](src/components/fields.tsx) — the form controls
  (no third-party dependencies).
- [`src/App.tsx`](src/App.tsx) — the screen, the loading state and the event log.

### Merchant

Enter your key and merchant id in the **Gateway** tab, or change the defaults
in `defaultForm`:

```ts
publicKey: 'pk_test_…',   // Tap public key (test or live)
merchantId: '',           // Tap merchant id
```

Tap validates the public key against the app identifier registered for the
merchant. If you use your own key, the app id must match what is registered:
`applicationId` in [`android/app/build.gradle`](android/app/build.gradle) and
`PRODUCT_BUNDLE_IDENTIFIER` in the Xcode project (both default to
`checkoutreactnative.example`).

### All options

The full option reference — every key and the values it accepts — is in the
[root README](../README.md#configuration).

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
