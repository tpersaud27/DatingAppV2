// loading.service.ts
import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  /**
   * Tracks how many "things" are currently loading.
   *
   * Why a counter instead of a boolean?
   * - Multiple async operations can overlap (router navigation + HTTP calls)
   * - We only want to hide the loader when *all* of them finish
   *
   * Example:
   *   show()   -> pending = 1  (show loader)
   *   show()   -> pending = 2  (still shown)
   *   hide()   -> pending = 1  (still shown)
   *   hide()   -> pending = 0  (hide loader)
   */
  private readonly pending = signal(0);

  /**
   * Optional text shown in the loading overlay.
   * Examples:
   * - "Bootstrapping user..."
   * - "Navigating to members..."
   * - "Loading messages..."
   */
  private readonly messageSig = signal<string | undefined>(undefined);

  /**
   * Public computed signal that tells the UI
   * whether the loading overlay should be visible.
   *
   * The overlay is visible whenever at least one
   * async operation is in progress.
   */
  public readonly active = computed(() => this.pending() > 0);

  /**
   * Public computed signal for the current loading message.
   * The overlay component reads this directly.
   */
  public readonly message = computed(() => this.messageSig());

  /**
   * Called when an async operation starts.
   *
   * Increments the pending counter.
   * Optionally updates the loading message.
   *
   * Typical callers:
   * - APP_INITIALIZER (app bootstrap)
   * - Router navigation start
   * - HTTP interceptor
   */
  public show(message?: string) {
    this.pending.update((n) => n + 1);

    // Only override the message if one is provided.
    // This allows router/bootstrap messages to persist
    // while HTTP calls are happening underneath.
    if (message) {
      this.messageSig.set(message);
    }
  }

  /**
   * Called when an async operation completes.
   *
   * Decrements the pending counter, but never below zero
   * (defensive programming).
   *
   * When the last operation finishes, the loader hides
   * and the message is cleared.
   */
  public hide() {
    this.pending.update((n) => Math.max(0, n - 1));

    // Once nothing is loading anymore, clear the message
    // so the next loading cycle starts fresh.
    if (this.pending() === 0) {
      this.messageSig.set(undefined);
    }
  }

  /**
   * Updates the message without affecting the pending counter.
   *
   * Useful when:
   * - Navigation starts ("Navigating to members...")
   * - A resolver wants to refine the message ("Loading members...")
   */
  public setMessage(message?: string) {
    this.messageSig.set(message);
  }

  /**
   * Hard reset of the loading state.
   *
   * This should rarely be needed, but is useful for:
   * - Error recovery
   * - User logout
   * - Safety reset after unexpected failures
   */
  public reset() {
    this.pending.set(0);
    this.messageSig.set(undefined);
  }
}
