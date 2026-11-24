import { Alert, Platform } from 'react-native';

/**
 * Yes/no confirmation that works everywhere. Phones get the native alert; browsers get the
 * built-in confirm dialog, because React Native's Alert does nothing on the web.
 */
export function confirmAction(title: string, message: string, confirmLabel: string, cancelLabel = 'Cancel'): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
