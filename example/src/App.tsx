import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ScrollViewInstance } from 'react-native';
import { startCheckout } from 'checkout-react-native';
import type { CheckoutCallbacks } from 'checkout-react-native';
import {
  AGREEMENT_TYPES,
  AMOUNT_VARIABILITIES,
  AUTHORIZE_TYPES,
  CARD_FUNDING_SOURCES,
  CHECKOUT_MODES,
  COUNTRY_CODES,
  CURRENCIES,
  DISCOUNT_TYPES,
  LANGUAGES,
  NUMBER_OF_PAYMENTS,
  PAYMENT_METHODS,
  PAYMENT_TYPES,
  REGIONS,
  SAVE_CARD_OPTIONS,
  SCHEMES,
  SUPPORTED_CURRENCIES,
  SUPPORTED_PAYMENT_TYPES,
  THEMES,
  TRANSACTION_MODES,
  buildConfiguration,
  defaultForm,
  orderTotal,
} from './checkoutConfig';
import type { FormItem, FormState } from './checkoutConfig';
import {
  MultiSelectField,
  Section,
  SelectField,
  TextField,
  YesNoField,
} from './components/fields';

// ---------------------------------------------------------------------------
// Event log
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

const TABS = [
  'Gateway',
  'Customer',
  'Card',
  'Order',
  'Transaction',
  'Log',
] as const;
type Tab = (typeof TABS)[number];

const LANGUAGE_OPTIONS = LANGUAGES.map((v) => ({
  value: v,
  label: v === 'auto' ? 'Auto (device)' : v === 'en' ? 'English' : 'Arabic',
}));
const THEME_OPTIONS = THEMES.map((v) => ({
  value: v,
  label: {
    light: 'Light',
    dark: 'Dark',
    light_mono: 'Light Mono',
    dark_colored: 'Dark Colored',
    auto: 'Auto (device)',
  }[v],
}));
const DISCOUNT_OPTIONS = DISCOUNT_TYPES.map((v) => ({
  value: v,
  label: { none: 'None', F: 'F — fixed amount', P: 'P — percentage' }[v],
}));

