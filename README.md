# vt-helper

[![npm version](https://img.shields.io/npm/v/vt-helper.svg)](https://www.npmjs.com/package/vt-helper)
[![npm downloads](https://img.shields.io/npm/dm/vt-helper.svg)](https://www.npmjs.com/package/vt-helper)
[![CI](https://github.com/valyefimov/vt-helper/actions/workflows/ci.yml/badge.svg)](https://github.com/valyefimov/vt-helper/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/vt-helper.svg)](./LICENSE)

A tiny, zero-dependency helper for the browser [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API), with automatic fallback for unsupported browsers.

📖 [Live docs with interactive examples](https://valyefimov.github.io/vt-helper/)

`document.startViewTransition` is great, but every call site ends up rewriting the same feature-detection boilerplate. `vt-helper` wraps it once so your code looks the same whether or not the browser supports it.

## Install

```sh
npm install vt-helper
```

## Usage

```ts
import { transition } from 'vt-helper';

button.addEventListener('click', () => {
  transition(() => {
    document.body.classList.toggle('dark');
  });
});
```

On a supported browser this runs the DOM update inside `document.startViewTransition` and plays the transition animation. On an unsupported browser it just runs the callback (via `requestAnimationFrame`), so the DOM update always happens, animated or not.

### Sequencing multiple steps

```ts
import { transitionSequence } from 'vt-helper';

await transitionSequence([
  () => showStep(1),
  () => showStep(2),
  () => showStep(3),
]);
```

Each step's transition is started only after the previous one has fully finished (`handle.finished`), so steps never overlap.

## API

### `transition(callback): TransitionHandle`

Wraps `document.startViewTransition(callback)`. `callback` may be sync or return a `Promise`.

Returns a `TransitionHandle`:

```ts
interface TransitionHandle {
  readonly finished: Promise<void>;
  readonly ready: Promise<void>;
  readonly updateCallbackDone: Promise<void>;
  skipTransition(): void;
}
```

On unsupported browsers, `ready`, `finished`, and `updateCallbackDone` all resolve (or reject) together once `callback` settles, and `skipTransition()` is a no-op.

### `transitionSequence(callbacks): Promise<void>`

Runs an array of `callback`s in order, calling `transition()` for each and awaiting its `finished` promise before starting the next. If a step throws or its promise rejects, the sequence stops and the returned promise rejects with that error.

### `isViewTransitionsSupported(): boolean`

Feature-detects `document.startViewTransition`. Useful if you want to branch your own logic instead of relying on the built-in fallback.

## Browser support

The View Transitions API is supported in recent Chromium-based browsers; see [caniuse](https://caniuse.com/view-transitions) for current coverage. Everywhere else, `vt-helper`'s fallback runs your callback with no animation, so your DOM updates are consistent across all browsers - you only lose the transition effect, never the update itself.

## Contributing

PRs welcome. Please run `npx changeset` after making a user-facing change to add a changelog entry.

## License

MIT
