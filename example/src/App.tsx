import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { startCheckout } from 'checkout-react-native';
import type { CheckoutCallbacks } from 'checkout-react-native';
import type { ScrollViewInstance } from 'react-native';

type LogEntry = {
  id: number;
  time: string;
  /** Milliseconds since the last "Start Checkout" tap, if any. */
  sinceTap: number | null;
  message: string;
  detail?: string;
};

const formatClock = (date: Date) =>
  date.toTimeString().slice(0, 8) +
  '.' +
  String(date.getMilliseconds()).padStart(3, '0');

const formatElapsed = (ms: number) =>
  ms >= 1000 ? `+${(ms / 1000).toFixed(2)} s` : `+${ms} ms`;

export default function App() {
  const [status, setStatus] = useState('Ready to start checkout');
  const [log, setLog] = useState<LogEntry[]>([]);
  const tapTimeRef = useRef<number | null>(null);
  const logIdRef = useRef(0);
  const logScrollRef = useRef<ScrollViewInstance>(null);

  // Records an event on screen (with clock time and time since the tap) and
  // mirrors it to the console so it also shows up in Metro / logcat / Xcode.
  const addLog = useCallback((message: string, detail?: unknown) => {
    const now = Date.now();
    const sinceTap =
      tapTimeRef.current === null ? null : now - tapTimeRef.current;
    const detailText =
      detail === undefined
        ? undefined
        : typeof detail === 'string'
          ? detail
          : JSON.stringify(detail, null, 2);
    setLog((entries) => [
      ...entries,
      {
        id: ++logIdRef.current,
        time: formatClock(new Date(now)),
        sinceTap,
        message,
        detail: detailText,
      },
    ]);
    console.log(
      `[checkout${sinceTap === null ? '' : ' ' + formatElapsed(sinceTap)}] ${message}`,
      detail === undefined ? '' : detail
    );
  }, []);
  // True from the tap until the SDK reports ready/closed/errored. The hosted
  // checkout takes several seconds to load and draws nothing meanwhile (on iOS
  // the sheet is fully transparent), so give the user feedback ourselves.
  const [isOpening, setIsOpening] = useState(false);

  const handleStartCheckout = () => {
    if (isOpening) {
      return;
    }
    setIsOpening(true);
    setStatus('Opening checkout…');
    tapTimeRef.current = Date.now();
    addLog(`Start Checkout tapped (${Platform.OS} ${Platform.Version})`);

    const configurations = {
      hashString: '',
      language: 'en',
      themeMode: 'light',
      supportedPaymentMethods: 'ALL',
      paymentType: 'ALL',
      selectedCurrency: 'KWD',
      supportedCurrencies: 'ALL',
      supportedPaymentTypes: [],
      supportedRegions: [],
      supportedSchemes: [],
      supportedCountries: [],
      gateway: {
        publicKey: 'pk_test_ohzQrUWRnTkCLD1cqMeudyjX',
        merchantId: '',
      },
      customer: {
        firstName: 'Android',
        lastName: 'Test',
        email: 'example@gmail.com',
        phone: { countryCode: '965', number: '55567890' },
      },
      transaction: {
        mode: 'charge',
        charge: {
          saveCard: true,
          auto: { type: 'VOID', time: 100 },
          redirect: {
            url: 'https://demo.staging.tap.company/v2/sdk/checkout',
          },
          threeDSecure: true,
          subscription: {
            type: 'SCHEDULED',
            amount_variability: 'FIXED',
            txn_count: 0,
          },
          airline: {
            reference: { booking: '' },
          },
        },
      },
      amount: '5',
      order: {
        id: '',
        currency: 'KWD',
        amount: '5',
        items: [
          {
            amount: '5',
            currency: 'KWD',
            name: 'Item Title 1',
            quantity: 1,
            description: 'item description 1',
          },
        ],
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
    };

    const callbacks: CheckoutCallbacks = {
      onSuccess: (data: string) => {
        setStatus(`Checkout successful: ${data}`);
        addLog('onSuccess', data);
      },
      onError: (error: string) => {
        setIsOpening(false);
        setStatus(`Checkout error: ${error}`);
        addLog('onError', error);
      },
      onClose: () => {
        setIsOpening(false);
        setStatus('Checkout closed');
        addLog('onClose');
      },
      onReady: () => {
        setIsOpening(false);
        setStatus('Checkout ready');
        addLog('onReady — checkout sheet is visible');
      },
    };

    addLog('startCheckout() called', {
      publicKey: configurations.gateway.publicKey,
      merchantId: configurations.gateway.merchantId,
      amount: configurations.amount,
      currency: configurations.order.currency,
      mode: configurations.transaction.mode,
      language: configurations.language,
      themeMode: configurations.themeMode,
    });
    try {
      startCheckout(configurations, callbacks);
      addLog('startCheckout() returned — waiting for the SDK');
    } catch (e) {
      setIsOpening(false);
      setStatus('Checkout failed to start');
      addLog('startCheckout() threw', e instanceof Error ? e.message : e);
    }
  };

  const clearLog = () => {
    setLog([]);
    tapTimeRef.current = null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout React Native Example</Text>
      <Text style={styles.status}>{status}</Text>
      <TouchableOpacity
        style={[styles.button, isOpening && styles.buttonDisabled]}
        onPress={handleStartCheckout}
        disabled={isOpening}
        accessibilityState={
          isOpening ? { busy: true, disabled: true } : { disabled: false }
        }
      >
        {isOpening && (
          <ActivityIndicator color="white" style={styles.buttonSpinner} />
        )}
        <Text style={styles.buttonText}>
          {isOpening ? 'Opening…' : 'Start Checkout'}
        </Text>
      </TouchableOpacity>

      <View style={styles.logHeader}>
        <Text style={styles.logTitle}>Event log</Text>
        <TouchableOpacity
          onPress={clearLog}
          disabled={log.length === 0}
          accessibilityRole="button"
        >
          <Text
            style={[styles.logClear, log.length === 0 && styles.logClearOff]}
          >
            Clear
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        ref={logScrollRef}
        style={styles.log}
        contentContainerStyle={styles.logContent}
        onContentSizeChange={() =>
          logScrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {log.length === 0 ? (
          <Text style={styles.logEmpty}>
            Tap “Start Checkout” — every step and SDK callback is listed here
            with the time since the tap.
          </Text>
        ) : (
          log.map((entry) => (
            <View key={entry.id} style={styles.logRow}>
              <Text style={styles.logTime}>
                {entry.time}
                {entry.sinceTap !== null && (
                  <Text style={styles.logElapsed}>
                    {'  '}
                    {formatElapsed(entry.sinceTap)}
                  </Text>
                )}
              </Text>
              <Text style={styles.logMessage}>{entry.message}</Text>
              {entry.detail !== undefined && (
                <Text style={styles.logDetail}>{entry.detail}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const monospace = Platform.select({ ios: 'Menlo', default: 'monospace' });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonSpinner: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logHeader: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 32,
    marginBottom: 8,
  },
  logTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#666',
  },
  logClear: {
    fontSize: 14,
    color: '#007AFF',
  },
  logClearOff: {
    opacity: 0.35,
  },
  log: {
    alignSelf: 'stretch',
    flex: 1,
    backgroundColor: '#f2f2f5',
    borderRadius: 8,
  },
  logContent: {
    padding: 12,
    gap: 10,
  },
  logEmpty: {
    fontSize: 13,
    color: '#888',
  },
  logRow: {
    gap: 2,
  },
  logTime: {
    fontFamily: monospace,
    fontSize: 11,
    color: '#888',
  },
  logElapsed: {
    color: '#007AFF',
    fontWeight: '600',
  },
  logMessage: {
    fontSize: 14,
    color: '#222',
  },
  logDetail: {
    fontFamily: monospace,
    fontSize: 11,
    color: '#555',
    marginTop: 2,
  },
});
