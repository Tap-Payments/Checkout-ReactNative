//
//  Constants.swift
//  react-native-checkout
//
//  Created by MahmoudShaabanAllam on 16/07/2023.
//

import Foundation

struct Constants {
    struct Events {
        static let tapBottomSheetWillDismiss = "tapBottomSheetWillDismiss"
        static let tapBottomSheetPresented = "tapBottomSheetPresented"
        static let checkoutCaptured = "checkoutCaptured"
        static let checkoutFailed = "checkoutFailed"
        static let cardTokenized = "cardTokenized"
        static let applePayTokenizationFailed = "applePayTokenizationFailed"
        static let cardTokenizationFailed = "cardTokenizationFailed"
        static let saveCardTokenizationFailed = "saveCardTokenizationFailed"
        static let saveCardSuccessfull = "saveCardSuccessfull"
        static let saveCardFailed = "saveCardFailed"
        static let saveNewCustomerDataForFurtherUsage = "saveNewCustomerDataForFurtherUsage"
    }
}
