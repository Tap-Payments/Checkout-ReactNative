/**
 * checkout-react-native integration: build the configuration from the saved settings, start the
 * checkout and log every callback. The Settings screen edits the same inputs as the Tap web demo.
 *
 * The screen shows what the next checkout will do (mode, amount, key), the main settings, and every
 * callback as a card that expands to its full payload. Same layout as the native example apps.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { startCheckout } from 'checkout-react-native';
import {
  formatAmount,
  hasPublicKey,
  makeConfiguration,
  totalAmount,
  type CheckoutSettings,
  type Configuration,
} from '../CheckoutSettings';
import type { UITestHooks } from '../UITestHooks';
import { usePalette, type Palette } from '../theme';
import {
  CallbackCard,
  Card,
  ConfigRow,
  Divider,
  NavBar,
  SectionHeader,
} from '../components/ui';

interface Callback {
  id: number;
  name: string;
  time: string;
  payload?: string;
}

export function HomeScreen({
  settings,
  testHooks,
  onOpenSettings,
  onShowJSON,
}: {
  settings: CheckoutSettings;
  testHooks: UITestHooks;
  onOpenSettings: () => void;
  onShowJSON: (configuration: Configuration) => void;
}) {
  const palette = usePalette();
  const [callbacks, setCallbacks] = useState<Callback[]>([]);
  const [loading, setLoading] = useState(false);
  const nextId = useRef(0);

  const addCallback = useCallback((name: string, payload?: string) => {
    const callback = {
      id: nextId.current++,
      name,
      time: new Date().toTimeString().slice(0, 8),
      payload,
    };
    setCallbacks((current) => [callback, ...current]);
  }, []);

  const start = useCallback(() => {
    if (!hasPublicKey(settings) && !testHooks.isActive) {
      Alert.alert(
        'Public key missing',
        'Set your Tap sandbox public key in example/src/Keys.ts (Keys.publicKey), or enter it in Settings > SDK Configuration > Public Key.'
      );
      return;
    }
    // The button shows a spinner until the checkout sheet is ready (or fails).
    setLoading(true);
    // The SDK takes a plain object; makeConfiguration() builds it like the Tap web demo does.
    startCheckout(testHooks.apply(makeConfiguration(settings)), {
      onReady: () => {
        setLoading(false);
        addCallback('onReady');
      },
      onChargeCreated: (data) => addCallback('onChargeCreated', data),
      onSuccess: (data) => {
        setLoading(false);
        addCallback('onSuccess', data);
      },
      onError: (error) => {
        setLoading(false);
        addCallback('onError', error);
      },
      onClose: () => {
        setLoading(false);
        addCallback('onClose');
      },
    });
  }, [settings, testHooks, addCallback]);

  const didAutoStart = useRef(false);
  useEffect(() => {
    if (testHooks.autoStart && !didAutoStart.current) {
      didAutoStart.current = true;
      start();
    }
  }, [testHooks.autoStart, start]);

  const sharePayload = (payload?: string) => {
    if (payload) Share.share({ message: payload });
  };

  return (
    <View
      style={[styles.screen, { backgroundColor: palette.screenBackground }]}
    >
      <NavBar
        title="Tap Checkout"
        action={{
          title: 'SETTINGS',
          onPress: onOpenSettings,
          testID: 'openSettings',
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {testHooks.isActive ? (
          // UI tests read the plain-text log, so show it near the top instead of the cards.
          <Text
            testID="callbackLog"
            style={[
              styles.callbackLog,
              {
                backgroundColor: palette.cardBackground,
                color: palette.textPrimary,
              },
            ]}
          >
            {callbacks.length === 0
              ? 'Callbacks will appear here...'
              : callbacks
                  .map((callback) => `[${callback.time}] ${logLine(callback)}`)
                  .join('\n\n')}
          </Text>
        ) : (
          <>
            <Hero settings={settings} palette={palette} />

            <SectionHeader title="Configuration" />
            <Card style={styles.configCard}>
              {configurationRows(settings).map(([label, value], index) => (
                <View key={label}>
                  {index > 0 ? <Divider /> : null}
                  <ConfigRow label={label} value={value} />
                </View>
              ))}
              <Divider />
              <View style={styles.configActions}>
                <Pressable onPress={onOpenSettings} hitSlop={8}>
                  <Text style={[styles.link, { color: palette.accent }]}>
                    Edit settings
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    onShowJSON(testHooks.apply(makeConfiguration(settings)))
                  }
                  hitSlop={8}
                >
                  <Text style={[styles.link, { color: palette.accent }]}>
                    View JSON
                  </Text>
                </Pressable>
              </View>
            </Card>

            <View style={styles.sectionSpacing}>
              <SectionHeader
                title={
                  callbacks.length === 0
                    ? 'Callbacks'
                    : `Callbacks (${callbacks.length})`
                }
                trailing={
                  callbacks.length > 0 ? (
                    <Pressable onPress={() => setCallbacks([])} hitSlop={8}>
                      <Text style={[styles.link, { color: palette.accent }]}>
                        Clear
                      </Text>
                    </Pressable>
                  ) : null
                }
              />
            </View>
            {callbacks.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text
                  style={[styles.emptyText, { color: palette.textSecondary }]}
                >
                  {
                    'Callbacks will appear here.\nTap a callback to see its full payload.'
                  }
                </Text>
              </Card>
            ) : (
              <View style={styles.callbacks}>
                {callbacks.map((callback) => (
                  <CallbackCard
                    key={callback.id}
                    name={callback.name}
                    time={callback.time}
                    summary={summary(callback)}
                    payload={
                      callback.payload === undefined
                        ? undefined
                        : prettyJSON(callback.payload)
                    }
                    color={eventColor(callback.name, palette)}
                    onLongPress={() => sharePayload(callback.payload)}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.buttonBar}>
        <Pressable
          onPress={start}
          disabled={loading}
          accessibilityRole="button"
          testID="startCheckout"
          style={({ pressed }) => [
            styles.checkoutButton,
            { backgroundColor: palette.accent },
            (pressed || loading) && styles.checkoutButtonDimmed,
          ]}
        >
          {loading ? <ActivityIndicator color="#FFFFFF" /> : null}
          <Text style={styles.checkoutButtonText}>
            {loading ? 'Opening checkout…' : 'Start Checkout'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Hero({
  settings,
  palette,
}: {
  settings: CheckoutSettings;
  palette: Palette;
}) {
  const key = settings.publicKey.trim();
  const chip = !hasPublicKey(settings)
    ? { text: 'No public key', color: palette.chipMissing }
    : key.startsWith('pk_live_')
      ? { text: 'Live key', color: palette.chipLive }
      : { text: 'Sandbox key', color: palette.chipSandbox };
  const count = settings.items.length;
  const customer = `${settings.firstName} ${settings.lastName}`.trim();

  return (
    <View
      style={[
        styles.hero,
        {
          backgroundColor: palette.heroStart,
          backgroundImage: `linear-gradient(135deg, ${palette.heroStart}, ${palette.heroEnd})`,
        },
      ]}
    >
      <View style={styles.heroTopRow}>
        <Text style={styles.heroMode}>
          {settings.mode === 'authorize'
            ? `AUTHORIZE · ${settings.authorizeType}`
            : 'CHARGE'}
        </Text>
        <View style={styles.flex} />
        <View style={[styles.chip, { backgroundColor: chip.color }]}>
          <Text style={styles.chipText}>{chip.text}</Text>
        </View>
      </View>
      <Text style={styles.heroAmount} numberOfLines={1} adjustsFontSizeToFit>
        {`${formatAmount(totalAmount(settings))} ${settings.selectedCurrency}`}
      </Text>
      <Text style={styles.heroDetail}>
        {`${count} item${count === 1 ? '' : 's'} · ${customer}`}
      </Text>
    </View>
  );
}

function configurationRows(settings: CheckoutSettings): [string, string][] {
  const list = (values: string[]) =>
    values.length === 0 ? 'All' : values.join(', ');
  return [
    ['Payment type', settings.paymentType],
    ['Payment methods', list(settings.supportedPaymentMethods)],
    ['Currencies', list(settings.supportedCurrencies)],
    ['Language', settings.language],
    ['Theme', settings.theme],
    ['Checkout mode', settings.checkoutMode],
    ['3D Secure', settings.threeDSecure ? 'On' : 'Off'],
    ['Save card', settings.saveCardOption],
    ['Card funding', settings.cardFundingSource],
    [
      'Customer',
      `${settings.email} · +${settings.countryCode} ${settings.phoneNumber}`,
    ],
  ];
}

function logLine(callback: Callback): string {
  switch (callback.name) {
    case 'onReady':
      return 'onReady: Checkout is ready';
    case 'onClose':
      return 'onClose: Checkout was closed';
    default:
      return `${callback.name}: ${callback.payload ?? ''}`;
  }
}

function eventColor(name: string, palette: Palette): string {
  switch (name) {
    case 'onReady':
      return palette.eventReady;
    case 'onChargeCreated':
      return palette.eventCharge;
    case 'onSuccess':
      return palette.eventSuccess;
    case 'onError':
      return palette.eventError;
    default:
      return palette.eventClose;
  }
}

/** One line that says what happened, read from the payload where there is one. */
function summary(callback: Callback): string {
  let json: Record<string, unknown> | undefined;
  try {
    const parsed = callback.payload ? JSON.parse(callback.payload) : undefined;
    if (parsed && typeof parsed === 'object') json = parsed;
  } catch {
    json = undefined;
  }
  const text = (key: string) => {
    const value = json?.[key];
    if (value === undefined || value === null) return undefined;
    const string = String(value);
    return string === '' ? undefined : string;
  };
  const present = (values: (string | undefined)[]) =>
    values.filter((value): value is string => value !== undefined);

  let line: string | undefined;
  switch (callback.name) {
    case 'onReady':
      line = 'Checkout is ready';
      break;
    case 'onClose':
      line = 'Checkout was closed';
      break;
    case 'onChargeCreated': {
      const amount = present([text('amount'), text('currency')]).join(' ');
      line = present([text('id'), text('status'), amount || undefined]).join(
        ' · '
      );
      break;
    }
    case 'onSuccess': {
      const chargeId = text('chargeId');
      line = chargeId ? `Completed · ${chargeId}` : undefined;
      break;
    }
    case 'onError': {
      const message = text('message');
      const code = text('code');
      line = message ? (code ? `${message} (${code})` : message) : undefined;
      break;
    }
  }
  return line || (callback.payload ?? '').slice(0, 120);
}

function prettyJSON(payload: string): string {
  try {
    return JSON.stringify(sortKeys(JSON.parse(payload)), null, 2);
  } catch {
    return payload;
  }
}

export function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortKeys((value as Record<string, unknown>)[key])])
    );
  }
  return value;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, gap: 8 },

  hero: { borderRadius: 18, padding: 20, gap: 4, marginBottom: 16 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  heroMode: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  chip: { borderRadius: 11, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  heroAmount: { fontSize: 34, fontWeight: '700', color: '#FFFFFF' },
  heroDetail: { fontSize: 15, color: 'rgba(255,255,255,0.8)' },

  configCard: { paddingHorizontal: 16, paddingVertical: 4 },
  configActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
  },
  link: { fontSize: 15 },
  sectionSpacing: { marginTop: 16 },

  emptyCard: { paddingVertical: 24, paddingHorizontal: 16 },
  emptyText: { fontSize: 15, textAlign: 'center' },
  callbacks: { gap: 8 },
  callbackLog: {
    fontSize: 13,
    borderRadius: 14,
    padding: 12,
    overflow: 'hidden',
  },

  buttonBar: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  checkoutButton: {
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  checkoutButtonDimmed: { opacity: 0.7 },
  checkoutButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
});
