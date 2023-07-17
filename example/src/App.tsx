import * as React from 'react';
import { useEffect } from 'react';

import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {
  startPayment,
  TapCurrencyCode,
  SdkMode,
  MerchantCapabilities,
  SaveCardType,
  TapApplePayButtonType,
  TapApplePayButtonStyleOutline,
  AuthorizeActionType,
  TapPaymentType,
  CheckoutCloseButtonEnum,
  TransactionMode,
  CheckoutEmitter,
  AllowedCardNetworks,
  AddressFormat,
  AddressType,
  CardType,
  TapCheckoutFlipStatus,
} from 'react-native-checkout';

export default function App() {
  const [result, setResult] = React.useState<string | undefined>();

  useEffect(() => {
    CheckoutEmitter.addListener('tapBottomSheetWillDismiss', (response) => {
      console.log('tapBottomSheetWillDismiss : ', response);
      setResult(JSON.stringify(response));
    });
    CheckoutEmitter.addListener('tapBottomSheetPresented', (response) => {
      console.log('tapBottomSheetPresented : ', response);
      setResult(JSON.stringify(response));
    });
    CheckoutEmitter.addListener('checkoutCaptured', (response) => {
      console.log('checkoutCaptured : ', response);
      setResult(JSON.stringify(response));
    });
    CheckoutEmitter.addListener('checkoutFailed', (response) => {
      console.log('checkoutFailed : ', response);
      setResult(JSON.stringify(response));
    });
    CheckoutEmitter.addListener('cardTokenized', (response) => {
      console.log('cardTokenized : ', response);
      setResult(JSON.stringify(response));
    });
    CheckoutEmitter.addListener('applePayTokenizationFailed', (response) => {
      console.log('applePayTokenizationFailed : ', response);
      setResult(JSON.stringify(response));
    });
    CheckoutEmitter.addListener('cardTokenizationFailed', (response) => {
      console.log('cardTokenizationFailed : ', response);
      setResult(JSON.stringify(response));
    });
    CheckoutEmitter.addListener('saveCardTokenizationFailed', (response) => {
      console.log('saveCardTokenizationFailed : ', response);
      setResult(JSON.stringify(response));
    });
    CheckoutEmitter.addListener('saveCardSuccessfull', (response) => {
      console.log('saveCardSuccessfull : ', response);
      setResult(JSON.stringify(response));
    });
    CheckoutEmitter.addListener('saveCardFailed', (response) => {
      console.log('saveCardFailed : ', response);
      setResult(JSON.stringify(response));
    });
    CheckoutEmitter.addListener(
      'saveNewCustomerDataForFurtherUsage',
      (response) => {
        setResult(JSON.stringify(response));

        console.log('saveNewCustomerDataForFurtherUsage : ', response);
      }
    );
  }, []);

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          startPayment({
            flippingStatus: TapCheckoutFlipStatus.flipOnLoadWithFlippingBack,
            localeIdentifier: 'ar',
            sandboxKey: 'pk_test_YhUjg9PNT8oDlKJ1aE2fMRz7',
            productionKey: 'sk_live_V4UDhitI0r7sFwHCfNB6xMKp',
            allowedCardNetworks: [AllowedCardNetworks.VISA],
            merchantId: '',
            merchantCapabilities: MerchantCapabilities.capability3DS,
            currency: TapCurrencyCode.EGP,
            supportedCurrencies: [TapCurrencyCode.EGP, TapCurrencyCode.KWD],
            amount: 10,
            items: [],
            // items: [
            //   {
            //     name: 'name',
            //     description: 'description',
            //     productId: 'productId',
            //     fulfillmentService: 'fulfillmentService',
            //     category: 'DIGITAL_GOODS',
            //     itemCode: 'striitemCodeng',
            //     tags: 'tags',
            //     accountCode: 'accountCode',
            //     vendor: { id: 'id', name: 'name' },
            //     requiresShipping: true,
            //     amount: 121,
            //     discount: [
            //       {
            //         type: AmountModificationType.Fixed,
            //         value: 12,
            //         minimumFee: 12,
            //         maximumFee: 12,
            //       },
            //     ],
            //     taxes: [
            //       {
            //         name: 'name',
            //         description: 'tate',
            //         rate: {
            //           type: AmountModificationType.Fixed,
            //           value: 12,
            //           minimumFee: 12,
            //           maximumFee: 12,
            //         },
            //       },
            //     ],
            //     quantity: 2,
            //     currency: TapCurrencyCode.EGP,
            //   },
            // ],
            applePayMerchantId: 'applePayMerchantID',
            swipeDownToDismiss: true,
            paymentType: TapPaymentType.Card,
            closeButtonStyle: CheckoutCloseButtonEnum.title,
            showDragHandler: true,
            transactionMode: TransactionMode.cardSaving,
            customer: {
              id: 'cus_TS031720211012r4RM0403926',
              email: 'mahmoud@tap.com',
              phone: { countryCode: '965', number: '00000000' },
              firstName: 'mahmoud',
              middleName: 'middleName',
              lastName: 'lastName',
              description: 'description',
              metadata: { metadata: 'ds' },
              title: 'title',
              nationality: 'nationality',
              currency: TapCurrencyCode.EGP,
              address: {
                format: AddressFormat.a,
                type: AddressType.commercial,
                country: 'EG',
                line1: 'ss',
                line2: 'ss',
                line3: 'ss',
                line4: 'ss',
                city: 'ss',
                state: 'ss',
                zipCode: 'ss',
                countryGovernorate: 'ss',
                area: 'ss',
                block: 'ss',
                avenue: 'ss',
                street: 'ss',
                building: 'ss',
                floor: 'ss',
                office: 'ss',
                apartment: 'ss',
                poBox: 'ss',
                postalCode: 'ss',
              },
              locale: 'locale',
            },
            allowedCardTypes: [{ cardType: CardType.Credit }],
            paymentMetadata: { metadata: 'ds' },
            require3DSecure: true,
            authorizeAction: {
              type: AuthorizeActionType.Capture,
              time: 0,
            },
            allowsToSaveSameCardMoreThanOnce: true,
            enableSaveCard: true,
            isSaveCardSwitchOnByDefault: true,
            sdkMode: SdkMode.production,
            enableApiLogging: [],
            collectCreditCardName: true,
            creditCardNameEditable: true,
            creditCardNamePreload: 'creditCardNamePreload',
            showSaveCreditCard: SaveCardType.None,
            isSubscription: true,
            applePayButtonType: TapApplePayButtonType.bookWithApplePay,
            applePayButtonStyle: TapApplePayButtonStyleOutline.WhiteOutline,
            shouldFlipCardData: true,
            recurringPaymentRequest: {},
          })
            .then((rest) => {
              setResult(JSON.stringify(rest));
            })
            .catch(() => {});
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  button: {
    height: 60,
    marginVertical: 20,
    alignSelf: 'stretch',
    backgroundColor: 'red',
  },
});
