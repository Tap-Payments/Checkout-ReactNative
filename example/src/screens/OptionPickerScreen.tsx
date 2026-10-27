/** Single and multiple choice, like the option picker in the native example apps. */

import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { usePalette } from '../theme';
import { CheckRow, FormSection, NavBar } from '../components/ui';
import type { PickerRequest } from './SettingsScreen';

export function OptionPickerScreen({
  request,
  onBack,
}: {
  request: PickerRequest;
  onBack: () => void;
}) {
  const palette = usePalette();
  const [selection, setSelection] = useState(request.selection);

  const select = (value: string) => {
    if (request.allowsMultiple) {
      const toggled = selection.includes(value)
        ? selection.filter((selected) => selected !== value)
        : [...selection, value];
      // Keep the saved list in the order the options are listed in.
      const ordered = request.options
        .map((candidate) => candidate.value)
        .filter((candidate) => toggled.includes(candidate));
      setSelection(ordered);
      request.onChange(ordered);
    } else {
      request.onChange([value]);
      onBack();
    }
  };

  return (
    <View
      style={[styles.screen, { backgroundColor: palette.screenBackground }]}
    >
      <NavBar title={request.title} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <FormSection>
          {request.options.map((candidate, index) => (
            <CheckRow
              key={candidate.value}
              first={index === 0}
              title={candidate.title}
              checked={selection.includes(candidate.value)}
              onPress={() => select(candidate.value)}
            />
          ))}
        </FormSection>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 32 },
});
