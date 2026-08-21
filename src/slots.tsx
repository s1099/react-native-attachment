import * as React from "react";

/** Marker letting the root detect which parts are among its children. */
export type SlotName =
  | "attachment-media"
  | "attachment-content"
  | "attachment-actions"
  | "attachment-trigger";

export type SlottedComponent<P> = React.FunctionComponent<P> & {
  slotName: SlotName;
};

export function withSlot<P>(
  component: React.FunctionComponent<P>,
  slotName: SlotName
): SlottedComponent<P> {
  const slotted = component as SlottedComponent<P>;
  slotted.slotName = slotName;
  return slotted;
}

/** Walks children (descending into fragments and arrays) looking for a slot. */
export function hasSlot(children: React.ReactNode, slotName: SlotName): boolean {
  let found = false;

  React.Children.forEach(children, (child) => {
    if (found || !React.isValidElement(child)) return;

    if ((child.type as Partial<SlottedComponent<unknown>>)?.slotName === slotName) {
      found = true;
      return;
    }

    if (child.type === React.Fragment) {
      const fragmentProps = child.props as { children?: React.ReactNode };
      found = hasSlot(fragmentProps.children, slotName);
    }
  });

  return found;
}

/**
 * Allows a part's children to be a render function, so consumers can read the
 * colour and size the part would give an icon:
 * `<AttachmentMedia>{({ color, size }) => <FileIcon color={color} size={size} />}</AttachmentMedia>`
 */
export type SlotChildren<A> = React.ReactNode | ((args: A) => React.ReactNode);

export function renderSlotChildren<A>(
  children: SlotChildren<A>,
  args: A
): React.ReactNode {
  return typeof children === "function"
    ? (children as (args: A) => React.ReactNode)(args)
    : children;
}
