package com.checkoutreactnative

import android.app.Activity
import android.view.LayoutInflater
import android.view.ViewGroup
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.module.annotations.ReactModule
import company.tap.tapcheckout_android.CheckoutConfiguration
import company.tap.tapcheckout_android.TapCheckout
import company.tap.tapcheckout_android.TapCheckoutStatusDelegate
import org.json.JSONArray
import org.json.JSONObject

@ReactModule(name = CheckoutReactNativeModule.NAME)
class CheckoutReactNativeModule(reactContext: ReactApplicationContext) :
  NativeCheckoutReactNativeSpec(reactContext) {

  private var tapCheckoutView: TapCheckout? = null
  private var fullscreenView: android.view.View? = null

  // Store callbacks as instance variables to preserve them
  private var onSuccessCallback: Callback? = null
  private var onErrorCallback: Callback? = null
  private var onCloseCallback: Callback? = null
  private var onReadyCallback: Callback? = null

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
    // Store callbacks as instance variables
    this.onSuccessCallback = onSuccess
    this.onErrorCallback = onError
    this.onCloseCallback = onClose
    this.onReadyCallback = onReady

    val currentActivity = currentActivity
    if (currentActivity == null) {
      onError.invoke("NO_ACTIVITY", "No activity available")
      return
    }

    UiThreadUtil.runOnUiThread {
      try {
        // Inflate the layout
        val view = LayoutInflater.from(currentActivity).inflate(R.layout.tap_checkout_kit_layout, null)
        tapCheckoutView = view.findViewById(R.id.redirect_pay)

        // Store reference for later removal
        fullscreenView = view

        // Set fullscreen layout parameters
        val layoutParams = ViewGroup.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.MATCH_PARENT
        )
        view.layoutParams = layoutParams

        // Add the view to activity's content view as fullscreen
        val contentView = currentActivity.findViewById<ViewGroup>(android.R.id.content)
        contentView.addView(view, layoutParams)

        // Convert configurations directly using recursive mapping
        val androidConfiguration = convertToSDKFormat(configurations.toHashMap())

        // Add Android-specific configurations
        androidConfiguration["open"] = true
        androidConfiguration["checkoutMode"] = "page"
        androidConfiguration["isApplePayAvailableOnClient"] = false

        // Handle transaction mode: if authorize mode, move charge data to authorize key
        handleTransactionMode(androidConfiguration)

        // Extract public key from configurations
        val gateway = configurations.getMap("gateway")
        val publicKey = gateway?.getString("publicKey") ?: ""

        if (publicKey.isEmpty()) {
          onError.invoke("INVALID_CONFIGURATION", "Public key is required")
          return@runOnUiThread
        }

        // Create delegate object
        val delegate = createCheckoutDelegate()

        // Call CheckoutConfiguration.configureWithTapCheckoutDictionary
        CheckoutConfiguration.configureWithTapCheckoutDictionary(
          currentActivity,
          publicKey,
          tapCheckoutView!!,
          androidConfiguration,
          delegate
        )

      } catch (e: Exception) {
        onError.invoke("CHECKOUT_ERROR", "Failed to start checkout: ${e.message}")
      }
    }
  }

  /**
   * Handles transaction mode: if mode contains "authorize", moves charge data to authorize key
   * This is required by the SDK to differentiate between charge and authorize transactions
   */
  private fun handleTransactionMode(configuration: LinkedHashMap<String, Any>) {
    try {
      val transaction = configuration["transaction"] as? JSONObject ?: return
      val mode = transaction.optString("mode", "charge")

      if (mode.contains("authorize", ignoreCase = true)) {
        // Get the charge object
        val chargeObj = transaction.optJSONObject("charge")
        if (chargeObj != null) {
          // Remove charge key and add authorize key with same data
          transaction.remove("charge")
          transaction.put("authorize", chargeObj)
        }
      }
    } catch (e: Exception) {
      // If there's any error, continue with default behavior
      println("Transaction mode handling error: ${e.message}")
    }
  }

  /**
   * Recursively converts a Map to SDK-compatible format (LinkedHashMap with JSONObjects/JSONArrays)
   * This automatically handles all nested structures without manual field mapping
   */
  private fun convertToSDKFormat(map: Map<String, Any?>): LinkedHashMap<String, Any> {
    val result = LinkedHashMap<String, Any>()

    for ((key, value) in map) {
      when (value) {
        is Map<*, *> -> {
          @Suppress("UNCHECKED_CAST")
          val nestedMap = value as Map<String, Any?>
          result[key] = convertMapToJSONObject(nestedMap)
        }
        is List<*> -> {
          result[key] = convertListToJSONArray(value)
        }
        null -> {
          // Skip null values or set empty string based on key type
          result[key] = ""
        }
        else -> {
          result[key] = value
        }
      }
    }

    return result
  }

  /**
   * Recursively converts a Map to JSONObject
   */
  private fun convertMapToJSONObject(map: Map<String, Any?>): JSONObject {
    val jsonObject = JSONObject()

    for ((key, value) in map) {
      when (value) {
        is Map<*, *> -> {
          @Suppress("UNCHECKED_CAST")
          val nestedMap = value as Map<String, Any?>
          jsonObject.put(key, convertMapToJSONObject(nestedMap))
        }
        is List<*> -> {
          jsonObject.put(key, convertListToJSONArray(value))
        }
        null -> {
          jsonObject.put(key, "")
        }
        else -> {
          jsonObject.put(key, value)
        }
      }
    }

    return jsonObject
  }

  /**
   * Recursively converts a List to JSONArray
   */
  private fun convertListToJSONArray(list: List<*>): JSONArray {
    val jsonArray = JSONArray()

    for (item in list) {
      when (item) {
        is Map<*, *> -> {
          @Suppress("UNCHECKED_CAST")
          val nestedMap = item as Map<String, Any?>
          jsonArray.put(convertMapToJSONObject(nestedMap))
        }
        is List<*> -> {
          jsonArray.put(convertListToJSONArray(item))
        }
        null -> {
          jsonArray.put("")
        }
        else -> {
          jsonArray.put(item)
        }
      }
    }

    return jsonArray
  }

  private fun createCheckoutDelegate(): TapCheckoutStatusDelegate {
    return object : TapCheckoutStatusDelegate {
      override fun onCheckoutSuccess(data: String) {
        onSuccessCallback?.invoke(data)
        removeFullscreenView()
      }

      override fun onCheckoutReady() {
        onReadyCallback?.invoke()
      }

      override fun onCheckoutClick() {
        // Not needed for React Native
      }

      override fun onCheckoutOrderCreated(data: String) {
        // Not needed for React Native
      }

      override fun onCheckoutChargeCreated(data: String) {
        // Not needed for React Native
      }

      override fun onCheckoutError(error: String) {
        removeFullscreenView()
        onErrorCallback?.invoke(error)
      }

      override fun onCheckoutcancel() {
        onCloseCallback?.invoke()
        removeFullscreenView()
      }
    }
  }

  private fun removeFullscreenView() {
    UiThreadUtil.runOnUiThread {
      fullscreenView?.let { view ->
        val contentView = currentActivity?.findViewById<ViewGroup>(android.R.id.content)
        contentView?.removeView(view)
        fullscreenView = null
      }
    }
  }

  companion object {
    const val NAME = "CheckoutReactNative"
  }
}
