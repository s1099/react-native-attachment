import * as React from "react";
import { Image, StyleSheet, View } from "react-native";

import { AttachmentProvider, useAttachmentContext } from "./context";
import { hasSlot, renderSlotChildren, withSlot } from "./slots";
import { sizeTokens } from "./tokens";
import { useAttachmentTheme } from "./theme";

import type { ImageProps, StyleProp, ViewProps, ViewStyle } from "react-native";
import type { SlotChildren } from "./slots";
import type {
  AttachmentOrientation,
  AttachmentSize,
  AttachmentState,
} from "./tokens";

export type AttachmentProps = Omit<ViewProps, "children"> & {
  children?: React.ReactNode;
  /** Upload lifecycle state. Defaults to `"done"`. */
  state?: AttachmentState;
  /** Attachment size. Defaults to `"default"`. */
  size?: AttachmentSize;
  /** Media placement. Defaults to `"horizontal"`. */
  orientation?: AttachmentOrientation;
  style?: StyleProp<ViewStyle>;
};

export function Attachment({
  children,
  state = "done",
  size = "default",
  orientation = "horizontal",
  style,
  ...props
}: AttachmentProps) {
  const theme = useAttachmentTheme();
  const tokens = sizeTokens[size];
  const [pressed, setPressed] = React.useState(false);

  const hasMedia = hasSlot(children, "attachment-media");
  const hasContent = hasSlot(children, "attachment-content");
  const hasTrigger = hasSlot(children, "attachment-trigger");

  const context = React.useMemo(
    () => ({
      state,
      size,
      orientation,
      tokens,
      hasMedia,
      hasContent,
      pressed,
      setPressed,
    }),
    [state, size, orientation, tokens, hasMedia, hasContent, pressed]
  );

  const isVertical = orientation === "vertical";

  // Media contributes a uniform pad; content then overrides the horizontal
  // and vertical values.
  const padding: ViewStyle = {
    ...(hasMedia ? { padding: tokens.mediaPadding } : null),
    ...(hasContent
      ? {
          paddingHorizontal: tokens.paddingHorizontal,
          paddingVertical: tokens.paddingVertical,
        }
      : null),
  };

  return (
    <AttachmentProvider value={context}>
      <View
        {...props}
        style={[
          styles.root,
          {
            flexDirection: isVertical ? "column" : "row",
            alignItems: isVertical ? "stretch" : "center",
            gap: tokens.gap,
            borderRadius: theme.radii[tokens.radius],
            borderStyle: state === "idle" ? "dashed" : "solid",
            borderColor:
              state === "error"
                ? theme.colors.destructiveBorder
                : theme.colors.border,
            backgroundColor:
              hasTrigger && pressed
                ? theme.colors.cardPressed
                : theme.colors.card,
          },
          isVertical
            ? {
                width: hasContent
                  ? tokens.verticalWidthWithContent
                  : tokens.verticalWidth,
              }
            : { minWidth: tokens.minWidth },
          padding,
          style,
        ]}
      >
        {children}
      </View>
    </AttachmentProvider>
  );
}

export type AttachmentMediaVariant = "icon" | "image";

export type AttachmentMediaChildArgs = {
  /** Colour the media well expects its icon to use. */
  color: string;
  /** Icon size for the current attachment size and orientation. */
  size: number;
  state: AttachmentState;
};

export type AttachmentMediaProps = Omit<ViewProps, "children"> & {
  children?: SlotChildren<AttachmentMediaChildArgs>;
  /** `"icon"` (default) renders a centred glyph, `"image"` a preview. */
  variant?: AttachmentMediaVariant;
  style?: StyleProp<ViewStyle>;
};

function AttachmentMediaImpl({
  children,
  variant = "icon",
  style,
  ...props
}: AttachmentMediaProps) {
  const theme = useAttachmentTheme();
  const { state, orientation, tokens } = useAttachmentContext("AttachmentMedia");

  const isError = state === "error";
  const color = isError ? theme.colors.destructive : theme.colors.cardForeground;
  const iconSize =
    orientation === "vertical" ? tokens.verticalIconSize : tokens.iconSize;

  // Previews dim until the upload settles; icons never do.
  const dimmed =
    variant === "image" && state !== "done" && state !== "idle";

  return (
    <View
      {...props}
      style={[
        styles.media,
        {
          width: orientation === "vertical" ? "100%" : tokens.mediaSize,
          borderRadius: theme.radii[tokens.mediaRadius],
          backgroundColor: isError
            ? theme.colors.destructiveMuted
            : theme.colors.muted,
          opacity: dimmed ? 0.6 : 1,
        },
        style,
      ]}
    >
      {renderSlotChildren(children, { color, size: iconSize, state })}
    </View>
  );
}

export const AttachmentMedia = withSlot(AttachmentMediaImpl, "attachment-media");

export type AttachmentImageProps = ImageProps;

/**
 * Preview image sized to fill an `AttachmentMedia`, cropped to cover.
 */
export function AttachmentImage({ style, ...props }: AttachmentImageProps) {
  return (
    <Image resizeMode="cover" {...props} style={[styles.image, style]} />
  );
}

const styles = StyleSheet.create({
  root: {
    position: "relative",
    alignSelf: "flex-start",
    maxWidth: "100%",
    flexShrink: 0,
    borderWidth: 1,
  },
  media: {
    position: "relative",
    aspectRatio: 1,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
