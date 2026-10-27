import type { CodegenTypes, TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface CheckoutCallbacks {
  onSuccess: (data: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
  onReady: () => void;
  /** Fires every time the checkout creates a charge, e.g. again after the customer comes back
   * from KNET or another redirect and pays again. */
  onChargeCreated?: (data: string) => void;
}

export interface Spec extends TurboModule {
  startCheckout(
    configurations: { [key: string]: string | number | boolean | null },
    onSuccess: (data: string) => void,
    onError: (error: string) => void,
    onClose: () => void,
    onReady: () => void
  ): void;

  // An event, not a callback: a callback can only be invoked once, and a charge can be created
  // more than once in one checkout.
  readonly onChargeCreated: CodegenTypes.EventEmitter<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('CheckoutReactNative');
