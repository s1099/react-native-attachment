import * as React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Shimmer } from "./shimmer";
import { useAttachmentContext } from "./context";
import { useAttachmentTheme } from "./theme";
import { withSlot } from "./slots";

import type { StyleProp, TextProps, ViewProps, ViewStyle } from "react-native";

export type AttachmentContentProps = ViewProps & {
  style?: StyleProp<ViewStyle>;
};

function AttachmentContentImpl({ style, ...props }: AttachmentContentProps) {
  const { orientation } = useAttachmentContext("AttachmentContent");
  const isVertical = orientation === "vertical";

  return (
    <View
      {...props}
      style={[
        styles.content,
        isVertical ? styles.contentVertical : styles.contentHorizontal,
        style,
      ]}
    />
  );
}

export const AttachmentContent = withSlot(
  AttachmentContentImpl,
  "attachment-content"
);

export type AttachmentTitleProps = TextProps;

export function AttachmentTitle({
  style,
  numberOfLines = 1,
  ...props
}: AttachmentTitleProps) {
  const theme = useAttachmentTheme();
  const { state, tokens } = useAttachmentContext("AttachmentTitle");
  const shimmering = state === "uploading" || state === "processing";

  return (
    <Shimmer active={shimmering}>
      <Text
        numberOfLines={numberOfLines}
        {...props}
        style={[
          styles.title,
          {
            fontSize: tokens.titleFontSize,
            color: theme.colors.cardForeground,
          },
          style,
        ]}
      />
    </Shimmer>
  );
}

export type AttachmentDescriptionProps = TextProps;

export function AttachmentDescription({
  style,
  numberOfLines = 1,
  ...props
}: AttachmentDescriptionProps) {
  const theme = useAttachmentTheme();
  const { state, tokens } = useAttachmentContext("AttachmentDescription");

  return (
    <Text
      numberOfLines={numberOfLines}
      {...props}
      style={[
        styles.description,
        {
          fontSize: tokens.descriptionFontSize,
          color:
            state === "error"
              ? theme.colors.destructive
              : theme.colors.mutedForeground,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    maxWidth: "100%",
    minWidth: 0,
  },
  contentHorizontal: {
    flex: 1,
    flexShrink: 1,
  },
  contentVertical: {
    width: "100%",
    paddingHorizontal: 4,
  },
  title: {
    fontWeight: "500",
  },
  description: {
    marginTop: 2,
  },
});
