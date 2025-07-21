package com.checkoutreactnative

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.Callback
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = CheckoutReactNativeModule.NAME)
class CheckoutReactNativeModule(reactContext: ReactApplicationContext) :
  NativeCheckoutReactNativeSpec(reactContext) {

  override fun getName(): String {
    return NAME
  }

  override fun startCheckout(
    configurations: ReadableMap,
    onSuccess: Callback,
    onError: Callback,
    onClose: Callback,
    onReady: Callback
  ) {
    // TODO: Implement Android checkout SDK integration
    // For now, just call onReady to indicate the method is working
    onReady.invoke()
  }

  companion object {
    const val NAME = "CheckoutReactNative"
  }
}
