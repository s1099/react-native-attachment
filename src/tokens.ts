export type AttachmentState =
  | "idle"
  | "uploading"
  | "processing"
  | "error"
  | "done";

export type AttachmentSize = "default" | "sm" | "xs";

export type AttachmentOrientation = "horizontal" | "vertical";

export type SizeTokens = {
  /** Gap between media, content and actions. */
  gap: number;
  /** Horizontal root padding, applied when content is present. */
  paddingHorizontal: number;
  /** Vertical root padding, applied when content is present. */
  paddingVertical: number;
  /** Root padding applied when media is present. */
  mediaPadding: number;
  /** Media well edge length in the horizontal orientation. */
  mediaSize: number;
  /** Corner radius of the media well. */
  mediaRadius: "md" | "lg";
  /** Suggested icon size inside the media well. */
  iconSize: number;
  /** Suggested icon size inside a vertical media well. */
  verticalIconSize: number;
  titleFontSize: number;
  descriptionFontSize: number;
  /** Root corner radius. */
  radius: "lg" | "xl";
  /** Minimum width in the horizontal orientation. */
  minWidth: number;
  /** Width in the vertical orientation. */
  verticalWidth: number;
  /** Width in the vertical orientation when content is present. */
  verticalWidthWithContent: number;
};

export const sizeTokens: Record<AttachmentSize, SizeTokens> = {
  default: {
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    mediaPadding: 8,
    mediaSize: 40,
    mediaRadius: "lg",
    iconSize: 16,
    verticalIconSize: 24,
    titleFontSize: 14,
    descriptionFontSize: 12,
    radius: "xl",
    minWidth: 160,
    verticalWidth: 96,
    verticalWidthWithContent: 120,
  },
  sm: {
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    mediaPadding: 6,
    mediaSize: 32,
    mediaRadius: "lg",
    iconSize: 16,
    verticalIconSize: 24,
    titleFontSize: 12,
    descriptionFontSize: 12,
    radius: "xl",
    minWidth: 160,
    verticalWidth: 96,
    verticalWidthWithContent: 120,
  },
  xs: {
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    mediaPadding: 4,
    mediaSize: 28,
    mediaRadius: "md",
    iconSize: 14,
    verticalIconSize: 20,
    titleFontSize: 12,
    descriptionFontSize: 11,
    radius: "lg",
    minWidth: 160,
    verticalWidth: 96,
    verticalWidthWithContent: 120,
  },
};

export type ActionSizeTokens = {
  size: number;
  iconSize: number;
};

export type AttachmentActionSize = "icon-xs" | "icon-sm" | "icon";

export const actionSizeTokens: Record<AttachmentActionSize, ActionSizeTokens> = {
  "icon-xs": { size: 24, iconSize: 14 },
  "icon-sm": { size: 32, iconSize: 16 },
  icon: { size: 36, iconSize: 16 },
};