export default function App() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [tab, setTab] = useState<Tab>('Gateway');
  const [status, setStatus] = useState('Ready to start checkout');
  // True from the tap until the SDK reports ready/closed/errored. The hosted
  // checkout takes several seconds to load and draws nothing meanwhile (on iOS
  // the sheet is fully transparent), so give the user feedback ourselves.
  const [isOpening, setIsOpening] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const tapTimeRef = useRef<number | null>(null);
  const logIdRef = useRef(0);
  const logScrollRef = useRef<ScrollViewInstance>(null);

  const set =
    <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) =>
      setForm((f) => ({ ...f, [key]: value }));

  const setItem = (index: number, patch: Partial<FormItem>) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    }));

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

  const handleStartCheckout = () => {
    if (isOpening) {
      return;
    }
    setIsOpening(true);
    setStatus('Opening checkout…');
    setTab('Log');
    tapTimeRef.current = Date.now();
    addLog(`Start Checkout tapped (${Platform.OS} ${Platform.Version})`);

    const configurations = buildConfiguration(form);

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

    addLog('startCheckout() called with', configurations);
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
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
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
            {isOpening
              ? 'Opening…'
              : `Start Checkout · ${orderTotal(form.items)} ${form.selectedCurrency}`}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabs}
        contentContainerStyle={styles.tabsContent}
      >
        {TABS.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabOn]}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t }}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>
              {t === 'Log' && log.length ? `Log (${log.length})` : t}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {tab === 'Log' ? (
        <View style={styles.logPane}>
          <View style={styles.logHeader}>
            <Text style={styles.sectionLabel}>Event log</Text>
            <TouchableOpacity
              onPress={clearLog}
              disabled={log.length === 0}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.logClear,
                  log.length === 0 && styles.logClearOff,
                ]}
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
                Tap “Start Checkout” — every step and SDK callback is listed
                here with the time since the tap.
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
      ) : (
        <ScrollView
          style={styles.form}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          {tab === 'Gateway' && (
            <>
              <Section title="Gateway">
                <TextField
                  label="Public key"
                  value={form.publicKey}
                  onChange={set('publicKey')}
                  placeholder="pk_test_…"
                  hint="Required. Test or live key from your Tap dashboard."
                />
                <TextField
                  label="Merchant id"
                  value={form.merchantId}
                  onChange={set('merchantId')}
                  placeholder="Optional"
                />
              </Section>
              <Section title="Acceptance">
                <MultiSelectField
                  label="Supported currencies"
                  options={SUPPORTED_CURRENCIES}
                  value={form.supportedCurrencies}
                  onChange={set('supportedCurrencies')}
                  exclusive={['ALL', 'AUTO']}
                  hint="ALL, AUTO (from the merchant account), or an explicit list."
                />
                <SelectField
                  label="Payment type"
                  options={PAYMENT_TYPES}
                  value={form.paymentType}
                  onChange={set('paymentType')}
                />
                <MultiSelectField
                  label="Supported payment methods"
                  options={PAYMENT_METHODS}
                  value={form.supportedPaymentMethods}
                  onChange={set('supportedPaymentMethods')}
                  exclusive={['ALL']}
                />
                <SelectField
                  label="Selected currency"
                  options={CURRENCIES}
                  value={form.selectedCurrency}
                  onChange={set('selectedCurrency')}
                  hint="Currency the customer pays in; also applied to the order items."
                />
                <SelectField
                  label="Language"
                  options={LANGUAGE_OPTIONS}
                  value={form.language}
                  onChange={set('language')}
                />
                <MultiSelectField
                  label="Supported regions"
                  options={REGIONS}
                  value={form.supportedRegions}
                  onChange={set('supportedRegions')}
                  placeholder="No restriction"
                />
                <MultiSelectField
                  label="Supported countries"
                  options={COUNTRY_CODES}
                  value={form.supportedCountries}
                  onChange={set('supportedCountries')}
                  placeholder="No restriction"
                  searchable
                  hint="ISO 3166-1 alpha-2 codes."
                />
                <MultiSelectField
                  label="Supported payment types"
                  options={SUPPORTED_PAYMENT_TYPES}
                  value={form.supportedPaymentTypes}
                  onChange={set('supportedPaymentTypes')}
                  placeholder="No restriction"
                />
                <MultiSelectField
                  label="Supported schemes"
                  options={SCHEMES}
                  value={form.supportedSchemes}
                  onChange={set('supportedSchemes')}
                  placeholder="No restriction"
                />
              </Section>
            </>
          )}

          {tab === 'Customer' && (
            <Section title="Customer">
              <TextField
                label="Customer id"
                value={form.customerId}
                onChange={set('customerId')}
                placeholder="cus_…"
                hint="Existing Tap customer. When set, the other fields are optional."
              />
              <TextField
                label="First name"
                value={form.firstName}
                onChange={set('firstName')}
              />
              <TextField
                label="Last name"
                value={form.lastName}
                onChange={set('lastName')}
              />
              <TextField
                label="E-mail"
                value={form.email}
                onChange={set('email')}
                keyboardType="email-address"
              />
              <TextField
                label="Phone country code"
                value={form.countryCode}
                onChange={set('countryCode')}
                keyboardType="number-pad"
                placeholder="965"
              />
              <TextField
                label="Phone number"
                value={form.phoneNumber}
                onChange={set('phoneNumber')}
                keyboardType="phone-pad"
              />
            </Section>
          )}

          {tab === 'Card' && (
            <>
              <Section title="Card options">
                <YesNoField
                  label="Show brands"
                  value={form.showBrands}
                  onChange={set('showBrands')}
                  hint="Show the accepted-scheme logos under the card field."
                />
                <YesNoField
                  label="Show loading state"
                  value={form.showLoadingState}
                  onChange={set('showLoadingState')}
                />
                <YesNoField
                  label="Collect card holder name"
                  value={form.collectHolderName}
                  onChange={set('collectHolderName')}
                />
                <TextField
                  label="Pre-load card name"
                  value={form.preLoadCardName}
                  onChange={set('preLoadCardName')}
                  placeholder="Optional"
                />
                <YesNoField
                  label="Card name editable"
                  value={form.cardNameEditable}
                  onChange={set('cardNameEditable')}
                />
                <SelectField
                  label="Card funding source"
                  options={CARD_FUNDING_SOURCES}
                  value={form.cardFundingSource}
                  onChange={set('cardFundingSource')}
                />
                <SelectField
                  label="Save card option"
                  options={SAVE_CARD_OPTIONS}
                  value={form.saveCardOption}
                  onChange={set('saveCardOption')}
                  hint="Who may offer to save the card: everyone, the merchant, Tap, or nobody."
                />
                <YesNoField
                  label="Force LTR"
                  value={form.forceLtr}
                  onChange={set('forceLtr')}
                  hint="Keep the card field left-to-right in Arabic."
                />
              </Section>
              <Section title="Alternative card inputs">
                <YesNoField
                  label="Card scanner"
                  value={form.cardScanner}
                  onChange={set('cardScanner')}
                />
                <YesNoField
                  label="Card NFC"
                  value={form.cardNFC}
                  onChange={set('cardNFC')}
                />
              </Section>
            </>
          )}

          {tab === 'Order' && (
            <>
              <Section title="Order">
                <TextField
                  label="Order id"
                  value={form.orderId}
                  onChange={set('orderId')}
                  placeholder="Optional"
                />
                <SelectField
                  label="Discount type"
                  options={DISCOUNT_OPTIONS}
                  value={form.discountType}
                  onChange={set('discountType')}
                />
                {form.discountType !== 'none' && (
                  <TextField
                    label="Discount value"
                    value={form.discountValue}
                    onChange={set('discountValue')}
                    keyboardType="decimal-pad"
                  />
                )}
              </Section>
              {form.items.map((item, i) => (
                <Section key={i} title={`Item ${i + 1}`}>
                  <TextField
                    label="Name"
                    value={item.name}
                    onChange={(v) => setItem(i, { name: v })}
                  />
                  <TextField
                    label="Description"
                    value={item.description}
                    onChange={(v) => setItem(i, { description: v })}
                  />
                  <TextField
                    label="Quantity"
                    value={item.quantity}
                    onChange={(v) => setItem(i, { quantity: v })}
                    keyboardType="number-pad"
                  />
                  <TextField
                    label={`Amount (${form.selectedCurrency})`}
                    value={item.amount}
                    onChange={(v) => setItem(i, { amount: v })}
                    keyboardType="decimal-pad"
                  />
                  {form.items.length > 1 && (
                    <Pressable
                      onPress={() =>
                        setForm((f) => ({
                          ...f,
                          items: f.items.filter((_, j) => j !== i),
                        }))
                      }
                      accessibilityRole="button"
                    >
                      <Text style={styles.remove}>Remove item</Text>
                    </Pressable>
                  )}
                </Section>
              ))}
              <Pressable
                style={styles.secondaryButton}
                onPress={() =>
                  setForm((f) => ({
                    ...f,
                    items: [
                      ...f.items,
                      {
                        name: `Item Title ${f.items.length + 1}`,
                        description: '',
                        quantity: '1',
                        amount: '1',
                      },
                    ],
                  }))
                }
                accessibilityRole="button"
              >
                <Text style={styles.secondaryButtonText}>Add new item</Text>
              </Pressable>
              <Text style={styles.total}>
                Total: {orderTotal(form.items)} {form.selectedCurrency}
              </Text>
            </>
          )}

          {tab === 'Transaction' && (
            <>
              <Section title="Transaction">
                <SelectField
                  label="Transaction mode"
                  options={TRANSACTION_MODES}
                  value={form.transactionMode}
                  onChange={set('transactionMode')}
                  hint="Charge now, or authorize now and capture / void later."
                />
                {form.transactionMode === 'authorize' && (
                  <>
                    <SelectField
                      label="Authorize type"
                      options={AUTHORIZE_TYPES}
                      value={form.authorizeType}
                      onChange={set('authorizeType')}
                      hint="What happens automatically when the time below elapses."
                    />
                    <TextField
                      label="Auto action after (hours)"
                      value={form.autoTimeHours}
                      onChange={set('autoTimeHours')}
                      keyboardType="number-pad"
                    />
                  </>
                )}
                <YesNoField
                  label="3D Secure"
                  value={form.threeDSecure}
                  onChange={set('threeDSecure')}
                />
                <YesNoField
                  label="Save card"
                  value={form.saveCard}
                  onChange={set('saveCard')}
                />
                <TextField
                  label="Redirect URL"
                  value={form.redirectUrl}
                  onChange={set('redirectUrl')}
                  keyboardType="url"
                  hint="Where the customer returns after a redirect-based payment."
                />
                <TextField
                  label="Hash string"
                  value={form.hashString}
                  onChange={set('hashString')}
                  placeholder="Optional"
                  hint="Request hash generated server-side with your secret key."
                />
              </Section>
              <Section title="Presentation">
                <SelectField
                  label="Theme"
                  options={THEME_OPTIONS}
                  value={form.theme}
                  onChange={set('theme')}
                />
                <SelectField
                  label="Checkout mode"
                  options={CHECKOUT_MODES}
                  value={form.checkoutMode}
                  onChange={set('checkoutMode')}
                  hint="Web only — the Android wrapper always uses page."
                />
                <YesNoField
                  label="Apple Pay available on client"
                  value={form.isApplePayAvailableOnClient}
                  onChange={set('isApplePayAvailableOnClient')}
                  hint="iOS only; the Android wrapper sets it to No."
                />
              </Section>
              <Section title="Agreed payment">
                <YesNoField
                  label="Agreed (recurring) payment"
                  value={form.agreedPayment}
                  onChange={set('agreedPayment')}
                />
                {form.agreedPayment && (
                  <>
                    <SelectField
                      label="Agreement type"
                      options={AGREEMENT_TYPES}
                      value={form.agreementType}
                      onChange={set('agreementType')}
                    />
                    {form.agreementType === 'SCHEDULED' && (
                      <>
                        <SelectField
                          label="Amount variability"
                          options={AMOUNT_VARIABILITIES}
                          value={form.amountVariability}
                          onChange={set('amountVariability')}
                        />
                        <SelectField
                          label="Number of payments"
                          options={NUMBER_OF_PAYMENTS}
                          value={form.numberOfPayments}
                          onChange={set('numberOfPayments')}
                          hint="Undefined sends txn_count 0."
                        />
                        {form.numberOfPayments === 'Defined' && (
                          <TextField
                            label="Payments count (txn_count)"
                            value={form.txnCount}
                            onChange={set('txnCount')}
                            keyboardType="number-pad"
                          />
                        )}
                      </>
                    )}
                    <TextField
                      label="Apple Pay — subscription name"
                      value={form.applePayBillingLabel}
                      onChange={set('applePayBillingLabel')}
                    />
                    <TextField
                      label="Apple Pay — subscription description"
                      value={form.applePayPaymentDescription}
                      onChange={set('applePayPaymentDescription')}
                      multiline
                    />
                    <TextField
                      label="Apple Pay — billing agreement"
                      value={form.applePayBillingAgreement}
                      onChange={set('applePayBillingAgreement')}
                      multiline
                    />
                    <TextField
                      label="Apple Pay — management URL"
                      value={form.applePayManagementUrl}
                      onChange={set('applePayManagementUrl')}
                      keyboardType="url"
                    />
                    <TextField
                      label="Apple Pay — token notification URL"
                      value={form.applePayTokenNotificationUrl}
                      onChange={set('applePayTokenNotificationUrl')}
                      keyboardType="url"
                    />
                  </>
                )}
              </Section>
              <Section title="Airline">
                <YesNoField
                  label="Airline booking"
                  value={form.airline}
                  onChange={set('airline')}
                />
                {form.airline && (
                  <TextField
                    label="Booking reference"
                    value={form.airlineBookingReference}
                    onChange={set('airlineBookingReference')}
                  />
                )}
              </Section>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => setForm(defaultForm)}
                accessibilityRole="button"
              >
                <Text style={styles.secondaryButtonText}>
                  Reset all to defaults
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const monospace = Platform.select({ ios: 'Menlo', default: 'monospace' });

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
    alignItems: 'center',
    gap: 8,
  },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  status: { fontSize: 14, textAlign: 'center', color: '#666' },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonSpinner: { marginRight: 10 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  tabs: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: '#e5e5ea' },
  tabsContent: { paddingHorizontal: 12 },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabOn: { borderBottomColor: '#007AFF' },
  tabText: { fontSize: 14, color: '#666' },
  tabTextOn: { color: '#007AFF', fontWeight: '600' },
  form: { flex: 1 },
  formContent: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#666',
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 8,
  },
  secondaryButtonText: { color: '#007AFF', fontWeight: '600' },
  remove: { color: '#c0392b', fontSize: 13, marginTop: -4, marginBottom: 8 },
  total: { marginTop: 16, fontSize: 15, fontWeight: '600', color: '#0a58ca' },
  logPane: { flex: 1, paddingHorizontal: 20 },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 14,
    marginBottom: 8,
  },
  logClear: { fontSize: 14, color: '#007AFF' },
  logClearOff: { opacity: 0.35 },
  log: {
    flex: 1,
    backgroundColor: '#f2f2f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  logContent: { padding: 12, gap: 10 },
  logEmpty: { fontSize: 13, color: '#888' },
  logRow: { gap: 2 },
  logTime: { fontFamily: monospace, fontSize: 11, color: '#888' },
  logElapsed: { color: '#007AFF', fontWeight: '600' },
  logMessage: { fontSize: 14, color: '#222' },
  logDetail: {
    fontFamily: monospace,
    fontSize: 11,
    color: '#555',
    marginTop: 2,
  },
});
