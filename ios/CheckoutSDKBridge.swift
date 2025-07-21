//
//  CheckoutSDKBridge.swift
//  CheckoutReactNative
//
//  Created by MahmoudShaabanAllam on 21/07/2025.
//

import Foundation
import Checkout_IOS
import UIKit
import React

@objc(CheckoutSDKBridge)
public class CheckoutSDKBridge: NSObject {
  private var onCheckoutSuccess: RCTResponseSenderBlock?
  private var onCheckoutError: RCTResponseSenderBlock?
  private var onCheckoutClose: RCTResponseSenderBlock?
  private var onCheckoutReady: RCTResponseSenderBlock?
  
  @objc public func startCheckout(
    configurations: [String: Any],
    onSuccess: @escaping RCTResponseSenderBlock,
    onError: @escaping RCTResponseSenderBlock,
    onClose: @escaping RCTResponseSenderBlock,
    onReady: @escaping RCTResponseSenderBlock
  ) {
    self.onCheckoutSuccess = onSuccess
    self.onCheckoutError = onError
    self.onCheckoutClose = onClose
    self.onCheckoutReady = onReady
    
    DispatchQueue.main.async {
      // Start the checkout SDK
      CheckoutSDK().start(configurations: configurations, delegate: self)
    }
  }
}

// MARK: - CheckoutSDKDelegate
extension CheckoutSDKBridge: CheckoutSDKDelegate {
  public func onClose() {
     onCheckoutClose?([])
   }
   
   public func onReady() {
     onCheckoutReady?([])
   }
   
   public func onSuccess(data: String) {
     onCheckoutSuccess?([data])
   }
   
   public func onError(data: String) {
     onCheckoutError?([data])
   }
   
   public var controller: UIViewController {
     // Return the root view controller for the SDK to present on
     guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first else {
       return UIViewController()
     }
     return window.rootViewController ?? UIViewController()
   }
}
