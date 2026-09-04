import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  isViewTransitionsSupported,
  transition,
  transitionSequence,
} from './transition.js';
import type { DocumentWithViewTransitions } from './types.js';

function docWithVT(): DocumentWithViewTransitions {
  return document as unknown as DocumentWithViewTransitions;
}

afterEach(() => {
  delete docWithVT().startViewTransition;
  vi.restoreAllMocks();
});

describe('isViewTransitionsSupported', () => {
  it('returns false when startViewTransition is not defined', () => {
    expect(isViewTransitionsSupported()).toBe(false);
  });

  it('returns true when startViewTransition is defined', () => {
    docWithVT().startViewTransition = vi.fn();
    expect(isViewTransitionsSupported()).toBe(true);
  });
});

describe('transition (supported path)', () => {
  it('delegates to document.startViewTransition and forwards its promises', async () => {
    const callback = vi.fn();
    const fakeNative = {
      finished: Promise.resolve(),
      ready: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
      skipTransition: vi.fn(),
    };
    const startViewTransition = vi.fn().mockReturnValue(fakeNative);
    docWithVT().startViewTransition = startViewTransition;

    const handle = transition(callback);

    expect(startViewTransition).toHaveBeenCalledWith(callback);
    await expect(handle.finished).resolves.toBeUndefined();
    handle.skipTransition();
    expect(fakeNative.skipTransition).toHaveBeenCalled();
  });
});

describe('transition (fallback path)', () => {
  it('runs the callback and resolves finished/ready/updateCallbackDone', async () => {
    const callback = vi.fn();
    const handle = transition(callback);

    await handle.finished;

    expect(callback).toHaveBeenCalledTimes(1);
    await expect(handle.ready).resolves.toBeUndefined();
    await expect(handle.updateCallbackDone).resolves.toBeUndefined();
  });

  it('awaits an async callback before resolving', async () => {
    let resolved = false;
    const callback = vi.fn(async () => {
      await Promise.resolve();
      resolved = true;
    });

    const handle = transition(callback);
    await handle.finished;

    expect(resolved).toBe(true);
  });

  it('rejects finished when the callback throws', async () => {
    const error = new Error('boom');
    const callback = vi.fn(() => {
      throw error;
    });

    const handle = transition(callback);
    await expect(handle.finished).rejects.toThrow('boom');
  });
});

describe('transitionSequence', () => {
  it('runs steps in order, awaiting each finished before starting the next', async () => {
    const order: number[] = [];
    const steps = [1, 2, 3].map(
      (n) =>
        () =>
          new Promise<void>((resolve) => {
            setTimeout(() => {
              order.push(n);
              resolve();
            }, 0);
          })
    );

    await transitionSequence(steps);

    expect(order).toEqual([1, 2, 3]);
  });

  it('stops and rejects if a step fails', async () => {
    const calls: number[] = [];
    const steps = [
      () => {
        calls.push(1);
      },
      () => {
        calls.push(2);
        throw new Error('step 2 failed');
      },
      () => {
        calls.push(3);
      },
    ];

    await expect(transitionSequence(steps)).rejects.toThrow('step 2 failed');
    expect(calls).toEqual([1, 2]);
  });
});
