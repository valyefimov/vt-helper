import type { DocumentWithViewTransitions, ViewTransition } from './types.js';

/**
 * A callback that performs the DOM mutation(s) for a transition step.
 * May be synchronous or return a Promise; if it returns a Promise,
 * the View Transitions API (and the fallback) will wait for it before
 * considering the DOM update "done".
 */
export type TransitionCallback = () => void | Promise<void>;

/**
 * A ViewTransition-like handle returned by `transition()`.
 * Mirrors the real `ViewTransition` interface so callers can use the
 * same API regardless of whether the native View Transitions API is
 * supported by the current browser.
 */
export interface TransitionHandle {
  /** Resolves once the whole transition (including animations) has finished. */
  readonly finished: Promise<void>;
  /** Resolves once the new DOM state is ready to be captured/rendered. */
  readonly ready: Promise<void>;
  /** Resolves once the callback's DOM update has been applied. */
  readonly updateCallbackDone: Promise<void>;
  /** Skips the transition animation, if any is in progress. No-op in fallback mode. */
  skipTransition(): void;
}

/**
 * Returns true if the browser supports `document.startViewTransition`.
 */
export function isViewTransitionsSupported(): boolean {
  return (
    typeof document !== 'undefined' &&
    typeof (document as unknown as DocumentWithViewTransitions)
      .startViewTransition === 'function'
  );
}

/**
 * Wraps `document.startViewTransition(callback)`.
 *
 * If the View Transitions API is supported, delegates directly to it and
 * returns a `TransitionHandle` mirroring the native `ViewTransition`.
 *
 * If unsupported, runs `callback` via `requestAnimationFrame` (falling back
 * to a microtask if `requestAnimationFrame` is unavailable, e.g. non-DOM
 * environments) and returns a `TransitionHandle` whose promises resolve
 * once the callback (and any promise it returns) completes. This keeps the
 * calling code identical regardless of browser support.
 *
 * @param callback DOM mutation to run as part of the transition. May return a Promise.
 */
export function transition(callback: TransitionCallback): TransitionHandle {
  const start =
    typeof document !== 'undefined'
      ? (document as unknown as DocumentWithViewTransitions).startViewTransition
      : undefined;

  if (typeof start === 'function') {
    const nativeTransition: ViewTransition = start.call(document, callback);
    return {
      finished: nativeTransition.finished,
      ready: nativeTransition.ready,
      updateCallbackDone: nativeTransition.updateCallbackDone,
      skipTransition: () => nativeTransition.skipTransition(),
    };
  }

  const updateCallbackDone = runFallbackCallback(callback);
  // In the fallback path there is no animation, so ready/finished settle
  // at the same point as the DOM update itself (including rejections).

  return {
    finished: updateCallbackDone,
    ready: updateCallbackDone,
    updateCallbackDone,
    skipTransition: () => {
      /* no-op: no animation to skip in fallback mode */
    },
  };
}

function runFallbackCallback(callback: TransitionCallback): Promise<void> {
  const schedule: (cb: () => void) => void =
    typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame
      : (cb) => Promise.resolve().then(cb);

  return new Promise((resolve, reject) => {
    schedule(() => {
      try {
        const result = callback();
        if (result && typeof (result as Promise<void>).then === 'function') {
          (result as Promise<void>).then(resolve, reject);
        } else {
          resolve();
        }
      } catch (error) {
        reject(error as Error);
      }
    });
  });
}

/**
 * Runs an array of transition steps sequentially: each step's transition is
 * started with `transition()`, and the next step is not started until the
 * previous one's `finished` promise settles.
 *
 * Rejections from any step propagate and stop the sequence (the returned
 * promise rejects with that error); subsequent steps are not run.
 *
 * @param callbacks Ordered list of transition callbacks to run in sequence.
 * @returns A promise that resolves once all steps have finished, in order.
 */
export async function transitionSequence(
  callbacks: TransitionCallback[]
): Promise<void> {
  for (const callback of callbacks) {
    const handle = transition(callback);
    await handle.finished;
  }
}
