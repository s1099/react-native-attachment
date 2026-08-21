import * as React from "react";

/**
 * Minimal stand-in for `react-native` so the components can be rendered with
 * `react-test-renderer` in a plain JS runtime. Each export keeps the shape the
 * library relies on and nothing more.
 */

type AnyProps = Record<string, unknown>;

function host(name: string) {
  const Component = React.forwardRef<unknown, AnyProps>((props, ref) =>
    React.createElement(name, { ...props, ref })
  );
  Component.displayName = name;
  return Component;
}

export const View = host("View");
export const Text = host("Text");
export const Image = host("Image");

const PressableHost = host("Pressable");

export const Pressable = React.forwardRef<unknown, AnyProps>((props, ref) => {
  const { style, children, ...rest } = props as {
    style?: unknown;
    children?: unknown;
  };
  // Exercise the function forms the library uses.
  const resolvedStyle =
    typeof style === "function" ? style({ pressed: false }) : style;
  const resolvedChildren =
    typeof children === "function" ? children({ pressed: false }) : children;

  return React.createElement(
    PressableHost,
    { ...rest, ref, style: resolvedStyle },
    resolvedChildren as React.ReactNode
  );
});
Pressable.displayName = "Pressable";

const ScrollViewHost = host("ScrollView");

export const ScrollView = React.forwardRef<unknown, AnyProps>((props, ref) =>
  React.createElement(ScrollViewHost, { ...props, ref })
);
ScrollView.displayName = "ScrollView";

export const StyleSheet = {
  create: <T,>(styles: T): T => styles,
  flatten,
  absoluteFill: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
};

export class AnimatedValue {
  value: number;
  constructor(value: number) {
    this.value = value;
  }
  setValue(next: number) {
    this.value = next;
  }
  interpolate(config: { outputRange: unknown[] }) {
    return config.outputRange[0];
  }
}

const noopAnimation = () => ({ start: () => {}, stop: () => {} });

export const Animated = {
  View: host("Animated.View"),
  Value: AnimatedValue,
  timing: noopAnimation,
  sequence: noopAnimation,
  loop: noopAnimation,
};

export const Easing = {
  ease: (t: number) => t,
  inOut: (fn: (t: number) => number) => fn,
};

let colorScheme: "light" | "dark" | null = "light";

export function useColorScheme() {
  return colorScheme;
}

/** Test-only escape hatch used to check the dark palette. */
export function __setColorScheme(next: "light" | "dark" | null) {
  colorScheme = next;
}

/** Flattens the nested style arrays react-native accepts. */
export function flatten(style: unknown): Record<string, unknown> {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce<Record<string, unknown>>(
      (acc, entry) => ({ ...acc, ...flatten(entry) }),
      {}
    );
  }
  return style as Record<string, unknown>;
}
