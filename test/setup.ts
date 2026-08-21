import { mock } from "bun:test";

import * as stub from "./react-native-stub";

mock.module("react-native", () => stub);

// Opt into React's act() environment so state updates in tests are flushed
// synchronously and do not warn.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

// react-test-renderer is the only renderer that works without a DOM or a
// native host; its deprecation notice is noise here.
const NOISE = [
  "react-test-renderer is deprecated",
  "The current testing environment is not configured to support act",
];

for (const method of ["warn", "error"] as const) {
  const original = console[method].bind(console);
  console[method] = (...args: unknown[]) => {
    if (typeof args[0] === "string" && NOISE.some((n) => args[0]!.toString().includes(n))) {
      return;
    }
    original(...args);
  };
}
