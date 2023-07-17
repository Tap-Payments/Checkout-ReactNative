import CheckoutSDK_iOS
import CommonDataModelsKit_iOS
import TapUIKit_iOS
import LocalisationManagerKit_iOS
import PassKit
import React


@objc(Checkout)
class Checkout: RCTEventEmitter {
    
    let controller = RCTPresentedViewController()
    
    var hasListener: Bool = false
    
    override func startObserving() {
        hasListener = true
    }
    
    override func stopObserving() {
        hasListener = false
    }
    
    @objc
    func sendMyEvent(withName name: String, body: [String : Any]) {
        if hasListener {
            self.sendEvent(withName: name, body:body);
        }
    }
    
    @objc
    override func supportedEvents() -> [String]! {
        return [Constants.Events.tapBottomSheetWillDismiss,
                Constants.Events.tapBottomSheetPresented,
                Constants.Events.checkoutFailed,
                Constants.Events.checkoutCaptured,
                Constants.Events.checkoutCaptured,
                Constants.Events.checkoutFailed,
                Constants.Events.checkoutFailed,
                Constants.Events.cardTokenized,
                Constants.Events.applePayTokenizationFailed,
                Constants.Events.cardTokenizationFailed,
                Constants.Events.saveCardTokenizationFailed,
                Constants.Events.saveCardSuccessfull,
                Constants.Events.saveCardFailed,
                Constants.Events.saveNewCustomerDataForFurtherUsage,
        ];
    }
    
    @objc(multiply:withB:withResolver:withRejecter:)
    func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        resolve(a*b)
    }
    
    @objc(startPayment:withResolver:withRejecter:)
    func startPayment(arguments:NSDictionary, resolve:@escaping RCTPromiseResolveBlock,reject:@escaping RCTPromiseRejectBlock) -> Void {
        let jsonData = try! JSONSerialization.data(withJSONObject: arguments, options: [])
        let decoded = String(data: jsonData, encoding: .utf8)!
        let decoder = JSONDecoder()
        do {
            let args = try decoder.decode(CheckoutConfig.self, from: jsonData)
            DispatchQueue.main.async {
                let checkout:TapCheckout = .init()
                TapCheckout.flippingStatus = args.flippingStatus
                TapCheckout.localeIdentifier = args.localeIdentifier
                TapCheckout.secretKey = .init(sandbox: args.sandboxKey,
                                              production: args.productionKey)
                checkout.build(
                    delegate:self,
                    currency: args.currency,
                    supportedCurrencies: args.supportedCurrencies,
                    amount: args.amount,
                    items: args.items,
                    applePayMerchantID: args.applePayMerchantID,
                    swipeDownToDismiss: args.swipeDownToDismiss,
                    paymentType: args.paymentType,
                    closeButtonStyle: args.closeButtonStyle,
                    showDragHandler: args.showDragHandler,
                    transactionMode: args.transactionMode,
                    customer: args.customer,
                    destinations: args.destinations,
                    tapMerchantID: args.tapMerchantID,
                    taxes: args.taxes,
                    shipping: args.shipping,
                    allowedCardTypes: args.allowedCardTypes,
                    postURL: args.postURL,
                    paymentDescription: args.paymentDescription,
                    paymentMetadata: args.paymentMetadata,
                    paymentReference: args.paymentReference,
                    paymentStatementDescriptor: args.paymentStatementDescriptor,
                    require3DSecure: args.require3DSecure,
                    receiptSettings: args.receiptSettings,
                    authorizeAction: args.authorizeAction,
                    allowsToSaveSameCardMoreThanOnce: args.allowsToSaveSameCardMoreThanOnce,
                    enableSaveCard: args.enableSaveCard,
                    isSaveCardSwitchOnByDefault: args.isSaveCardSwitchOnByDefault,
                    sdkMode: args.sdkMode,
                    enableApiLogging: args.enableApiLogging,
                    collectCreditCardName: args.collectCreditCardName,
                    creditCardNameEditable: args.creditCardNameEditable,
                    creditCardNamePreload: args.creditCardNamePreload,
                    showSaveCreditCard: args.showSaveCreditCard,
                    isSubscription: args.isSubscription,
                    recurringPaymentRequest: args.recurringPaymentRequest,
                    applePayButtonType: args.applePayButtonType,
                    applePayButtonStyle: args.applePayButtonStyle,
                    onCheckOutReady: {[weak self] tapCheckOut in
                        DispatchQueue.main.async() { [self] in
                            resolve(arguments)
                            tapCheckOut.start(presentIn: self?.controller)
                        }
                    })
                
            }
        } catch {
            reject("Parsing error","\(error)","")
        }
    }
    
}

