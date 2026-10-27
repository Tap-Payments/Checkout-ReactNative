/** Shows exactly what Start Checkout passes to the SDK, like the native example apps. */

import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import type { Configuration } from '../CheckoutSettings';
import { usePalette } from '../theme';
import { MONOSPACE, NavBar } from '../components/ui';
import { sortKeys } from './HomeScreen';

export function JsonScreen({
  configuration,
  onBack,
}: {
  configuration: Configuration;
  onBack: () => void;
}) {
  const palette = usePalette();
  const json = JSON.stringify(sortKeys(configuration), null, 2);
  return (
    <View style={[styles.screen, { backgroundColor: palette.cardBackground }]}>
      <NavBar
        title="Configuration JSON"
        onBack={onBack}
        action={{
          title: 'Share',
          onPress: () => Share.share({ message: json }),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text selectable style={[styles.json, { color: palette.textPrimary }]}>
          {json}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 12 },
  json: { fontSize: 12, fontFamily: MONOSPACE },
});
