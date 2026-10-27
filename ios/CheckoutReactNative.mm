#import "CheckoutReactNative.h"

#if __has_include(<CheckoutReactNative/CheckoutReactNative-Swift.h>)
#import <CheckoutReactNative/CheckoutReactNative-Swift.h>
#else
#import "CheckoutReactNative-Swift.h"
#endif

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
  __weak CheckoutReactNative *weakSelf = self;
  [_bridge startCheckoutWithConfigurations:configurations
                                  onSuccess:onSuccess
                                    onError:onError
                                    onClose:onClose
                                    onReady:onReady
                            onChargeCreated:^(NSString *data) {
    // An event, so it can fire again when the customer retries (e.g. back from KNET)
    [weakSelf emitOnChargeCreated:data];
  }];
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
