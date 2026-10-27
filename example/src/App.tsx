/**
 * The example app: the main screen, Settings, the option picker and the configuration JSON viewer,
 * in a small stack (no navigation library). Same screens as the native example apps.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  loadSettings,
  saveSettings,
  type CheckoutSettings,
  type Configuration,
} from './CheckoutSettings';
import {
  makeUITestHooks,
  prepareUITestHooks,
  type LaunchProps,
} from './UITestHooks';
import { usePalette } from './theme';
import { HomeScreen } from './screens/HomeScreen';
import { SettingsScreen, type PickerRequest } from './screens/SettingsScreen';
import { OptionPickerScreen } from './screens/OptionPickerScreen';
import { JsonScreen } from './screens/JsonScreen';

type Route =
  | { name: 'settings' }
  | { name: 'picker'; request: PickerRequest }
  | { name: 'json'; configuration: Configuration };

export default function App(props: LaunchProps) {
  const testHooks = useMemo(() => {
    const hooks = makeUITestHooks(props);
    prepareUITestHooks(hooks);
    return hooks;
    // Launch props never change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Edited in Settings and saved on every change.
  const [settings, setSettings] = useState<CheckoutSettings>(loadSettings);
  const updateSettings = (next: CheckoutSettings) => {
    saveSettings(next);
    setSettings(next);
  };

  const [stack, setStack] = useState<Route[]>([]);
  const push = (route: Route) => setStack((current) => [...current, route]);
  const pop = () => setStack((current) => current.slice(0, -1));

  // The Android back button goes back a screen, like the native app.
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (stack.length === 0) return false;
        pop();
        return true;
      }
    );
    return () => subscription.remove();
  }, [stack.length]);

  const route = stack[stack.length - 1];
  const palette = usePalette();
  const dark = useColorScheme() === 'dark';

  let screen;
  switch (route?.name) {
    case 'settings':
      screen = (
        <SettingsScreen
          settings={settings}
          onChange={updateSettings}
          onBack={pop}
          onPick={(request) => push({ name: 'picker', request })}
          onShowJSON={(configuration) => push({ name: 'json', configuration })}
        />
      );
      break;
    case 'picker':
      // Only the picker changes settings while it is open, so its request can keep the
      // settings it was opened with.
      screen = <OptionPickerScreen request={route.request} onBack={pop} />;
      break;
    case 'json':
      screen = <JsonScreen configuration={route.configuration} onBack={pop} />;
      break;
    default:
      screen = (
        <HomeScreen
          settings={settings}
          testHooks={testHooks}
          onOpenSettings={() => push({ name: 'settings' })}
          onShowJSON={(configuration) => push({ name: 'json', configuration })}
        />
      );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <SafeAreaView
        style={[styles.root, { backgroundColor: palette.screenBackground }]}
      >
        {screen}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
