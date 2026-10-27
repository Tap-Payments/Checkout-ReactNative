/**
 * A form with every input of the Tap web demo, grouped like its steps (SDK / User / Card / Order /
 * Transaction). Every change is saved immediately; "Show configuration JSON" displays exactly what
 * Start Checkout will pass to the SDK. Same form as the native example apps.
 */

import { useReducer, useRef } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { KeyboardTypeOptions } from 'react-native';
import {
  defaultSettings,
  formatAmount,
  makeConfiguration,
  newItem,
  totalAmount,
  type CheckoutSettings,
  type Configuration,
} from '../CheckoutSettings';
import { LocalKeys, type LocalKey } from '../LocalKeys';
import { COUNTRY_CODES } from '../countries';
import { usePalette } from '../theme';
import {
  FormSection,
  NavBar,
  SwitchRow,
  TextRow,
  ValueRow,
} from '../components/ui';

// MARK: Form model

/** A value offered by a choice row: `value` goes into the configuration, `title` is shown to the user. */
export interface Option {
  value: string;
  title: string;
}

const option = (value: string, title?: string): Option => ({
  value,
  title: title ?? value,
});

const CURRENCIES = [
  'KWD',
  'BHD',
  'SAR',
  'AED',
  'OMR',
  'EGP',
  'GBP',
  'USD',
  'EUR',
];

const countryName = (() => {
  try {
    const names = new Intl.DisplayNames(['en'], { type: 'region' });
    return (code: string) => names.of(code);
  } catch {
    return () => undefined;
  }
})();

export const Options = {
  currencies: CURRENCIES.map((value) => option(value)),
  supportedCurrencies: ['ALL', 'AUTO', ...CURRENCIES].map((value) =>
    option(value)
  ),
  paymentTypes: ['ALL', 'WEB', 'CARD', 'DEVICE'].map((value) => option(value)),
  paymentMethods: [
    'ALL',
    'AMERICAN_EXPRESS',
    'APPLE_PAY',
    'BENEFIT',
    'BENEFITPAY',
    'CAREEMPAY',
    'FAWRY',
    'GOOGLE_PAY',
    'KNET',
    'MADA',
    'MASTERCARD',
    'MEEZA',
    'OMANNET',
    'PAYPAL',
    'POST_PAY',
    'NAPS',
    'STC_PAY',
    'TABBY',
    'VISA',
  ].map((value) => option(value)),
  languages: ['auto', 'en', 'ar'].map((value) => option(value)),
  regions: ['LOCAL', 'REGIONAL', 'GLOBAL'].map((value) => option(value)),
  supportedPaymentTypes: [
    'CARD',
    'DEVICE_WALLET',
    'EXPRESS_CHECKOUT_WALLET',
    'PASS_THRU_WALLET',
    'STORED_VALUE_WALLET',
    'CASH_WALLET',
    'BNPL',
  ].map((value) => option(value)),
  schemes: [
    'BENEFIT',
    'VISA',
    'AMEX',
    'MASTERCARD',
    'MADA',
    'MEEZA',
    'OMANNET',
  ].map((value) => option(value)),
  /** ISO 3166-1 alpha-2 codes, titled with the country name. */
  countries: [...COUNTRY_CODES].sort().map((code) => {
    const name = countryName(code);
    return option(code, name ? `${code} - ${name}` : code);
  }),
  fundingSources: ['all', 'credit', 'debit'].map((value) => option(value)),
  saveCardOptions: ['all', 'merchant', 'tap', 'none'].map((value) =>
    option(value)
  ),
  discountTypes: [option('F', 'Fixed amount'), option('P', 'Percentage')],
  modes: [option('charge', 'Charge'), option('authorize', 'Authorize')],
  themes: ['light', 'dark', 'light_mono', 'dark_colored', 'auto'].map((value) =>
    option(value)
  ),
  checkoutModes: ['popup', 'page'].map((value) => option(value)),
  authorizeTypes: ['CAPTURE', 'VOID'].map((value) => option(value)),
  agreementTypes: ['SCHEDULED', 'UNSCHEDULED'].map((value) => option(value)),
  amountVariabilities: ['FIXED', 'VARIABLE'].map((value) => option(value)),
  numbersOfPayments: ['Defined', 'Undefined'].map((value) => option(value)),
  airline: [
    option('', 'Not set (sent empty)'),
    option('yes', 'Yes'),
    option('no', 'No'),
  ],
};

