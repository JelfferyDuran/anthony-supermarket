export function getTelegramWebApp() {
  return window.Telegram?.WebApp || null;
}

export function telegramHaptic(type = 'selection') {
  const haptics = getTelegramWebApp()?.HapticFeedback;
  try {
    if (!haptics) return;
    if (type === 'success' || type === 'error' || type === 'warning') {
      haptics.notificationOccurred?.(type);
      return;
    }
    if (type === 'light' || type === 'medium' || type === 'heavy' || type === 'rigid' || type === 'soft') {
      haptics.impactOccurred?.(type);
      return;
    }
    haptics.selectionChanged?.();
  } catch {
    // Telegram UX enhancement only; ordering must never depend on haptics.
  }
}

export function getTelegramDisplayName() {
  // Convenience-only prefill. Never use initDataUnsafe for authorization or identity trust.
  const user = getTelegramWebApp()?.initDataUnsafe?.user;
  if (!user) return '';
  return [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
}

export function configureTelegramChrome() {
  const webApp = getTelegramWebApp();
  if (!webApp) return;

  try {
    webApp.ready?.();
    webApp.expand?.();
    webApp.setHeaderColor?.('#050505');
    webApp.setBackgroundColor?.('#050505');
    webApp.setBottomBarColor?.('#050505');
  } catch {
    // Browser preview and older Telegram clients should keep working normally.
  }
}
