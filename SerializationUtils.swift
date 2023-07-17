//
//  SerializationUtils.swift
//  react-native-checkout
//
//  Created by MahmoudShaabanAllam on 16/07/2023.
//

import Foundation
import CheckoutSDK_iOS
import CommonDataModelsKit_iOS
import TapUIKit_iOS
import LocalisationManagerKit_iOS
import PassKit
import TapApplePayKit_iOS

class CheckoutConfig: Decodable {
    var localeIdentifier: String = "en"
    var currency:TapCurrencyCode = .USD
    var supportedCurrencies:[String]? = nil
    var amount:Double = 1
    var items:[ItemModel] = []
    var applePayMerchantID:String = "merchant.tap.gosell"
    var swipeDownToDismiss:Bool = false
    var paymentType:TapPaymentType = .All
    var closeButtonStyle:CheckoutCloseButtonEnum = .title
    var showDragHandler:Bool = false
    var transactionMode: TransactionMode = .purchase
    var customer: TapCustomer = try! .init(identifier: "cus_TS031720211012r4RM0403926")
    var destinations: [Destination]? = nil
    var tapMerchantID: String? = nil
    var taxes:[Tax]? = nil
    var shipping:Shipping? = nil
    var allowedCardTypes: [CardType] = [CardType(cardType: .All)]
    var postURL:URL? = nil
    var paymentDescription: String? = nil
    var paymentMetadata: TapMetadata = [:]
    var paymentReference: Reference? = nil
    var paymentStatementDescriptor: String? = nil
    var require3DSecure: Bool = true
    var receiptSettings: Receipt? = nil
    var authorizeAction: AuthorizeAction = AuthorizeAction.default
    var allowsToSaveSameCardMoreThanOnce: Bool = true
    var enableSaveCard: Bool = true
    var isSaveCardSwitchOnByDefault: Bool = true
    var sdkMode:SDKMode = .sandbox
    var enableApiLogging:[Int] = [TapLoggingType.CONSOLE.rawValue]
    var collectCreditCardName:Bool = false
    var creditCardNameEditable:Bool = true
    var creditCardNamePreload:String = ""
    var showSaveCreditCard:SaveCardType = .None
    var isSubscription:Bool = false
    var recurringPaymentRequest:Any? = nil
    var flippingStatus: TapCheckoutFlipStatus
    var applePayButtonType:TapApplePayButtonType = .AppleLogoOnly
    var applePayButtonStyle:TapApplePayButtonStyleOutline = .Black
    var shouldFlipCardData:Bool = true
    var sandboxKey: String
    var productionKey: String
    // MARK: - Private -
    
    private enum CodingKeys: String, CodingKey {
        
        case currency = "currency"
        case supportedCurrencies = "supported_currencies"
        case amount = "amount"
        case items = "items"
        case applePayMerchantID = "apple_pay_merchant_id"
        case swipeDownToDismiss = "swipe_down_to_dismiss"
        case paymentType = "payment_type"
        case closeButtonStyle = "close_button_style"
        case showDragHandler = "show_drag_handler"
        case transactionMode = "transaction_mode"
        case customer = "customer"
        case destinations = "destinations"
        case tapMerchantID = "tap_merchant_id"
        case taxes = "taxes"
        case shipping = "shipping"
        case allowedCardTypes = "allowed_card_types"
        case postURL = "post_url"
        case paymentDescription = "payment_description"
        case paymentMetadata = "payment_metadata"
        case paymentReference = "payment_reference"
        case paymentStatementDescriptor = "payment_statement_descriptor"
        case require3DSecure = "require3_d_secure"
        case receiptSettings = "receipt_settings"
        case authorizeAction = "authorize_action"
        case allowsToSaveSameCardMoreThanOnce = "allows_to_save_same_card_more_than_once"
        case enableSaveCard = "enable_save_card"
        case isSaveCardSwitchOnByDefault = "is_save_card_switch_on_by_default"
        case sdkMode = "sdk_mode"
        case enableApiLogging = "enable_api_logging"
        case collectCreditCardName = "collect_credit_card_name"
        case creditCardNameEditable = "credit_card_name_editable"
        case creditCardNamePreload = "credit_card_name_preload"
        case showSaveCreditCard = "show_save_credit_card"
        case isSubscription = "is_subscription"
        case recurringPaymentRequest = "recurring_payment_request"
        case applePayButtonType = "apple_pay_button_type"
        case applePayButtonStyle = "apple_pay_button_style"
        case shouldFlipCardData = "should_flip_card_data"
        case productionKey = "production_key"
        case sandboxKey = "sandbox_key"
        case localeIdentifier = "locale_identifier"
        case flippingStatus = "flipping_status"
    }
    