type Keys<T> = {
  [K in keyof CheckoutSettings]: CheckoutSettings[K] extends T ? K : never;
}[keyof CheckoutSettings];

type Row =
  | {
      kind: 'text';
      title: string;
      get: () => string;
      set: (value: string) => void;
      keyboard?: KeyboardTypeOptions;
    }
  | {
      kind: 'decimal';
      title: string;
      get: () => number;
      set: (value: number) => void;
    }
  | {
      kind: 'integer';
      title: string;
      get: () => number;
      set: (value: number) => void;
    }
  | { kind: 'toggle'; title: string; key: Keys<boolean> }
  | { kind: 'choice'; title: string; key: Keys<string>; options: Option[] }
  | {
      kind: 'multiChoice';
      title: string;
      key: Keys<string[]>;
      options: Option[];
    }
  | { kind: 'info'; title: string; value: string }
  | {
      kind: 'button';
      title: string;
      onPress: () => void;
      destructive?: boolean;
    }
  | { kind: 'disclosure'; title: string; detail?: string; onPress: () => void };

interface Section {
  title: string;
  footer?: string;
  rows: Row[];
}

export interface PickerRequest {
  title: string;
  options: Option[];
  selection: string[];
  allowsMultiple: boolean;
  onChange: (selection: string[]) => void;
}

// MARK: Settings screen

