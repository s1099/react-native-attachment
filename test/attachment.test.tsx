import { describe, expect, test } from "bun:test";
import * as React from "react";
import TestRenderer from "react-test-renderer";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentThemeProvider,
  AttachmentTitle,
  AttachmentTrigger,
  darkAttachmentTheme,
  formatFileSize,
  lightAttachmentTheme,
} from "../src";
import { flatten } from "./react-native-stub";

import type { ReactTestRenderer } from "react-test-renderer";

function render(element: React.ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(element);
  });
  return renderer;
}

/** Flattened style of the outermost host view. */
function rootStyle(renderer: ReactTestRenderer) {
  const root = renderer.root.findAllByType("View" as never)[0];
  return flatten(root?.props.style);
}

function styleOfNth(renderer: ReactTestRenderer, type: string, index: number) {
  const node = renderer.root.findAllByType(type as never)[index];
  return flatten(node?.props.style);
}

function stylesOf(renderer: ReactTestRenderer, type: string) {
  return renderer.root
    .findAllByType(type as never)
    .map((node) => flatten(node.props.style));
}

const icon = <React.Fragment />;

function basicAttachment(
  props: Partial<React.ComponentProps<typeof Attachment>> = {}
) {
  return (
    <Attachment {...props}>
      <AttachmentMedia>{icon}</AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>sales-dashboard.pdf</AttachmentTitle>
        <AttachmentDescription>PDF - 2.4 MB</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction accessibilityLabel="Remove sales-dashboard.pdf">
          {icon}
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  );
}

function CustomLink(props: Record<string, unknown>) {
  return React.createElement("CustomLink", props);
}

describe("Attachment", () => {
  test("renders title and description text", () => {
    const json = JSON.stringify(render(basicAttachment()).toJSON());
    expect(json).toContain("sales-dashboard.pdf");
    expect(json).toContain("PDF - 2.4 MB");
  });

  test("pads for both media and content, with content winning the axes", () => {
    const style = rootStyle(render(basicAttachment()));
    expect(style.padding).toBe(8);
    expect(style.paddingHorizontal).toBe(10);
    expect(style.paddingVertical).toBe(8);
  });

  test("media-only attachments only get the uniform media padding", () => {
    const style = rootStyle(
      render(
        <Attachment>
          <AttachmentMedia>{icon}</AttachmentMedia>
        </Attachment>
      )
    );
    expect(style.padding).toBe(8);
    expect(style.paddingHorizontal).toBeUndefined();
  });

  test("detects slots nested inside fragments", () => {
    const renderer = render(
      <Attachment>
        <>
          <AttachmentContent>
            <AttachmentTitle>a.pdf</AttachmentTitle>
          </AttachmentContent>
        </>
      </Attachment>
    );
    expect(rootStyle(renderer).paddingHorizontal).toBe(10);
  });

  test("sizes change gap, radius and media dimensions", () => {
    const xs = render(basicAttachment({ size: "xs" }));
    expect(rootStyle(xs).gap).toBe(6);
    expect(rootStyle(xs).borderRadius).toBe(lightAttachmentTheme.radii.lg);
    expect(styleOfNth(xs, "View", 1).width).toBe(28);

    const base = render(basicAttachment());
    expect(rootStyle(base).borderRadius).toBe(lightAttachmentTheme.radii.xl);
    expect(styleOfNth(base, "View", 1).width).toBe(40);
  });

  test("idle state uses a dashed border", () => {
    expect(
      rootStyle(render(basicAttachment({ state: "idle" }))).borderStyle
    ).toBe("dashed");
    expect(rootStyle(render(basicAttachment())).borderStyle).toBe("solid");
  });

  test("error state recolours the border, media well and description", () => {
    const renderer = render(basicAttachment({ state: "error" }));
    const { colors } = lightAttachmentTheme;

    expect(rootStyle(renderer).borderColor).toBe(colors.destructiveBorder);
    expect(styleOfNth(renderer, "View", 1).backgroundColor).toBe(
      colors.destructiveMuted
    );
    expect(styleOfNth(renderer, "Text", 1).color).toBe(colors.destructive);
  });

  test("image previews dim until the upload settles", () => {
    const opacityFor = (
      state: React.ComponentProps<typeof Attachment>["state"]
    ) =>
      styleOfNth(
        render(
          <Attachment state={state}>
            <AttachmentMedia variant="image">{icon}</AttachmentMedia>
          </Attachment>
        ),
        "View",
        1
      ).opacity;

    expect(opacityFor("uploading")).toBe(0.6);
    expect(opacityFor("processing")).toBe(0.6);
    expect(opacityFor("done")).toBe(1);
    expect(opacityFor("idle")).toBe(1);
  });

  test("vertical orientation widens only when content is present", () => {
    const withContent = render(basicAttachment({ orientation: "vertical" }));
    expect(rootStyle(withContent).width).toBe(120);
    expect(rootStyle(withContent).flexDirection).toBe("column");

    const mediaOnly = render(
      <Attachment orientation="vertical">
        <AttachmentMedia>{icon}</AttachmentMedia>
      </Attachment>
    );
    expect(rootStyle(mediaOnly).width).toBe(96);
    expect(styleOfNth(mediaOnly, "View", 1).width).toBe("100%");
  });

  test("vertical actions float over the card", () => {
    const renderer = render(basicAttachment({ orientation: "vertical" }));
    const actions = stylesOf(renderer, "View").find(
      (style) => style.zIndex === 20
    );

    expect(actions?.position).toBe("absolute");
    expect(actions?.top).toBe(12);
  });

  test("parts rendered outside a root throw a helpful error", () => {
    expect(() => render(<AttachmentTitle>orphan.pdf</AttachmentTitle>)).toThrow(
      /must be rendered inside an <Attachment/
    );
  });
});

