# react-native-attachment

Displays file and image attachments with media, metadata, upload states and
interactive actions for chat composers, message threads and upload lists.

<img src="https://raw.githubusercontent.com/s1099/react-native-attachment/main/images/screenshot.png" alt="react-native-attachment screenshot" width="280">

- **Zero runtime dependencies.** Only `react` and `react-native` peers — no
  Reanimated, no gradient library, no styling framework.
- **Composable parts**, so each attachment is assembled from only what it needs.
- **Five upload states** (`idle`, `uploading`, `processing`, `error`, `done`),
  three sizes, two orientations.
- **Themeable tokens** with automatic light/dark support.
- Written in TypeScript, ships types and both ESM and CJS builds.

## Install

```bash
bun add react-native-attachment
# npm install react-native-attachment
```

## Usage

```tsx
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  formatFileSize,
} from "react-native-attachment"
import { FileText, X } from "lucide-react-native"

<Attachment>
  <AttachmentMedia>
    {({ color, size }) => <FileText color={color} size={size} />}
  </AttachmentMedia>
  <AttachmentContent>
    <AttachmentTitle>sales-dashboard.pdf</AttachmentTitle>
    <AttachmentDescription>
      PDF · {formatFileSize(2_400_000)}
    </AttachmentDescription>
  </AttachmentContent>
  <AttachmentActions>
    <AttachmentAction
      accessibilityLabel="Remove sales-dashboard.pdf"
      onPress={remove}
    >
      {({ color, size }) => <X color={color} size={size} />}
    </AttachmentAction>
  </AttachmentActions>
</Attachment>
```

Any part's children may be a plain node or a function. The function form hands
you the colour and icon size that part expects for the current size, state and
orientation, so icons stay in step with the card without you wiring it up.

## Composition

```
AttachmentGroup
└── Attachment
    ├── AttachmentMedia
    │   └── AttachmentImage      (image previews)
    ├── AttachmentContent
    │   ├── AttachmentTitle
    │   └── AttachmentDescription
    ├── AttachmentTrigger        (render before the actions)
    └── AttachmentActions
        └── AttachmentAction
```

## Examples

### Upload states

```tsx
<Attachment state="uploading">
  <AttachmentMedia>{({ color, size }) => <Upload color={color} size={size} />}</AttachmentMedia>
  <AttachmentContent>
    <AttachmentTitle>report.xlsx</AttachmentTitle>
    <AttachmentDescription>Uploading… 45%</AttachmentDescription>
  </AttachmentContent>
</Attachment>
```

`uploading` and `processing` pulse the title, `error` recolours the border,
media well and description, and `idle` draws a dashed border.

### Image preview, vertical

```tsx
<Attachment orientation="vertical" state="done">
  <AttachmentMedia variant="image">
    <AttachmentImage source={{ uri: photo.uri }} />
  </AttachmentMedia>
  <AttachmentContent>
    <AttachmentTitle>{photo.name}</AttachmentTitle>
  </AttachmentContent>
  <AttachmentActions>
    <AttachmentAction variant="secondary" accessibilityLabel="Remove photo" onPress={remove}>
      {({ color, size }) => <X color={color} size={size} />}
    </AttachmentAction>
  </AttachmentActions>
</Attachment>
```

In the vertical orientation the media fills the card width and the actions float
in the top-right corner.

### Whole-card press target

```tsx
<Attachment>
  <AttachmentMedia>{/* … */}</AttachmentMedia>
  <AttachmentContent>{/* … */}</AttachmentContent>

  {/* Render the trigger BEFORE the actions so the buttons stay on top. */}
  <AttachmentTrigger accessibilityLabel="Open invoice.pdf" onPress={open} />

  <AttachmentActions>
    <AttachmentAction accessibilityLabel="Remove invoice.pdf" onPress={remove}>
      {({ color, size }) => <X color={color} size={size} />}
    </AttachmentAction>
  </AttachmentActions>
</Attachment>
```

Use `asChild` to hand the overlay to your own pressable (a router `Link`, for
example):

