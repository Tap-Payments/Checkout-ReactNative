# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# ========================================
# REACT NATIVE CORE RULES
# ========================================

# Keep all React Native classes to prevent NoSuchMethodError
-keep class com.facebook.react.** { *; }
-keep interface com.facebook.react.** { *; }
-keepclassmembers class com.facebook.react.** { *; }

# Keep React Native dev support classes (fixes CxxInspectorPackagerConnection issues)
-keep class com.facebook.react.devsupport.** { *; }
-keepclassmembers class com.facebook.react.devsupport.** { *; }
-keep interface com.facebook.react.devsupport.** { *; }

# Keep React Native bridge classes
-keep class com.facebook.react.bridge.** { *; }
-keepclassmembers class com.facebook.react.bridge.** { *; }

# Keep React Native modules and their native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep React Native Turbo Modules
-keep class com.facebook.react.turbomodule.** { *; }
-keep interface com.facebook.react.turbomodule.** { *; }

# Keep Hermes engine classes
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# ========================================
# KOTLIN SPECIFIC RULES
# ========================================

# Keep all Kotlin metadata to prevent reflection issues
-keep class kotlin.Metadata { *; }
-keep class kotlin.** { *; }
-keepclassmembers class kotlin.** { *; }

# Keep Kotlin coroutines completely
-keep class kotlinx.coroutines.** { *; }
-keepnames class kotlinx.coroutines.** { *; }
-keepclassmembers class kotlinx.coroutines.** { *; }
-dontwarn kotlinx.coroutines.**

# Keep all companion objects and singletons
-keepnames class * {
    public static ** Companion;
    public static ** INSTANCE;
}

# Keep Kotlin data classes and their properties
-keepclassmembers class * {
    @kotlin.jvm.JvmField <fields>;
    public ** component*();
    public ** copy(...);
    public ** copy$default(...);
}

# ========================================
# SERIALIZATION AND JSON
# ========================================

# Keep Gson classes
-keep class com.google.gson.** { *; }
-keep class * extends com.google.gson.TypeAdapter { *; }
-keep class * implements com.google.gson.TypeAdapterFactory { *; }
-keep class * implements com.google.gson.JsonSerializer { *; }
-keep class * implements com.google.gson.JsonDeserializer { *; }

# Keep serialization annotations
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
    @com.google.gson.annotations.Expose <fields>;
}

# ========================================
# NETWORK LIBRARIES
# ========================================

# Keep OkHttp3 classes completely
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-keepnames class okhttp3.** { *; }

# Keep old OkHttp classes (com.squareup.okhttp) - used by some dependencies
-dontwarn com.squareup.okhttp.**
-keep class com.squareup.okhttp.** { *; }
-keep interface com.squareup.okhttp.** { *; }

# Keep Retrofit classes completely  
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }
-keepnames class retrofit2.** { *; }

# ========================================
# ANDROID FRAMEWORK CLASSES
# ========================================

# Keep WebView related classes
-keep class android.webkit.** { *; }
-keep class * extends android.webkit.WebViewClient { *; }
-keep class * extends android.webkit.WebChromeClient { *; }

# Keep custom view classes with all constructors
-keep public class * extends android.view.View {
    public <init>(android.content.Context);
    public <init>(android.content.Context, android.util.AttributeSet);
    public <init>(android.content.Context, android.util.AttributeSet, int);
    public <init>(android.content.Context, android.util.AttributeSet, int, int);
    public void set*(...);
    *** get*();
}

# Keep Parcelable implementations
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep enum classes
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
    **[] $VALUES;
    public *;
}

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# ========================================
# ESSENTIAL ATTRIBUTES
# ========================================

# Keep all annotations and signatures for runtime reflection
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod
-keepattributes RuntimeVisibleAnnotations
-keepattributes RuntimeInvisibleAnnotations
-keepattributes RuntimeVisibleParameterAnnotations
-keepattributes RuntimeInvisibleParameterAnnotations

# Keep source file names and line numbers for better crash reports
-keepattributes SourceFile,LineNumberTable

# Keep exceptions for better debugging
-keepattributes Exceptions

# ========================================
# TAP PAYMENT SDK RULES
# ========================================

# Keep ALL Tap Checkout SDK classes - no obfuscation at all
-keep class company.tap.tapcheckout_android.** { *; }
-keep interface company.tap.tapcheckout_android.** { *; }
-keepnames class company.tap.tapcheckout_android.** { *; }
-keepclassmembers class company.tap.tapcheckout_android.** { *; }

# Keep all inner classes, companion objects, and nested classes
-keep class company.tap.tapcheckout_android.**$* { *; }
-keep class company.tap.tapcheckout_android.**$Companion { *; }

# Keep Tap Network Kit classes (fixes ClassCastException)
-keep class company.tap.tapnetworkkit.** { *; }
-keep interface company.tap.tapnetworkkit.** { *; }
-keepnames class company.tap.tapnetworkkit.** { *; }
-keepclassmembers class company.tap.tapnetworkkit.** { *; }
-keep class company.tap.tapnetworkkit.**$* { *; }

# Keep all Tap SDK related packages
-keep class company.tap.** { *; }
-keep interface company.tap.** { *; }
-keepclassmembers class company.tap.** { *; }

# ========================================
# LOTTIE ANIMATION RULES
# ========================================

# Keep all Lottie classes (fixes ClassCastException in LottieCompositionFactory)
-keep class com.airbnb.lottie.** { *; }
-keep interface com.airbnb.lottie.** { *; }
-keepclassmembers class com.airbnb.lottie.** { *; }
-keep class com.airbnb.lottie.**$* { *; }

# Don't warn about Lottie
-dontwarn com.airbnb.lottie.**

# Keep Lottie model classes
-keep class com.airbnb.lottie.model.** { *; }
-keep class com.airbnb.lottie.animation.** { *; }
-keep class com.airbnb.lottie.value.** { *; }

# ========================================
# MISSING CLASSES - IGNORE WARNINGS
# ========================================

# Suppress warnings for kotlinx.parcelize.Parcelize
-dontwarn kotlinx.parcelize.Parcelize

# Java beans classes - ignore warnings (not available on Android)
-dontwarn java.beans.**

# Jackson databind classes - ignore warnings
-dontwarn com.fasterxml.jackson.**

# Other JVM-specific classes not available on Android
-dontwarn java.lang.instrument.**
-dontwarn sun.misc.**
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
