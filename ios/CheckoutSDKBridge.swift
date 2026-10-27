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
  private var onCheckoutChargeCreated: ((String) -> Void)?

  @objc public func startCheckout(
    configurations: [String: Any],
    onSuccess: @escaping RCTResponseSenderBlock,
    onError: @escaping RCTResponseSenderBlock,
    onClose: @escaping RCTResponseSenderBlock,
    onReady: @escaping RCTResponseSenderBlock,
    onChargeCreated: @escaping (String) -> Void
  ) {
    self.onCheckoutSuccess = onSuccess
    self.onCheckoutError = onError
    self.onCheckoutClose = onClose
    self.onCheckoutReady = onReady
    self.onCheckoutChargeCreated = onChargeCreated
    
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

   public func onChargeCreated(data: String) {
     // Sent as an event, so it fires for every charge (e.g. again after coming back from KNET)
     onCheckoutChargeCreated?(data)
   }
   
   public var controller: UIViewController {
     // Present on the top-most view controller, so the sheet also opens over a React Native modal
     guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first(where: { $0.isKeyWindow }) ?? windowScene.windows.first,
           var top = window.rootViewController else {
       return UIViewController()
     }
     while let presented = top.presentedViewController { top = presented }
     return top
   }
}