describe("AttachmentMedia children as a function", () => {
  test("receives the icon colour and size for the current size", () => {
    let received: { color: string; size: number } | undefined;

    render(
      <Attachment size="xs">
        <AttachmentMedia>
          {(args) => {
            received = args;
            return null;
          }}
        </AttachmentMedia>
      </Attachment>
    );

    expect(received?.size).toBe(14);
    expect(received?.color).toBe(lightAttachmentTheme.colors.cardForeground);
  });

  test("uses the larger icon size in the vertical orientation", () => {
    let received: { size: number } | undefined;

    render(
      <Attachment orientation="vertical">
        <AttachmentMedia>
          {(args) => {
            received = args;
            return null;
          }}
        </AttachmentMedia>
      </Attachment>
    );

    expect(received?.size).toBe(24);
  });

  test("switches to the destructive colour in the error state", () => {
    let received: { color: string } | undefined;

    render(
      <Attachment state="error">
        <AttachmentMedia>
          {(args) => {
            received = args;
            return null;
          }}
        </AttachmentMedia>
      </Attachment>
    );

    expect(received?.color).toBe(lightAttachmentTheme.colors.destructive);
  });
});

describe("AttachmentTrigger", () => {
  test("covers the card beneath the actions", () => {
    const renderer = render(
      <Attachment>
        <AttachmentContent>
          <AttachmentTitle>a.pdf</AttachmentTitle>
        </AttachmentContent>
        <AttachmentTrigger accessibilityLabel="Open a.pdf" onPress={() => {}} />
        <AttachmentActions>
          <AttachmentAction accessibilityLabel="Remove a.pdf">
            {icon}
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    );

    const trigger = stylesOf(renderer, "Pressable").find(
      (style) => style.position === "absolute"
    );

    expect(trigger?.zIndex).toBe(10);
    expect(trigger?.left).toBe(0);
  });

  test("press highlights the card and restores it on release", () => {
    const renderer = render(
      <Attachment>
        <AttachmentContent>
          <AttachmentTitle>a.pdf</AttachmentTitle>
        </AttachmentContent>
        <AttachmentTrigger accessibilityLabel="Open a.pdf" />
      </Attachment>
    );

    const { colors } = lightAttachmentTheme;
    expect(rootStyle(renderer).backgroundColor).toBe(colors.card);

    const trigger = renderer.root.findAllByType("Pressable" as never)[0]!;
    TestRenderer.act(() => trigger.props.onPressIn?.({}));
    expect(rootStyle(renderer).backgroundColor).toBe(colors.cardPressed);

    TestRenderer.act(() => trigger.props.onPressOut?.({}));
    expect(rootStyle(renderer).backgroundColor).toBe(colors.card);
  });

  test("asChild forwards press handling to the provided element", () => {
    let pressed = false;
    let childPressIn = false;

    const renderer = render(
      <Attachment>
        <AttachmentContent>
          <AttachmentTitle>a.pdf</AttachmentTitle>
        </AttachmentContent>
        <AttachmentTrigger
          asChild
          onPress={() => {
            pressed = true;
          }}
        >
          <CustomLink
            onPressIn={() => {
              childPressIn = true;
            }}
          />
        </AttachmentTrigger>
      </Attachment>
    );

    const link = renderer.root.findByType("CustomLink" as never);
    expect(flatten(link.props.style).zIndex).toBe(10);

    link.props.onPress?.({});
    TestRenderer.act(() => link.props.onPressIn?.({}));

    expect(pressed).toBe(true);
    expect(childPressIn).toBe(true);
    expect(rootStyle(renderer).backgroundColor).toBe(
      lightAttachmentTheme.colors.cardPressed
    );
  });
});

