/**
 * Checks that startCheckout hands the configuration and the callbacks to the native module in the
 * order the native spec (NativeCheckoutReactNative.ts) declares them, and that onChargeCreated is an
 * event that can fire more than once (e.g. after coming back from KNET), until the next checkout.
 */

const mockStartCheckout = jest.fn();
const mockListeners = new Set<(data: string) => void>();

jest.mock('../NativeCheckoutReactNative', () => ({
  __esModule: true,
  default: {
    startCheckout: (...args: unknown[]) => mockStartCheckout(...args),
    onChargeCreated: (listener: (data: string) => void) => {
      mockListeners.add(listener);
      return { remove: () => mockListeners.delete(listener) };
    },
  },
}));

import { startCheckout, type CheckoutCallbacks } from '../index';

function callbacks(): Required<CheckoutCallbacks> {
  return {
    onSuccess: jest.fn(),
    onError: jest.fn(),
    onClose: jest.fn(),
    onReady: jest.fn(),
    onChargeCreated: jest.fn(),
  };
}

/** What the native module does when the SDK reports a charge. */
const emitChargeCreated = (data: string) =>
  mockListeners.forEach((listener) => listener(data));

/** The callbacks startCheckout passed to the native module. */
const nativeCallbacks = () => {
  const [, onSuccess, onError, onClose, onReady] =
    mockStartCheckout.mock.calls[mockStartCheckout.mock.calls.length - 1];
  return { onSuccess, onError, onClose, onReady };
};

beforeEach(() => {
  mockStartCheckout.mockReset();
  mockListeners.clear();
});

it('passes the configuration through unchanged', () => {
  const configuration = {
    gateway: { publicKey: 'pk_test_x' },
    transaction: { mode: 'charge', charge: { threeDSecure: true } },
    amount: 0.1,
  };
  startCheckout(configuration, callbacks());
  expect(mockStartCheckout).toHaveBeenCalledTimes(1);
  expect(mockStartCheckout.mock.calls[0][0]).toBe(configuration);
});

it('passes each callback in the native order', () => {
  const given = callbacks();
  startCheckout({}, given);
  const native = nativeCallbacks();

  native.onReady();
  native.onSuccess('{"chargeId":"chg_1"}');
  expect(given.onReady).toHaveBeenCalled();
  expect(given.onSuccess).toHaveBeenCalledWith('{"chargeId":"chg_1"}');

  startCheckout({}, given);
  nativeCallbacks().onError('{"message":"failed"}');
  expect(given.onError).toHaveBeenCalledWith('{"message":"failed"}');

  startCheckout({}, given);
  nativeCallbacks().onClose();
  expect(given.onClose).toHaveBeenCalled();
});

it('reports every charge created during one checkout', () => {
  const given = callbacks();
  startCheckout({}, given);
  // The customer pays with KNET, comes back, and pays again.
  emitChargeCreated('{"id":"chg_1"}');
  emitChargeCreated('{"id":"chg_2"}');
  expect(given.onChargeCreated).toHaveBeenNthCalledWith(1, '{"id":"chg_1"}');
  expect(given.onChargeCreated).toHaveBeenNthCalledWith(2, '{"id":"chg_2"}');
});

it('keeps reporting charges after onClose', () => {
  // On Android, going back from KNET reports onClose and then shows the sheet again.
  const given = callbacks();
  startCheckout({}, given);
  emitChargeCreated('{"id":"chg_1"}');
  nativeCallbacks().onClose();
  emitChargeCreated('{"id":"chg_2"}');
  expect(given.onChargeCreated).toHaveBeenCalledTimes(2);
  expect(given.onClose).toHaveBeenCalledTimes(1);
});

it('a new checkout replaces the previous listener', () => {
  const first = callbacks();
  const second = callbacks();
  startCheckout({}, first);
  startCheckout({}, second);
  emitChargeCreated('{"id":"chg_1"}');
  expect(first.onChargeCreated).not.toHaveBeenCalled();
  expect(second.onChargeCreated).toHaveBeenCalledWith('{"id":"chg_1"}');
});

it('accepts callbacks without onChargeCreated', () => {
  const required: CheckoutCallbacks = callbacks();
  delete required.onChargeCreated;
  startCheckout({}, required);
  expect(mockListeners.size).toBe(0);
  expect(() => emitChargeCreated('{"id":"chg_1"}')).not.toThrow();
});