    required init(from decoder: Decoder) throws {
        
        var container = try decoder.container(keyedBy: CodingKeys.self)
        
        self.currency = try container.decode(TapCurrencyCode.self, forKey: .currency)
        self.productionKey = try container.decode(String.self, forKey: .productionKey)
        self.sandboxKey = try container.decode(String.self, forKey: .sandboxKey)
        self.supportedCurrencies = try container.decode([String].self, forKey: .supportedCurrencies)
        self.amount = try container.decode(Double.self, forKey: .amount)
        self.items = try container.decode([ItemModel].self, forKey: .items)
        self.applePayMerchantID = try container.decode(String.self, forKey: .applePayMerchantID)
        self.swipeDownToDismiss = try container.decode(Bool.self, forKey: .swipeDownToDismiss)
        self.paymentType = try container.decode(TapPaymentType.self, forKey: .paymentType)
        self.closeButtonStyle = try container.decode(CheckoutCloseButtonEnum.self, forKey: .closeButtonStyle)
        self.showDragHandler = try container.decode(Bool.self, forKey: .showDragHandler)
        self.transactionMode = try container.decode( TransactionMode.self, forKey: .transactionMode)
        self.customer = try container.decode( TapCustomer.self, forKey: .customer)
        self.destinations = try container.decodeIfPresent([Destination].self, forKey: .destinations)
        self.tapMerchantID = try container.decodeIfPresent(String.self, forKey: .tapMerchantID)
        self.taxes = try container.decodeIfPresent([Tax].self, forKey: .taxes)
        self.shipping = try container.decodeIfPresent(Shipping.self, forKey: .shipping)
        self.allowedCardTypes = try container.decode( [CardType].self, forKey: .allowedCardTypes)
        self.postURL = try container.decodeIfPresent(URL.self, forKey: .postURL)
        self.paymentDescription = try container.decodeIfPresent( String.self, forKey: .paymentDescription)
        self.paymentMetadata = try container.decode( TapMetadata.self, forKey: .paymentMetadata)
        self.paymentReference = try container.decodeIfPresent( Reference.self, forKey: .paymentReference)
        self.paymentStatementDescriptor = try container.decodeIfPresent( String.self, forKey: .paymentStatementDescriptor)
        self.require3DSecure = try container.decode( Bool.self, forKey: .require3DSecure)
        self.receiptSettings = try container.decodeIfPresent( Receipt.self, forKey: .receiptSettings)
        self.authorizeAction = try container.decode( AuthorizeAction.self, forKey: .authorizeAction)
        self.allowsToSaveSameCardMoreThanOnce = try container.decode( Bool.self, forKey: .allowsToSaveSameCardMoreThanOnce)
        self.enableSaveCard = try container.decode( Bool.self, forKey: .enableSaveCard)
        self.isSaveCardSwitchOnByDefault = try container.decode( Bool.self, forKey: .isSaveCardSwitchOnByDefault)
        self.sdkMode = try container.decode(SDKMode.self, forKey: .sdkMode)
        self.enableApiLogging = try container.decode([Int].self, forKey: .enableApiLogging)
        self.collectCreditCardName = try container.decode(Bool.self, forKey: .collectCreditCardName)
        self.creditCardNameEditable = try container.decode(Bool.self, forKey: .creditCardNameEditable)
        self.creditCardNamePreload = try container.decode(String.self, forKey: .creditCardNamePreload)
        self.showSaveCreditCard = try container.decode(SaveCardType.self, forKey: .showSaveCreditCard)
        self.isSubscription = try container.decode(Bool.self, forKey: .isSubscription)
        self.recurringPaymentRequest = try container.decode([String : String].self, forKey: .recurringPaymentRequest)
        self.applePayButtonType = try container.decode(TapApplePayButtonType.self, forKey: .applePayButtonType)
        self.applePayButtonStyle = try container.decode(TapApplePayButtonStyleOutline.self, forKey: .applePayButtonStyle)
        self.shouldFlipCardData = try container.decode(Bool.self, forKey: .shouldFlipCardData)
        self.localeIdentifier = try container.decode(String.self, forKey: .localeIdentifier)
        self.flippingStatus = try container.decode(TapCheckoutFlipStatus.self, forKey: .flippingStatus)
    }
}

// MARK: - Codable
extension TapCheckoutFlipStatus: Codable {
    
}

extension TapApplePayButtonType: Codable {
    
}

extension TapApplePayButtonStyleOutline: Codable {
    
}
extension CheckoutCloseButtonEnum: Codable {
    
}

