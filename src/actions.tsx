import * as React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { renderSlotChildren, withSlot } from "./slots";
import { actionSizeTokens } from "./tokens";
import { useAttachmentContext } from "./context";
import { useAttachmentTheme } from "./theme";

import type {
  PressableProps,
  StyleProp,
  ViewProps,
  ViewStyle,
} from "react-native";
import type { SlotChildren } from "./slots";
import type { AttachmentActionSize } from "./tokens";

export type AttachmentActionsProps = ViewProps & {
  style?: StyleProp<ViewStyle>;
};

function AttachmentActionsImpl({ style, ...props }: AttachmentActionsProps) {
  const { orientation, tokens } = useAttachmentContext("AttachmentActions");
  const isVertical = orientation === "vertical";

  return (
    <View
      {...props}
      style={[
        styles.actions,
        isVertical
          ? styles.actionsVertical
          : { gap: Math.round(tokens.gap / 2) },
        style,
      ]}
    />
  );
}

export const AttachmentActions = withSlot(
  AttachmentActionsImpl,
  "attachment-actions"
);

export type AttachmentActionVariant =
  | "ghost"
  | "secondary"
  | "outline"
  | "destructive";

export type AttachmentActionChildArgs = {
  /** Colour the button expects its icon to use. */
  color: string;
  /** Icon size for the current action size. */
  size: number;
  pressed: boolean;
};

export type AttachmentActionProps = Omit<
  PressableProps,
  "children" | "style"
> & {
  children?: SlotChildren<AttachmentActionChildArgs>;
  /** Defaults to `"ghost"`. */
  variant?: AttachmentActionVariant;
  /** Defaults to `"icon-xs"`. */
  size?: AttachmentActionSize;
  style?: StyleProp<ViewStyle>;
};

type ActionPalette = {
  background: string;
  pressedBackground: string;
  color: string;
  borderColor?: string;
};

export function AttachmentAction({
  children,
  variant = "ghost",
  size = "icon-xs",
  style,
  disabled,
  accessibilityRole = "button",
  hitSlop = 6,
  ...props
}: AttachmentActionProps) {
  const theme = useAttachmentTheme();
  const action = actionSizeTokens[size];

  const palette: Record<AttachmentActionVariant, ActionPalette> = {
    ghost: {
      background: "transparent",
      pressedBackground: theme.colors.accent,
      color: theme.colors.cardForeground,
    },
    secondary: {
      background: theme.colors.muted,
      pressedBackground: theme.colors.accent,
      color: theme.colors.cardForeground,
    },
    outline: {
      background: "transparent",
      pressedBackground: theme.colors.accent,
      color: theme.colors.cardForeground,
      borderColor: theme.colors.border,
    },
    destructive: {
      background: theme.colors.destructiveMuted,
      pressedBackground: theme.colors.destructiveMuted,
      color: theme.colors.destructive,
    },
  };

  const colors = palette[variant];

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      hitSlop={hitSlop}
      disabled={disabled}
      {...props}
      style={({ pressed }) => [
        styles.action,
        {
          width: action.size,
          height: action.size,
          borderRadius: theme.radii.md,
          backgroundColor: pressed
            ? colors.pressedBackground
            : colors.background,
          borderWidth: colors.borderColor ? 1 : 0,
          borderColor: colors.borderColor,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {({ pressed }) =>
        renderSlotChildren(children, {
          color: colors.color,
          size: action.iconSize,
          pressed,
        })
      }
    </Pressable>
  );
}

/** Runs the library's handler first, then the consumer's. */
function compose<E>(
  ours: (event: E) => void,
  theirs?: ((event: E) => void) | null
) {
  return (event: E) => {
    ours(event);
    theirs?.(event);
  };
}

export type AttachmentTriggerProps = Omit<PressableProps, "style"> & {
  /**
   * Renders the single child as the trigger instead of a `Pressable`. The
   * child receives the overlay style and the press handlers.
   */
  asChild?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Full-card overlay press target. Render it *before* `AttachmentActions` so the
 * action buttons stay on top and independently pressable on Android.
 */
function AttachmentTriggerImpl({
  asChild = false,
  style,
  onPressIn,
  onPressOut,
  accessibilityRole = "button",
  ...props
}: AttachmentTriggerProps) {
  const { setPressed } = useAttachmentContext("AttachmentTrigger");

  const handlePressIn = compose<Parameters<
    NonNullable<PressableProps["onPressIn"]>
  >[0]>(() => setPressed(true), onPressIn);

  const handlePressOut = compose<Parameters<
    NonNullable<PressableProps["onPressOut"]>
  >[0]>(() => setPressed(false), onPressOut);

  const overlayStyle: StyleProp<ViewStyle> = [styles.trigger, style];

  if (asChild) {
    const { children, ...triggerProps } = props;
    const child = React.Children.only(children) as React.ReactElement<
      PressableProps & { style?: StyleProp<ViewStyle> }
    >;

    return React.cloneElement(child, {
      ...triggerProps,
      ...child.props,
      style: [overlayStyle, child.props.style],
      onPressIn: compose(handlePressIn, child.props.onPressIn),
      onPressOut: compose(handlePressOut, child.props.onPressOut),
    });
  }

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={overlayStyle}
    />
  );
}

export const AttachmentTrigger = withSlot(
  AttachmentTriggerImpl,
  "attachment-trigger"
);

const styles = StyleSheet.create({
  actions: {
    position: "relative",
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  actionsVertical: {
    position: "absolute",
    top: 12,
    right: 12,
    gap: 4,
  },
  action: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  trigger: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
  },
});
