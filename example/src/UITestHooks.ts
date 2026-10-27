/**
 * Lets the UI tests (ReadmeConfigurationTests on iOS and Android) drive the app: start from default
 * settings, use a public key passed at launch, change any configuration key and start the checkout
 * by itself. The native app passes the test's launch environment (iOS) or intent extras (Android)
 * as initial props, in debug builds only. Same behaviour as UITestHooks in the native example apps.
 */

import { resetSettings, type Configuration } from './CheckoutSettings';

export interface LaunchProps {
  UITEST?: string;
  UITEST_AUTOSTART?: string;
  UITEST_PUBLIC_KEY?: string;
  UITEST_CONFIG_OVERRIDES?: string;
}

export interface UITestHooks {
  /** True when the app was launched by a UI test. */
  isActive: boolean;
  /** Start the checkout as soon as the main screen appears. */
  autoStart: boolean;
  /** Applies the test's changes on top of the configuration built from the settings. */
  apply(configuration: Configuration): Configuration;
}

export function makeUITestHooks(props: LaunchProps = {}): UITestHooks {
  const isActive = props.UITEST === '1';
  return {
    isActive,
    autoStart: isActive && props.UITEST_AUTOSTART === '1',
    apply(configuration) {
      if (!isActive) return configuration;
      let result = configuration;
      // UITEST_PUBLIC_KEY replaces gateway.publicKey.
      if (props.UITEST_PUBLIC_KEY) {
        result = merge(result, {
          gateway: { publicKey: props.UITEST_PUBLIC_KEY },
        });
      }
      // UITEST_CONFIG_OVERRIDES is a JSON object merged into the configuration.
      if (props.UITEST_CONFIG_OVERRIDES) {
        try {
          const overrides = JSON.parse(props.UITEST_CONFIG_OVERRIDES);
          if (isObject(overrides)) result = merge(result, overrides);
        } catch {
          // Not JSON: the test sees the unchanged configuration.
        }
      }
      return result;
    },
  };
}

/** Called once at launch: UI tests always start from the web demo defaults. */
export function prepareUITestHooks(hooks: UITestHooks): void {
  if (hooks.isActive) resetSettings();
}

/** Nested objects are merged key by key; a `null` value removes that key, so a test can check what
 * happens when it is not sent. */
export function merge(
  base: Configuration,
  overrides: Configuration
): Configuration {
  const result: Configuration = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) {
      delete result[key];
    } else if (isObject(value) && isObject(result[key])) {
      result[key] = merge(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function isObject(value: unknown): value is Configuration {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
