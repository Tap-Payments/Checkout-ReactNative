import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { KeyboardTypeOptions } from 'react-native';

type FieldProps = { label: string; hint?: string; children: React.ReactNode };

/** Label + control + optional hint, laid out like a form row. */
export function Field({ label, hint, children }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
};

export function TextField({
  label,
  value,
  onChange,
  hint,
  placeholder,
  keyboardType,
  multiline,
}: TextFieldProps) {
  return (
    <Field label={label} hint={hint}>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9a9a9a"
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        multiline={multiline}
      />
    </Field>
  );
}

export function YesNoField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  hint?: string;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.switchRow}>
        <View style={styles.switchText}>
          <Text style={styles.label}>{label}</Text>
          {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
        <Text style={styles.switchValue}>{value ? 'Yes' : 'No'}</Text>
        <Switch value={value} onValueChange={onChange} />
      </View>
    </View>
  );
}

type Option<T extends string> = T | { value: T; label: string };
const optionValue = <T extends string>(o: Option<T>) =>
  typeof o === 'string' ? o : o.value;
const optionLabel = <T extends string>(o: Option<T>) =>
  typeof o === 'string' ? o : o.label;

type PickerProps<T extends string> = {
  label: string;
  options: readonly Option<T>[];
  hint?: string;
  searchable?: boolean;
};

/** Single choice from a list, shown in a modal. */
export function SelectField<T extends string>({
  label,
  options,
  value,
  onChange,
  hint,
  searchable,
}: PickerProps<T> & { value: T; onChange: (value: T) => void }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => optionValue(o) === value);
  return (
    <Field label={label} hint={hint}>
      <Pressable
        style={styles.select}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${current ? optionLabel(current) : value}`}
      >
        <Text style={styles.selectValue}>
          {current ? optionLabel(current) : value}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>
      <OptionsModal
        title={label}
        open={open}
        options={options}
        selected={[value]}
        searchable={searchable}
        onClose={() => setOpen(false)}
        onToggle={(v) => {
          onChange(v);
          setOpen(false);
        }}
      />
    </Field>
  );
}

/**
 * Multiple choice. `exclusive` values (e.g. 'ALL', 'AUTO') clear the rest when
 * picked and are cleared when anything else is picked.
 */
export function MultiSelectField<T extends string>({
  label,
  options,
  value,
  onChange,
  hint,
  searchable,
  exclusive = [],
  placeholder = 'None',
}: PickerProps<T> & {
  value: T[];
  onChange: (value: T[]) => void;
  exclusive?: readonly T[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (v: T) => {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v));
    } else if (exclusive.includes(v)) {
      onChange([v]);
    } else {
      onChange([...value.filter((x) => !exclusive.includes(x)), v]);
    }
  };
  return (
    <Field label={label} hint={hint}>
      <Pressable
        style={styles.select}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value.join(', ') || placeholder}`}
      >
        <Text
          style={[
            styles.selectValue,
            !value.length && styles.selectPlaceholder,
          ]}
          numberOfLines={2}
        >
          {value.length ? value.join(', ') : placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>
      <OptionsModal
        title={label}
        open={open}
        options={options}
        selected={value}
        searchable={searchable}
        multiple
        onClose={() => setOpen(false)}
        onToggle={toggle}
      />
    </Field>
  );
}

function OptionsModal<T extends string>({
  title,
  open,
  options,
  selected,
  multiple,
  searchable,
  onClose,
  onToggle,
}: {
  title: string;
  open: boolean;
  options: readonly Option<T>[];
  selected: readonly T[];
  multiple?: boolean;
  searchable?: boolean;
  onClose: () => void;
  onToggle: (value: T) => void;
}) {
  const [query, setQuery] = useState('');
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? options.filter((o) => optionLabel(o).toLowerCase().includes(q))
      : options;
  }, [options, query]);
  return (
    <Modal
      visible={open}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" hitSlop={12}>
            <Text style={styles.modalDone}>Done</Text>
          </Pressable>
        </View>
        {searchable ? (
          <TextInput
            style={[styles.input, styles.search]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor="#9a9a9a"
            autoCapitalize="characters"
            autoCorrect={false}
          />
        ) : null}
        <FlatList
          data={visible}
          keyExtractor={(o) => optionValue(o)}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const v = optionValue(item);
            const on = selected.includes(v);
            return (
              <Pressable
                style={[styles.option, on && styles.optionOn]}
                onPress={() => onToggle(v)}
                accessibilityRole={multiple ? 'checkbox' : 'radio'}
                accessibilityState={{ checked: on }}
              >
                <Text style={[styles.optionText, on && styles.optionTextOn]}>
                  {optionLabel(item)}
                </Text>
                {on ? <Text style={styles.check}>✓</Text> : null}
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  section: { gap: 4, marginBottom: 8 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#666',
    marginTop: 16,
    marginBottom: 6,
  },
  field: { marginBottom: 14 },
  label: { fontSize: 12, color: '#666', marginBottom: 6 },
  hint: { fontSize: 11, color: '#999', marginTop: 4 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#c8c8cc',
    paddingVertical: 8,
    fontSize: 15,
    color: '#111',
  },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#c8c8cc',
    paddingVertical: 9,
  },
  selectValue: { flex: 1, fontSize: 15, color: '#111' },
  selectPlaceholder: { color: '#9a9a9a' },
  chevron: { color: '#666', fontSize: 16, marginLeft: 8 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  switchText: { flex: 1 },
  switchValue: { fontSize: 14, color: '#333' },
  modal: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    // The app is edge-to-edge on Android, so keep the header clear of the status bar.
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 12 : 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  modalTitle: { fontSize: 17, fontWeight: '600', color: '#111' },
  modalDone: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  search: { marginHorizontal: 20, marginTop: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f2',
  },
  optionOn: { backgroundColor: '#eef4ff' },
  optionText: { flex: 1, fontSize: 15, color: '#111' },
  optionTextOn: { fontWeight: '600', color: '#0a58ca' },
  check: { color: '#0a58ca', fontSize: 16, fontWeight: '700' },
});