```tsx
<AttachmentTrigger asChild>
  <Link href={`/files/${file.id}`} accessibilityLabel={`Open ${file.name}`} />
</AttachmentTrigger>
```

### Scrollable row

```tsx
<AttachmentGroup>
  {files.map((file) => (
    <Attachment key={file.id} size="sm" state={file.state}>
      {/* … */}
    </Attachment>
  ))}
</AttachmentGroup>
```

## Theming

Components work with no setup, following the system colour scheme. Wrap a
subtree to pin a scheme or override tokens:

```tsx
import { AttachmentThemeProvider } from "react-native-attachment"

<AttachmentThemeProvider
  colorScheme="system"
  theme={{ colors: { card: "#0b1120", border: "#1e293b" }, radii: { xl: 16 } }}
>
  <App />
</AttachmentThemeProvider>
```

Overrides are shallow-merged onto the resolved base palette, so you only name
what you change. `lightAttachmentTheme`, `darkAttachmentTheme`,
`createAttachmentTheme` and `useAttachmentTheme` are exported for building on
top of the tokens.

## API

### `Attachment`

Extends `ViewProps`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `state` | `"idle" \| "uploading" \| "processing" \| "error" \| "done"` | `"done"` | Upload lifecycle state |
| `size` | `"default" \| "sm" \| "xs"` | `"default"` | Attachment size |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Media placement |

### `AttachmentMedia`

Extends `ViewProps`. Children may be a function receiving
`{ color, size, state }`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `"icon" \| "image"` | `"icon"` | `image` dims the preview until the upload settles |

### `AttachmentImage`

Extends `ImageProps`. Fills its `AttachmentMedia` with `resizeMode="cover"`.

### `AttachmentContent` / `AttachmentTitle` / `AttachmentDescription`

`AttachmentContent` extends `ViewProps`; the two text parts extend `TextProps`
and truncate to one line by default (`numberOfLines={1}`). The title pulses
while the state is `uploading` or `processing`.

### `AttachmentActions`

Extends `ViewProps`. A row in the horizontal orientation; absolutely positioned
in the top-right corner in the vertical one.

### `AttachmentAction`

Extends `PressableProps`. Children may be a function receiving
`{ color, size, pressed }`.

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `"ghost" \| "secondary" \| "outline" \| "destructive"` | `"ghost"` |
| `size` | `"icon-xs" \| "icon-sm" \| "icon"` | `"icon-xs"` |

### `AttachmentTrigger`

Extends `PressableProps`. Absolutely fills the card at `zIndex: 10`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | `false` | Use the single child as the trigger instead of a `Pressable` |

### `AttachmentGroup`

Extends `ScrollViewProps`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `gap` | `number` | `12` | Space between attachments |
| `snap` | `boolean` | `true` | Snap each attachment to the start edge |

### `formatFileSize(bytes, options?)`

Formats a byte count for a description, e.g. `formatFileSize(2_400_000)` →
`"2.4 MB"`. Options: `binary` (KiB/MiB units), `maximumFractionDigits`,
`locale`.

## Design notes

- **State cascade.** `state`, `size` and `orientation` travel down through
  context, and the root resolves its own padding by inspecting which parts are
  present among its children.
- **Shimmer.** `uploading` and `processing` pulse the title's opacity rather
  than sweeping a gradient across it, which would need a native dependency.
  `Shimmer` is exported if you want to reuse it or swap it out.
- **Press feedback.** There is no hover on touch devices, so the card
  highlights while the `AttachmentTrigger` is pressed.
- **Group edge fade.** Not built in, since it needs a gradient — overlay your
  own if you want it.
- **Ordering.** On Android, touch order follows child order more strictly than
  `zIndex` does, so render `AttachmentTrigger` before `AttachmentActions`.

## Development

```bash
bun install
bun test        # renders the components against a react-native stub
bun run typecheck
bun run build   # dist/index.js, dist/index.cjs, dist/types
```

## License

MIT
