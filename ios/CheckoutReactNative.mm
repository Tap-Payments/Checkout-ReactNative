#import "CheckoutReactNative.h"
#import "CheckoutReactNative-Swift.h"  // Import the Swift bridging header

@implementation CheckoutReactNative {
  CheckoutSDKBridge* _bridge;  // Instance variable to keep reference
}
RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(startCheckout:(NSDictionary *)configurations
                  onSuccess:(RCTResponseSenderBlock)onSuccess
                  onError:(RCTResponseSenderBlock)onError
                  onClose:(RCTResponseSenderBlock)onClose
                  onReady:(RCTResponseSenderBlock)onReady) {
  _bridge = [[CheckoutSDKBridge alloc] init];  // Store reference as instance variable
  [_bridge startCheckoutWithConfigurations:configurations
                                  onSuccess:onSuccess
                                    onError:onError
                                    onClose:onClose
                                    onReady:onReady];
}

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeCheckoutReactNativeSpecJSI>(params);
}
#endif

@end