export function SettingsScreen({
  settings,
  onChange,
  onBack,
  onPick,
  onShowJSON,
}: {
  settings: CheckoutSettings;
  onChange: (settings: CheckoutSettings) => void;
  onBack: () => void;
  onPick: (request: PickerRequest) => void;
  onShowJSON: (configuration: Configuration) => void;
}) {
  const palette = usePalette();
  const update = (change: Partial<CheckoutSettings>) =>
    onChange({ ...settings, ...change });
  const updateItem = (
    index: number,
    change: Partial<CheckoutSettings['items'][number]>
  ) =>
    update({
      items: settings.items.map((item, i) =>
        i === index ? { ...item, ...change } : item
      ),
    });

  const currentSavedKey: LocalKey | undefined = LocalKeys.all.find(
    (key) =>
      key.publicKey === settings.publicKey &&
      (key.merchantId ?? '') === settings.merchantId
  );

  const pickSavedKey = () => {
    const keys = LocalKeys.all;
    const current = currentSavedKey ? keys.indexOf(currentSavedKey) : -1;
    onPick({
      title: 'Saved Keys',
      options: keys.map((key, index) => option(String(index), key.name)),
      selection: current >= 0 ? [String(current)] : [],
      allowsMultiple: false,
      onChange: ([index]) => {
        const key = keys[Number(index)];
        if (key)
          update({
            publicKey: key.publicKey,
            merchantId: key.merchantId ?? '',
          });
      },
    });
  };

  const reset = () =>
    Alert.alert(
      'Reset to defaults?',
      'All settings go back to the web demo defaults.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => onChange(defaultSettings()),
        },
      ]
    );

  // MARK: Sections (the form follows the web demo's wizard)

  // Saved Keys appears only when keys.local.json has keys (debug builds).
  const savedKeys: Row[] =
    LocalKeys.all.length === 0
      ? []
      : [
          {
            kind: 'disclosure',
            title: 'Saved Keys',
            detail: currentSavedKey?.name ?? 'Custom',
            onPress: pickSavedKey,
          },
        ];

  const text = (
    title: string,
    key: Keys<string>,
    keyboard?: KeyboardTypeOptions
  ): Row => ({
    kind: 'text',
    title,
    keyboard,
    get: () => settings[key],
    set: (value) => update({ [key]: value }),
  });

  const sdkSection: Section = {
    title: 'SDK Configuration',
    footer:
      'Defaults to the key in Keys.ts. Under each public key there can be several merchant ids; use the one that belongs to it.',
    rows: [
      ...savedKeys,
      text('Public Key', 'publicKey'),
      text('Merchant Id', 'merchantId'),
      {
        kind: 'multiChoice',
        title: 'Supported Currencies',
        key: 'supportedCurrencies',
        options: Options.supportedCurrencies,
      },
      {
        kind: 'choice',
        title: 'Payment Type',
        key: 'paymentType',
        options: Options.paymentTypes,
      },
      {
        kind: 'multiChoice',
        title: 'Supported Payment Methods',
        key: 'supportedPaymentMethods',
        options: Options.paymentMethods,
      },
      {
        kind: 'choice',
        title: 'Selected Currency',
        key: 'selectedCurrency',
        options: Options.currencies,
      },
      {
        kind: 'choice',
        title: 'Language',
        key: 'language',
        options: Options.languages,
      },
      {
        kind: 'multiChoice',
        title: 'Supported Regions',
        key: 'supportedRegions',
        options: Options.regions,
      },
      {
        kind: 'multiChoice',
        title: 'Supported Countries',
        key: 'supportedCountries',
        options: Options.countries,
      },
      {
        kind: 'multiChoice',
        title: 'Supported Payment Types',
        key: 'supportedPaymentTypes',
        options: Options.supportedPaymentTypes,
      },
      {
        kind: 'multiChoice',
        title: 'Supported Schemes',
        key: 'supportedSchemes',
        options: Options.schemes,
      },
      {
        kind: 'toggle',
        title: 'Apple Pay Available On Client',
        key: 'isApplePayAvailableOnClient',
      },
    ],
  };

  const userSection: Section = {
    title: 'User Configuration',
    rows: [
      text('Customer ID', 'customerId'),
      text('First Name', 'firstName'),
      text('Last Name', 'lastName'),
      text('Customer E-mail', 'email', 'email-address'),
      text('Customer Country Code', 'countryCode', 'number-pad'),
      text('Customer phone number', 'phoneNumber', 'phone-pad'),
    ],
  };

  const cardSection: Section = {
    title: 'Card Configuration',
    rows: [
      { kind: 'toggle', title: 'Show Brands', key: 'showBrands' },
      { kind: 'toggle', title: 'Show Loading State', key: 'showLoadingState' },
      {
        kind: 'toggle',
        title: 'Collect Card Holder Name',
        key: 'collectHolderName',
      },
      text('PreLoad CardName', 'preLoadCardName'),
      { kind: 'toggle', title: 'CardName Editable', key: 'cardNameEditable' },
      {
        kind: 'choice',
        title: 'Card Funding Source',
        key: 'cardFundingSource',
        options: Options.fundingSources,
      },
      {
        kind: 'choice',
        title: 'Save Card Options',
        key: 'saveCardOption',
        options: Options.saveCardOptions,
      },
      { kind: 'toggle', title: 'Force LTR', key: 'forceLtr' },
      { kind: 'toggle', title: 'Card Scanner', key: 'cardScanner' },
      ...(Platform.OS === 'android'
        ? [
            {
              kind: 'toggle',
              title: 'Card NFC (Android only)',
              key: 'cardNFC',
            } as Row,
          ]
        : []),
    ],
  };

  const orderRows: Row[] = [
    text('Order ID', 'orderId'),
    {
      kind: 'choice',
      title: 'Order discount type',
      key: 'discountType',
      options: Options.discountTypes,
    },
    {
      kind: 'decimal',
      title: 'Order discount value',
      get: () => settings.discountValue,
      set: (value) => update({ discountValue: value }),
    },
  ];
  settings.items.forEach((item, index) => {
    const number = index + 1;
    orderRows.push(
      {
        kind: 'text',
        title: `Order ${number} Name`,
        get: () => item.name,
        set: (value) => updateItem(index, { name: value }),
      },
      {
        kind: 'text',
        title: `Order ${number} Description`,
        get: () => item.description,
        set: (value) => updateItem(index, { description: value }),
      },
      {
        kind: 'integer',
        title: `Order ${number} Quantity`,
        get: () => item.quantity,
        set: (value) => updateItem(index, { quantity: value }),
      },
      {
        kind: 'decimal',
        title: `Order ${number} Amount`,
        get: () => item.amount,
        set: (value) => updateItem(index, { amount: value }),
      }
    );
    // The web demo needs at least one item.
    if (settings.items.length > 1) {
      orderRows.push({
        kind: 'button',
        title: `Remove item ${number}`,
        destructive: true,
        onPress: () =>
          update({ items: settings.items.filter((_, i) => i !== index) }),
      });
    }
  });
  orderRows.push(
    {
      kind: 'button',
      title: 'Add New Item',
      onPress: () => update({ items: [...settings.items, newItem()] }),
    },
    {
      kind: 'info',
      title: 'Total to pay',
      value: `${formatAmount(totalAmount(settings))} ${settings.selectedCurrency}`,
    }
  );
  const orderSection: Section = {
    title: 'Order Configuration',
    footer: 'Total = items minus the discount (1 if the result is 0 or less).',
    rows: orderRows,
  };

  const transactionRows: Row[] = [
    {
      kind: 'choice',
      title: 'Transaction Mode',
      key: 'mode',
      options: Options.modes,
    },
  ];
  if (settings.mode === 'authorize') {
    transactionRows.push(
      {
        kind: 'choice',
        title: 'Authorize Type',
        key: 'authorizeType',
        options: Options.authorizeTypes,
      },
      {
        kind: 'integer',
        title: 'Authorize Time (hours)',
        get: () => settings.authorizeTime,
        set: (value) => update({ authorizeTime: value }),
      }
    );
  }
  transactionRows.push(
    { kind: 'choice', title: 'Theme', key: 'theme', options: Options.themes },
    {
      kind: 'choice',
      title: 'Checkout Mode',
      key: 'checkoutMode',
      options: Options.checkoutModes,
    },
    { kind: 'toggle', title: '3D Secure', key: 'threeDSecure' },
    { kind: 'toggle', title: 'Save Card', key: 'saveCard' },
    text('Redirect URL', 'redirectUrl', 'url'),
    text('Hashstring', 'hashString'),
    { kind: 'toggle', title: 'Agreed payment', key: 'agreedPayment' }
  );
  if (settings.agreedPayment) {
    transactionRows.push({
      kind: 'choice',
      title: 'Agreement Type',
      key: 'agreementType',
      options: Options.agreementTypes,
    });
    if (settings.agreementType === 'SCHEDULED') {
      transactionRows.push(
        {
          kind: 'choice',
          title: 'Amount Variability',
          key: 'amountVariability',
          options: Options.amountVariabilities,
        },
        {
          kind: 'choice',
          title: 'Number of payments',
          key: 'numberOfPayments',
          options: Options.numbersOfPayments,
        }
      );
      if (settings.numberOfPayments === 'Defined') {
        transactionRows.push({
          kind: 'integer',
          title: 'Count',
          get: () => settings.paymentCount,
          set: (value) => update({ paymentCount: value }),
        });
      }
    }
    transactionRows.push(
      text('Subscription Name', 'subscriptionName'),
      text('Subscription Description', 'subscriptionDescription'),
      text('Billing Agreement', 'billingAgreement')
    );
  }
  transactionRows.push({
    kind: 'choice',
    title: 'Airline',
    key: 'airline',
    options: Options.airline,
  });
  if (settings.airline === 'yes') {
    transactionRows.push(text('Booking Reference Number', 'bookingReference'));
  }
  const transactionSection: Section = {
    title: 'Transaction Configuration',
    rows: transactionRows,
  };

  const sections = [
    sdkSection,
    userSection,
    cardSection,
    orderSection,
    transactionSection,
  ];

  // MARK: Rows

  const renderRow = (row: Row, index: number) => {
    const first = index === 0;
    const key = `${row.kind}-${row.title}`;
    switch (row.kind) {
      case 'text':
        return (
          <TextRow
            key={key}
            first={first}
            title={row.title}
            value={row.get()}
            keyboardType={row.keyboard}
            onChangeText={row.set}
          />
        );
      case 'decimal':
        return (
          <NumberRow
            key={key}
            first={first}
            title={row.title}
            value={row.get()}
            decimal
            onChange={row.set}
          />
        );
      case 'integer':
        return (
          <NumberRow
            key={key}
            first={first}
            title={row.title}
            value={row.get()}
            onChange={row.set}
          />
        );
      case 'toggle':
        return (
          <SwitchRow
            key={key}
            first={first}
            title={row.title}
            value={settings[row.key]}
            onValueChange={(value) => update({ [row.key]: value })}
          />
        );
      case 'choice': {
        const value = settings[row.key];
        const selected = row.options.find(
          (candidate) => candidate.value === value
        );
        return (
          <ValueRow
            key={key}
            first={first}
            title={row.title}
            detail={selected?.title ?? value}
            rowStyle="disclosure"
            onPress={() =>
              onPick({
                title: row.title,
                options: row.options,
                selection: [value],
                allowsMultiple: false,
                onChange: ([picked]) => update({ [row.key]: picked ?? '' }),
              })
            }
          />
        );
      }
      case 'multiChoice': {
        const selected = settings[row.key];
        const detail =
          selected.length === 0
            ? 'None'
            : selected.length <= 2
              ? selected.join(', ')
              : `${selected.length} selected`;
        return (
          <ValueRow
            key={key}
            first={first}
            title={row.title}
            detail={detail}
            rowStyle="disclosure"
            onPress={() =>
              onPick({
                title: row.title,
                options: row.options,
                selection: selected,
                allowsMultiple: true,
                onChange: (picked) => update({ [row.key]: picked }),
              })
            }
          />
        );
      }
      case 'info':
        return (
          <ValueRow
            key={key}
            first={first}
            title={row.title}
            detail={row.value}
            rowStyle="plain"
          />
        );
      case 'button':
        return (
          <ValueRow
            key={key}
            first={first}
            title={row.title}
            rowStyle={row.destructive ? 'destructive' : 'action'}
            onPress={row.onPress}
          />
        );
      case 'disclosure':
        return (
          <ValueRow
            key={key}
            first={first}
            title={row.title}
            detail={row.detail}
            rowStyle="disclosure"
            onPress={row.onPress}
          />
        );
    }
  };

  return (
    <View
      style={[styles.screen, { backgroundColor: palette.screenBackground }]}
    >
      <NavBar title="Settings" onBack={onBack} />
      <ScrollView
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        {sections.map((section) => (
          <FormSection
            key={section.title}
            title={section.title}
            footer={section.footer}
          >
            {section.rows.map(renderRow)}
          </FormSection>
        ))}
        <FormSection title="Tools">
          <ValueRow
            first
            title="Show configuration JSON"
            rowStyle="disclosure"
            onPress={() => onShowJSON(makeConfiguration(settings))}
          />
          <ValueRow
            title="Reset to defaults"
            rowStyle="destructive"
            onPress={reset}
          />
        </FormSection>
      </ScrollView>
    </View>
  );
}

