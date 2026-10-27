import type { EventSubscription } from 'react-native';
import CheckoutReactNative from './NativeCheckoutReactNative';
import type { CheckoutCallbacks } from './NativeCheckoutReactNative';

export type { CheckoutCallbacks };

/** The onChargeCreated listener of the latest checkout. */
let chargeCreatedSubscription: EventSubscription | undefined;

export function startCheckout(
  configurations: Record<string, any>,
  callbacks: CheckoutCallbacks
): void {
  // Only one checkout is shown at a time, so a new one replaces the previous listener. It is kept
  // after onClose: on Android, going back from KNET reports onClose and then shows the sheet again,
  // where the customer can pay and create another charge.
  chargeCreatedSubscription?.remove();
  chargeCreatedSubscription = callbacks.onChargeCreated
    ? CheckoutReactNative.onChargeCreated(callbacks.onChargeCreated)
    : undefined;

  return CheckoutReactNative.startCheckout(
    configurations,
    callbacks.onSuccess,
    callbacks.onError,
    callbacks.onClose,
    callbacks.onReady
  );
}
