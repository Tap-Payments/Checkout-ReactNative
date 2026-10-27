import { useColorScheme } from 'react-native';

/** The example apps' palette: the same values as colors_example.xml in the Android example app
 * (which match the iOS system colors the iOS example apps use). */
const light = {
  screenBackground: '#F2F2F7',
  cardBackground: '#FFFFFF',
  textPrimary: '#1C1C1E',
  textSecondary: '#6E6E73',
  divider: '#E5E5EA',
  accent: '#007AFF',
  destructive: '#FF3B30',
  heroStart: '#0A84FF',
  heroEnd: '#3A3AD9',
  codeBackground: '#F2F2F7',

  eventReady: '#007AFF',
  eventCharge: '#AF52DE',
  eventSuccess: '#34C759',
  eventError: '#FF3B30',
  eventClose: '#8E8E93',

  chipSandbox: '#34C759',
  chipLive: '#FF9500',
  chipMissing: '#FF3B30',
};

export type Palette = typeof light;

const dark: Palette = {
  screenBackground: '#000000',
  cardBackground: '#1C1C1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#98989F',
  divider: '#38383A',
  accent: '#0A84FF',
  destructive: '#FF453A',
  heroStart: '#0A6AD9',
  heroEnd: '#2C2C9E',
  codeBackground: '#2C2C2E',

  eventReady: '#0A84FF',
  eventCharge: '#BF5AF2',
  eventSuccess: '#30D158',
  eventError: '#FF453A',
  eventClose: '#98989D',

  chipSandbox: '#30D158',
  chipLive: '#FF9F0A',
  chipMissing: '#FF453A',
};

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}
