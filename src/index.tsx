import { NativeModules, Platform, NativeEventEmitter } from 'react-native';
import type { config } from './models';
import { camelKeysToSnake } from './Utils';

const LINKING_ERROR =
  `The package 'react-native-checkout' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const Checkout = NativeModules.Checkout
  ? NativeModules.Checkout
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function multiply(a: number, b: number): Promise<number> {
  return Checkout.multiply(a, b);
}
export function startPayment(args: config): Promise<config> {
  return Checkout.startPayment(camelKeysToSnake(args));
}

export const CheckoutEmitter = new NativeEventEmitter(Checkout);

export * from './models';
