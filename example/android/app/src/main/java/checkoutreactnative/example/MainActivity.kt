package checkoutreactnative.example

import android.content.pm.ApplicationInfo
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "CheckoutReactNativeExample"

  /**
   * Returns the instance of the [ReactActivityDelegate]. The New Architecture is always enabled,
   * so the flag-based constructor is no longer needed.
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      object : DefaultReactActivityDelegate(this, mainComponentName) {
        // The UI tests' intent extras (see example/src/UITestHooks.ts), passed to the app as
        // initial props. Debuggable builds only.
        override fun getLaunchOptions(): Bundle? {
          if (applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE == 0) return null
          val extras = intent?.extras ?: return null
          return Bundle().apply {
            UI_TEST_KEYS.forEach { key -> extras.getString(key)?.let { putString(key, it) } }
          }
        }
      }

  private companion object {
    val UI_TEST_KEYS =
        listOf("UITEST", "UITEST_AUTOSTART", "UITEST_PUBLIC_KEY", "UITEST_CONFIG_OVERRIDES")
  }
}