extension Checkout: CheckoutScreenDelegate {
    func applePayTokenizationFailed(in session:URLSessionDataTask?, for result:[String:String]?, with error:Error?) {
        let errorString: String =  error?.localizedDescription ?? ""
        self.sendMyEvent(withName: Constants.Events.applePayTokenizationFailed, body: ["response": result as Any, "error": errorString])
    }
    
    
    func cardTokenizationFailed(in session:URLSessionDataTask?, for result:[String:String]?, with error:Error?) {
        self.sendMyEvent(withName: Constants.Events.cardTokenizationFailed, body: ["response": result as Any, "error": error?.localizedDescription ?? ""])
    }
    
    
    func saveCardTokenizationFailed(in session:URLSessionDataTask?, for result:[String:String]?, with error:Error?) {
        self.sendMyEvent(withName: Constants.Events.saveCardTokenizationFailed, body: ["response": result as Any, "error": error?.localizedDescription ?? ""])
        
    }
    
    func saveCardFailed(with savedCard: TapCreateCardVerificationResponseModel) {
        self.sendMyEvent(withName: Constants.Events.saveCardFailed, body: ["response":  savedCard.dictionary])
        
    }
    
    
    
    func saveCardSuccessfull(with savedCard: TapCreateCardVerificationResponseModel) {
        self.sendMyEvent(withName: Constants.Events.saveCardSuccessfull, body: ["response":  savedCard.dictionary])
    }
    
    func cardTokenized(with token: Token) {
        self.sendMyEvent(withName: Constants.Events.cardTokenized, body: ["response":  token.dictionary])
    }
    
    func checkoutCaptured(with authorize: Authorize) {
        self.sendMyEvent(withName: Constants.Events.checkoutCaptured, body: ["response":  authorize.dictionary])
    }
    
    func checkoutCaptured(with charge: Charge) {
        self.sendMyEvent(withName: Constants.Events.checkoutCaptured, body: ["response":  charge.dictionary])
    }
    
    func saveNewCustomerDataForFurtherUsage(with customerID:String) {
        self.sendMyEvent(withName: Constants.Events.saveNewCustomerDataForFurtherUsage, body: ["response":  customerID])
    }
    
    func checkoutFailed(in session: URLSessionDataTask?, for result: [String : String]?, with error: Error?) {
        self.sendMyEvent(withName: Constants.Events.checkoutFailed, body: ["response": result as Any, "error": error?.localizedDescription ?? ""])
        
    }
    
    func checkoutFailed(with charge: Charge) {
        self.sendMyEvent(withName: Constants.Events.checkoutFailed, body: ["response":  charge.dictionary])
    }
    
    func checkoutFailed(with authorize: Authorize) {
        self.sendMyEvent(withName: Constants.Events.checkoutFailed, body: ["response":  authorize.dictionary])
        
    }
    
    
}

extension Encodable {
    var dictionary: [String: Any]? {
        guard let data = try? JSONEncoder().encode(self) else { return nil }
        return (try? JSONSerialization.jsonObject(with: data, options: .allowFragments)).flatMap { $0 as? [String: Any] }
    }
}

