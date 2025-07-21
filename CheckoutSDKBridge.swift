//
//  CheckoutSDKBridge.swift
//  CheckoutReactNative
//
//  Created by MahmoudShaabanAllam on 21/07/2025.
//

import Foundation

@objc(CheckoutSDKBridge)
public class CheckoutSDKBridge: NSObject {
  @objc public func multiply(_ a : NSNumber, _ b : NSNumber) -> NSNumber {
    return (a as! Decimal) * (b as! Decimal) as NSNumber
  }
}
