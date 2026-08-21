import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";

import type { ScrollViewProps, StyleProp, ViewStyle } from "react-native";

export type AttachmentGroupProps = ScrollViewProps & {
  /** Space between attachments. Defaults to `12`. */
  gap?: number;
  /** Set false to lay the row out without snapping. Defaults to `true`. */
  snap?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

/**
 * Horizontally scrollable, snapping row of attachments. Edge fading needs a
 * gradient dependency, so it is left to the consumer.
 */
export function AttachmentGroup({
  gap = 12,
  snap = true,
  contentContainerStyle,
  horizontal = true,
  showsHorizontalScrollIndicator = false,
  ...props
}: AttachmentGroupProps) {
  return (
    <ScrollView
      horizontal={horizontal}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      snapToAlignment={snap ? "start" : undefined}
      decelerationRate={snap ? "fast" : "normal"}
      disableIntervalMomentum={snap}
      {...props}
      contentContainerStyle={[
        styles.content,
        { gap },
        contentContainerStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
});
