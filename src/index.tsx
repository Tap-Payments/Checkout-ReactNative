import CheckoutReactNative from './NativeCheckoutReactNative';
import type { CheckoutCallbacks } from './NativeCheckoutReactNative';

export type { CheckoutCallbacks };

export function startCheckout(
  configurations: Record<string, any>,
  callbacks: CheckoutCallbacks
): void {
  return CheckoutReactNative.startCheckout(
    configurations,
    callbacks.onSuccess,
    callbacks.onError,
    callbacks.onClose,
    callbacks.onReady
  );
}
