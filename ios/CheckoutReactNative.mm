#import "CheckoutReactNative.h"
#import "CheckoutReactNative-Swift.h"  // Import the Swift bridging header



@implementation CheckoutReactNative
RCT_EXPORT_MODULE()

- (NSNumber *)multiply:(double)a b:(double)b {
  CheckoutSDKBridge* bridge = [[CheckoutSDKBridge alloc] init];
  NSNumber *result = [bridge multiply:a :b];

    return result;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeCheckoutReactNativeSpecJSI>(params);
}

@end
