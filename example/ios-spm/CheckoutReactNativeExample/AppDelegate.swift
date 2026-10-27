import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    return true
  }

  func application(
    _ application: UIApplication,
    configurationForConnecting connectingSceneSession: UISceneSession,
    options: UIScene.ConnectionOptions
  ) -> UISceneConfiguration {
    UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
  }
}

/// Apps built with the iOS 27 SDK must use the scene life cycle, so React Native starts here.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let factory = (UIApplication.shared.delegate as? AppDelegate)?.reactNativeFactory else { return }
    let window = UIWindow(windowScene: windowScene)
    self.window = window

    factory.startReactNative(
      withModuleName: "CheckoutReactNativeExample",
      in: window,
      initialProperties: uiTestProperties(),
      launchOptions: nil
    )
  }

  /// The UI tests' launch environment (see example/src/UITestHooks.ts), passed to the app as
  /// initial props. Debug builds only.
  private func uiTestProperties() -> [AnyHashable: Any] {
#if DEBUG
    let keys = ["UITEST", "UITEST_AUTOSTART", "UITEST_PUBLIC_KEY", "UITEST_CONFIG_OVERRIDES"]
    let environment = ProcessInfo.processInfo.environment
    return Dictionary(uniqueKeysWithValues: keys.compactMap { key in environment[key].map { (key, $0) } })
#else
    return [:]
#endif
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