/** A number field that keeps what is typed ("0." or "") until it parses, like the native text fields. */
function NumberRow({
  title,
  value,
  decimal,
  onChange,
  first,
}: {
  title: string;
  value: number;
  decimal?: boolean;
  onChange: (value: number) => void;
  first?: boolean;
}) {
  return (
    <DraftTextRow
      first={first}
      title={title}
      value={String(value)}
      keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
      parse={(text) => {
        const number = decimal
          ? Number(text.replace(',', '.'))
          : parseInt(text, 10);
        return Number.isFinite(number) ? number : 0;
      }}
      onChange={onChange}
    />
  );
}

function DraftTextRow({
  title,
  value,
  keyboardType,
  parse,
  onChange,
  first,
}: {
  title: string;
  value: string;
  keyboardType: KeyboardTypeOptions;
  parse: (text: string) => number;
  onChange: (value: number) => void;
  first?: boolean;
}) {
  const [draft, setDraft] = useDraft(value, parse);
  return (
    <TextRow
      first={first}
      title={title}
      value={draft}
      keyboardType={keyboardType}
      onChangeText={(text) => {
        setDraft(text);
        onChange(parse(text));
      }}
    />
  );
}

/** Shows the typed text while it still means the saved value, and the saved value otherwise. */
function useDraft(
  value: string,
  parse: (text: string) => number
): [string, (text: string) => void] {
  const ref = useRef<string | undefined>(undefined);
  if (ref.current === undefined || parse(ref.current) !== parse(value)) {
    ref.current = value;
  }
  const [, force] = useReducer((count: number) => count + 1, 0);
  return [
    ref.current,
    (text) => {
      ref.current = text;
      force();
    },
  ];
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 32 },
});
