import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface CheckoutCallbacks {
  onSuccess: (data: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
  onReady: () => void;
}

export interface Spec extends TurboModule {
  startCheckout(
    configurations: { [key: string]: string | number | boolean | null },
    onSuccess: (data: string) => void,
    onError: (error: string) => void,
    onClose: () => void,
    onReady: () => void
  ): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('CheckoutReactNative');
