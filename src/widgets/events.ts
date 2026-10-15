// ==============================================================================
// Notification & Event Architecture
// See: docs/rfcs/006-error-handling-and-toast-notifications.md
// ==============================================================================

export interface ToastOptions {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  durationMs?: number; // default: 4000ms (0 for persistent error toasts)
  actionLabel?: string;
  onAction?: () => void;
  errorDetail?: unknown;
}

export class ToastNotificationEvent extends CustomEvent<ToastOptions> {
  static readonly EVENT_NAME = 'yt-toast';
  constructor(options: ToastOptions) {
    super(ToastNotificationEvent.EVENT_NAME, {
      bubbles: true,
      composed: true, // crosses Shadow DOM boundaries
      detail: options,
    });
  }
}

/**
 * Global helper to dispatch a toast notification event from any DOM element or window.
 */
export function dispatchToast(target: EventTarget | null | undefined, options: ToastOptions): void {
  const event = new ToastNotificationEvent(options);
  if (target && typeof (target as EventTarget).dispatchEvent === 'function') {
    target.dispatchEvent(event);
  } else if (typeof window !== 'undefined') {
    window.dispatchEvent(event);
  }
}
