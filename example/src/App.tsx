import { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { startCheckout } from 'checkout-react-native';
import type { CheckoutCallbacks } from 'checkout-react-native';

export default function App() {
  const [status, setStatus] = useState('Ready to start checkout');

  const handleStartCheckout = () => {
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
        console.log('Checkout success:', data);
      },
      onError: (error: string) => {
        setStatus(`Checkout error: ${error}`);
        console.log('Checkout error:', error);
      },
      onClose: () => {
        setStatus('Checkout closed');
        console.log('Checkout closed');
      },
      onReady: () => {
        setStatus('Checkout ready');
        console.log('Checkout ready');
      },
    };

    startCheckout(configurations, callbacks);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout React Native Example</Text>
      <Text style={styles.status}>{status}</Text>
      <TouchableOpacity style={styles.button} onPress={handleStartCheckout}>
        <Text style={styles.buttonText}>Start Checkout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
