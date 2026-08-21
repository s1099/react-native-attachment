import * as React from "react";
import { Animated, Easing } from "react-native";

import type { ViewStyle } from "react-native";

export type ShimmerProps = {
  /** When false the animation is stopped and opacity resets to 1. */
  active: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
  /** One full dim-and-back cycle, in milliseconds. */
  duration?: number;
  /** Opacity at the dimmest point of the cycle. */
  minOpacity?: number;
};

/**
 * Pulses its children while a transfer is in flight. A sweeping gradient would
 * need a native dependency, so the opacity animates instead — same signal, no
 * extra install.
 */
export function Shimmer({
  active,
  children,
  style,
  duration = 1200,
  minOpacity = 0.4,
}: ShimmerProps) {
  const progress = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!active) {
      progress.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => {
      loop.stop();
      progress.setValue(0);
    };
  }, [active, duration, progress]);

  if (!active) {
    return <Animated.View style={style}>{children}</Animated.View>;
  }

  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, minOpacity],
  });

  return <Animated.View style={[style, { opacity }]}>{children}</Animated.View>;
}