describe("AttachmentAction", () => {
  test("defaults to a ghost icon-xs button", () => {
    const button = stylesOf(render(basicAttachment()), "Pressable").find(
      (style) => style.width === 24
    );

    expect(button?.height).toBe(24);
    expect(button?.backgroundColor).toBe("transparent");
    expect(button?.borderWidth).toBe(0);
  });

  test("outline draws a border, destructive tints the surface", () => {
    const renderer = render(
      <Attachment>
        <AttachmentActions>
          <AttachmentAction variant="outline" accessibilityLabel="a">
            {icon}
          </AttachmentAction>
          <AttachmentAction variant="destructive" accessibilityLabel="b">
            {icon}
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    );

    const [outline, destructive] = stylesOf(renderer, "Pressable");

    expect(outline?.borderWidth).toBe(1);
    expect(outline?.borderColor).toBe(lightAttachmentTheme.colors.border);
    expect(destructive?.backgroundColor).toBe(
      lightAttachmentTheme.colors.destructiveMuted
    );
  });

  test("dims when disabled", () => {
    const renderer = render(
      <Attachment>
        <AttachmentActions>
          <AttachmentAction disabled accessibilityLabel="a">
            {icon}
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    );
    expect(styleOfNth(renderer, "Pressable", 0).opacity).toBe(0.5);
  });

  test("sizes map to the button dimensions", () => {
    const renderer = render(
      <Attachment>
        <AttachmentActions>
          <AttachmentAction size="icon-sm" accessibilityLabel="a">
            {icon}
          </AttachmentAction>
          <AttachmentAction size="icon" accessibilityLabel="b">
            {icon}
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    );

    const [small, regular] = stylesOf(renderer, "Pressable");
    expect(small?.width).toBe(32);
    expect(regular?.width).toBe(36);
  });
});

describe("AttachmentGroup", () => {
  test("scrolls horizontally with snapping by default", () => {
    const renderer = render(
      <AttachmentGroup>
        {basicAttachment()}
        {basicAttachment()}
      </AttachmentGroup>
    );

    const scroll = renderer.root.findByType("ScrollView" as never);
    expect(scroll.props.horizontal).toBe(true);
    expect(scroll.props.snapToAlignment).toBe("start");
    expect(flatten(scroll.props.contentContainerStyle).gap).toBe(12);
  });

  test("snap can be turned off and the gap overridden", () => {
    const renderer = render(<AttachmentGroup snap={false} gap={4} />);
    const scroll = renderer.root.findByType("ScrollView" as never);

    expect(scroll.props.snapToAlignment).toBeUndefined();
    expect(flatten(scroll.props.contentContainerStyle).gap).toBe(4);
  });
});

describe("theming", () => {
  test("the provider pins a palette", () => {
    const renderer = render(
      <AttachmentThemeProvider colorScheme="dark">
        {basicAttachment()}
      </AttachmentThemeProvider>
    );
    expect(rootStyle(renderer).backgroundColor).toBe(
      darkAttachmentTheme.colors.card
    );
  });

  test("token overrides merge onto the base palette", () => {
    const renderer = render(
      <AttachmentThemeProvider
        colorScheme="light"
        theme={{ colors: { card: "#ff00ff" }, radii: { xl: 20 } }}
      >
        {basicAttachment()}
      </AttachmentThemeProvider>
    );

    const style = rootStyle(renderer);
    expect(style.backgroundColor).toBe("#ff00ff");
    expect(style.borderRadius).toBe(20);
    expect(style.borderColor).toBe(lightAttachmentTheme.colors.border);
  });

  test("works without a provider", () => {
    expect(rootStyle(render(basicAttachment())).backgroundColor).toBe(
      lightAttachmentTheme.colors.card
    );
  });
});

describe("formatFileSize", () => {
  test("formats decimal units", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1_500)).toBe("1.5 KB");
    expect(formatFileSize(2_400_000)).toBe("2.4 MB");
  });

  test("formats binary units on request", () => {
    expect(formatFileSize(1024, { binary: true })).toBe("1 KiB");
    expect(formatFileSize(1_048_576, { binary: true })).toBe("1 MiB");
  });

  test("returns an empty string for invalid input", () => {
    expect(formatFileSize(-1)).toBe("");
    expect(formatFileSize(Number.NaN)).toBe("");
  });
});
