import { Alert as NativeAlert, Platform } from 'react-native';

// React Native's Alert does nothing in a web browser, so on web we fall back
// to the browser's own alert / confirm dialogs. On phones the normal Alert is used.
function alert(title, message, buttons) {
  if (Platform.OS !== 'web') {
    NativeAlert.alert(title, message, buttons);
    return;
  }
  const text = message ? `${title}\n\n${message}` : title;
  if (!buttons || buttons.length <= 1) {
    window.alert(text);
    buttons?.[0]?.onPress?.();
    return;
  }
  const cancel = buttons.find((b) => b.style === 'cancel');
  const confirm = buttons.find((b) => b.style !== 'cancel');
  if (window.confirm(text)) confirm?.onPress?.();
  else cancel?.onPress?.();
}

export default { alert };
