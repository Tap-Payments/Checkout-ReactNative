require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "CheckoutReactNative"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/Tap-Payments/Checkout-ReactNative/checkout-react-native.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,cpp,swift}"
  s.private_header_files = "ios/**/*.h"
  
  s.swift_version = '5.0'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  # Checkout-IOS comes from CocoaPods by default. Run `CHECKOUT_IOS_SPM=1 pod install` to take it
  # from its Swift package instead (React Native's spm_dependency adds it to the Pods project).
  checkout_ios_version = '1.0.7'
  if ENV['CHECKOUT_IOS_SPM'] == '1'
    spm_dependency(s,
      url: 'https://github.com/Tap-Payments/Checkout-IOS.git',
      requirement: { kind: 'exactVersion', version: checkout_ios_version },
      products: ['Checkout-IOS']
    )
  else
    s.dependency 'Checkout-IOS', checkout_ios_version
  end

  install_modules_dependencies(s)
end
