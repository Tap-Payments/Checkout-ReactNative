/**
 * Building blocks shared by the screens. They follow the native example apps: an inset grouped
 * list on the grouped background, a bar with a bold title, and rounded cards.
 */

import { useState, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';
import { usePalette } from '../theme';

const MONOSPACE = Platform.select({ ios: 'Menlo', default: 'monospace' });

// MARK: Bar

export function NavBar({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack?: () => void;
  action?: { title: string; onPress: () => void; testID?: string };
}) {
  const palette = usePalette();
  return (
    <View
      style={[styles.navBar, { backgroundColor: palette.screenBackground }]}
    >
      {onBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
          testID="navBack"
        >
          <Text style={[styles.navBack, { color: palette.accent }]}>
            {'‹ Back'}
          </Text>
        </Pressable>
      ) : null}
      <Text
        style={[
          onBack ? styles.navTitleSmall : styles.navTitle,
          { color: palette.textPrimary },
        ]}
        numberOfLines={1}
        accessibilityRole="header"
      >
        {title}
      </Text>
      <View style={styles.flex} />
      {action ? (
        <Pressable
          onPress={action.onPress}
          hitSlop={12}
          accessibilityRole="button"
          testID={action.testID}
        >
          <Text style={[styles.navAction, { color: palette.accent }]}>
            {action.title}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// MARK: Main screen

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  const palette = usePalette();
  return (
    <View
      style={[styles.card, { backgroundColor: palette.cardBackground }, style]}
    >
      {children}
    </View>
  );
}

export function SectionHeader({
  title,
  trailing,
}: {
  title: string;
  trailing?: ReactNode;
}) {
  const palette = usePalette();
  return (
    <View style={styles.sectionHeader}>
      <Text
        style={[styles.sectionHeaderText, { color: palette.textSecondary }]}
      >
        {title.toUpperCase()}
      </Text>
      <View style={styles.flex} />
      {trailing}
    </View>
  );
}

export function Divider() {
  const palette = usePalette();
  return (
    <View style={[styles.divider, { backgroundColor: palette.divider }]} />
  );
}

export function ConfigRow({ label, value }: { label: string; value: string }) {
  const palette = usePalette();
  return (
    <View style={styles.configRow}>
      <Text style={[styles.configLabel, { color: palette.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[styles.configValue, { color: palette.textPrimary }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

/** One callback: event name, time and a one-line summary; tap to show the full payload,
 * long press to share it. */
export function CallbackCard({
  name,
  time,
  summary,
  payload,
  color,
  onLongPress,
}: {
  name: string;
  time: string;
  summary: string;
  payload?: string;
  color: string;
  onLongPress?: () => void;
}) {
  const palette = usePalette();
  const [expanded, setExpanded] = useState(false);
  return (
    <Pressable
      disabled={payload === undefined}
      onPress={() => setExpanded((value) => !value)}
      onLongPress={onLongPress}
    >
      <Card style={styles.callbackCard}>
        <View style={styles.row}>
          <View style={[styles.badge, { backgroundColor: color }]}>
            <Text style={styles.badgeText}>{name}</Text>
          </View>
          <View style={styles.flex} />
          <Text style={[styles.caption, { color: palette.textSecondary }]}>
            {time}
          </Text>
        </View>
        <Text style={[styles.subheadline, { color: palette.textPrimary }]}>
          {summary}
        </Text>
        {expanded && payload !== undefined ? (
          <View
            style={[
              styles.payloadBox,
              { backgroundColor: palette.codeBackground },
            ]}
          >
            <Text style={[styles.payloadText, { color: palette.textPrimary }]}>
              {payload}
            </Text>
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}

// MARK: Settings form (inset grouped list)

export function FormSection({
  title,
  footer,
  children,
}: {
  title?: string;
  footer?: string;
  children: ReactNode;
}) {
  const palette = usePalette();
  return (
    <View style={styles.formSection}>
      {title ? (
        <Text
          style={[styles.formSectionTitle, { color: palette.textSecondary }]}
        >
          {title.toUpperCase()}
        </Text>
      ) : null}
      <View
        style={[styles.formCard, { backgroundColor: palette.cardBackground }]}
      >
        {children}
      </View>
      {footer ? (
        <Text style={[styles.formFooter, { color: palette.textSecondary }]}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

function RowSeparator({ first }: { first?: boolean }) {
  const palette = usePalette();
  if (first) return null;
  return (
    <View style={[styles.rowSeparator, { backgroundColor: palette.divider }]} />
  );
}

export type ValueRowStyle = 'plain' | 'disclosure' | 'action' | 'destructive';

/** Title on the left, optional value on the right. */
export function ValueRow({
  title,
  detail,
  rowStyle,
  onPress,
  first,
  testID,
}: {
  title: string;
  detail?: string;
  rowStyle: ValueRowStyle;
  onPress?: () => void;
  first?: boolean;
  testID?: string;
}) {
  const palette = usePalette();
  const titleColor =
    rowStyle === 'action'
      ? palette.accent
      : rowStyle === 'destructive'
        ? palette.destructive
        : palette.textPrimary;
  return (
    <>
      <RowSeparator first={first} />
      <Pressable
        disabled={rowStyle === 'plain' || !onPress}
        onPress={onPress}
        testID={testID}
        style={({ pressed }) => [
          styles.formRow,
          pressed && { backgroundColor: palette.divider },
        ]}
      >
        <Text style={[styles.formTitle, { color: titleColor }]}>{title}</Text>
        <View style={styles.flex} />
        {detail !== undefined ? (
          <Text
            style={[styles.formDetail, { color: palette.textSecondary }]}
            numberOfLines={2}
          >
            {detail}
          </Text>
        ) : null}
        {rowStyle === 'disclosure' ? (
          <Text style={[styles.chevron, { color: palette.textSecondary }]}>
            ›
          </Text>
        ) : null}
      </Pressable>
    </>
  );
}

export function TextRow({
  title,
  value,
  onChangeText,
  keyboardType,
  first,
}: {
  title: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  first?: boolean;
}) {
  const palette = usePalette();
  return (
    <>
      <RowSeparator first={first} />
      <View style={styles.formRow}>
        <Text
          style={[
            styles.formTitle,
            styles.textRowTitle,
            { color: palette.textPrimary },
          ]}
        >
          {title}
        </Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          accessibilityLabel={title}
          style={[styles.textInput, { color: palette.textSecondary }]}
        />
      </View>
    </>
  );
}

export function SwitchRow({
  title,
  value,
  onValueChange,
  first,
}: {
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  first?: boolean;
}) {
  const palette = usePalette();
  return (
    <>
      <RowSeparator first={first} />
      <View style={styles.formRow}>
        <Text
          style={[
            styles.formTitle,
            styles.flex,
            { color: palette.textPrimary },
          ]}
        >
          {title}
        </Text>
        <Switch
          value={value}
          onValueChange={onValueChange}
          accessibilityLabel={title}
        />
      </View>
    </>
  );
}

/** A row in the option picker: the title and a checkmark when selected. */
export function CheckRow({
  title,
  checked,
  onPress,
  first,
}: {
  title: string;
  checked: boolean;
  onPress: () => void;
  first?: boolean;
}) {
  const palette = usePalette();
  return (
    <>
      <RowSeparator first={first} />
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected: checked }}
        style={({ pressed }) => [
          styles.formRow,
          pressed && { backgroundColor: palette.divider },
        ]}
      >
        <Text
          style={[
            styles.formTitle,
            styles.flex,
            { color: palette.textPrimary },
          ]}
        >
          {title}
        </Text>
        {checked ? (
          <Text style={[styles.checkmark, { color: palette.accent }]}>✓</Text>
        ) : null}
      </Pressable>
    </>
  );
}

export { MONOSPACE };

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
  },
  navTitle: { fontSize: 22, fontWeight: '700' },
  navTitleSmall: { fontSize: 17, fontWeight: '600', flexShrink: 1 },
  navBack: { fontSize: 17 },
  navAction: { fontSize: 15, fontWeight: '500' },

  card: { borderRadius: 14, overflow: 'hidden' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 28,
    paddingTop: 4,
  },
  sectionHeaderText: { fontSize: 13 },
  divider: { height: StyleSheet.hairlineWidth },
  configRow: { flexDirection: 'row', paddingVertical: 11, gap: 16 },
  configLabel: { fontSize: 15 },
  configValue: { fontSize: 15, flex: 1, textAlign: 'right' },

  callbackCard: { padding: 14, gap: 8 },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: MONOSPACE,
  },
  caption: { fontSize: 12 },
  subheadline: { fontSize: 15 },
  payloadBox: { borderRadius: 8, padding: 10 },
  payloadText: { fontSize: 11, fontFamily: MONOSPACE },

  formSection: { marginTop: 18, marginHorizontal: 16 },
  formSectionTitle: { fontSize: 13, marginLeft: 16, marginBottom: 6 },
  formCard: { borderRadius: 10, overflow: 'hidden' },
  formFooter: { fontSize: 13, marginHorizontal: 16, marginTop: 6 },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  rowSeparator: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  formTitle: { fontSize: 17 },
  textRowTitle: { maxWidth: '60%' },
  formDetail: { fontSize: 17, textAlign: 'right', flexShrink: 1 },
  chevron: { fontSize: 22, marginTop: -2 },
  checkmark: { fontSize: 17, fontWeight: '600' },
  textInput: {
    flex: 1,
    fontSize: 17,
    textAlign: 'right',
    paddingVertical: 4,
  },
});
