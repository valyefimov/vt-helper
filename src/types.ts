/**
 * Minimal typing for the View Transitions API.
 * TypeScript's bundled DOM lib does not consistently include these types
 * across versions, so we declare our own shape here and cast `document` to
 * it locally rather than augmenting the global `Document` interface (which
 * conflicts when a newer lib.dom.d.ts already declares this API).
 */
export interface ViewTransition {
  readonly finished: Promise<void>;
  readonly ready: Promise<void>;
  readonly updateCallbackDone: Promise<void>;
  skipTransition(): void;
}

export interface DocumentWithViewTransitions {
  startViewTransition?(callback: () => void | Promise<void>): ViewTransition;
}
