import * as React from "react";

import type {
  AttachmentOrientation,
  AttachmentSize,
  AttachmentState,
  SizeTokens,
} from "./tokens";

export type AttachmentContextValue = {
  state: AttachmentState;
  size: AttachmentSize;
  orientation: AttachmentOrientation;
  tokens: SizeTokens;
  /** Whether an `AttachmentMedia` is present among the root's children. */
  hasMedia: boolean;
  /** Whether an `AttachmentContent` is present among the root's children. */
  hasContent: boolean;
  /** Whether the full-card trigger is currently pressed. */
  pressed: boolean;
  setPressed: (pressed: boolean) => void;
};

const AttachmentContext = React.createContext<AttachmentContextValue | null>(
  null
);

export const AttachmentProvider = AttachmentContext.Provider;

/**
 * Reads the enclosing `Attachment`. Throws when a part is rendered outside a
 * root, since a part has no size, state or orientation of its own.
 */
export function useAttachmentContext(component: string): AttachmentContextValue {
  const context = React.useContext(AttachmentContext);
  if (!context) {
    throw new Error(`<${component} /> must be rendered inside an <Attachment />.`);
  }
  return context;
}

/** Non-throwing variant, for parts that may legitimately render standalone. */
export function useAttachmentContextOptional(): AttachmentContextValue | null {
  return React.useContext(AttachmentContext);
}
