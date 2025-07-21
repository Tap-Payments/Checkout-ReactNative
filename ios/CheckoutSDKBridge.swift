//
//  CheckoutSDKBridge.swift
//  CheckoutReactNative
//
//  Created by MahmoudShaabanAllam on 21/07/2025.
//

import Foundation
import Checkout_IOS

@objc(CheckoutSDKBridge)
public class CheckoutSDKBridge: NSObject {
  @objc public func multiply(_ a : Double, _ b : Double) -> NSNumber {
    return a * b as NSNumber
  }
}
